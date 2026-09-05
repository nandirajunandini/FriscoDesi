import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

/* =========================================================
   Helpers
========================================================= */

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function readJsonSafely(response: Response) {
  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return {
      raw: text,
    };
  }
}

/* =========================================================
   POST
========================================================= */

export async function POST(req: NextRequest) {
  try {
    /* =====================================================
       1. Check server configuration
    ===================================================== */

    const strapiUrl = process.env.STRAPI_URL;
    const strapiToken = process.env.STRAPI_API_TOKEN;
    const gmailUser = process.env.GMAIL_USER;
    const gmailPass = process.env.GMAIL_PASS;

    if (!strapiUrl) {
      console.error("STRAPI_URL is missing.");

      return NextResponse.json(
        {
          success: false,
          error: "Server configuration error: STRAPI_URL is missing.",
        },
        {
          status: 500,
        }
      );
    }

    if (!strapiToken) {
      console.error("STRAPI_API_TOKEN is missing.");

      return NextResponse.json(
        {
          success: false,
          error:
            "Server configuration error: STRAPI_API_TOKEN is missing.",
        },
        {
          status: 500,
        }
      );
    }

    if (!gmailUser || !gmailPass) {
      console.error("Gmail configuration is missing.");

      return NextResponse.json(
        {
          success: false,
          error:
            "Server configuration error: Gmail credentials are missing.",
        },
        {
          status: 500,
        }
      );
    }

    /* =====================================================
       2. Read request body
    ===================================================== */

    let body: unknown;

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request body.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      typeof body !== "object" ||
      body === null
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request body.",
        },
        {
          status: 400,
        }
      );
    }

    const {
      documentId,
      userEmail,
      replyText,
    } = body as {
      documentId?: unknown;
      userEmail?: unknown;
      replyText?: unknown;
    };

    /* =====================================================
       3. Validate fields
    ===================================================== */

    if (
      typeof documentId !== "string" ||
      !documentId.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "A valid message documentId is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      typeof userEmail !== "string" ||
      !userEmail.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "A valid user email is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      typeof replyText !== "string" ||
      !replyText.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Reply message cannot be empty.",
        },
        {
          status: 400,
        }
      );
    }

    const cleanDocumentId = documentId.trim();
    const cleanEmail = userEmail.trim();
    const cleanReply = replyText.trim();

    /* =====================================================
       4. Validate email format
    ===================================================== */

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid user email address.",
        },
        {
          status: 400,
        }
      );
    }

    /* =====================================================
       5. Update Strapi FIRST
       
       IMPORTANT:
       Strapi 5 uses documentId in the URL.
       
       Example:
       PUT /api/contact-messages/<documentId>
    ===================================================== */

    const strapiEndpoint =
      `${strapiUrl.replace(/\/$/, "")}` +
      `/api/contact-messages/${encodeURIComponent(
        cleanDocumentId
      )}`;

    console.log(
      "Updating Strapi contact message:",
      {
        documentId: cleanDocumentId,
        endpoint: strapiEndpoint,
      }
    );

    const updateResponse = await fetch(
      strapiEndpoint,
      {
        method: "PUT",

        headers: {
          Authorization: `Bearer ${strapiToken}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },

        body: JSON.stringify({
          data: {
            adminReply: cleanReply,
            messageStatus: "replied",
          },
        }),

        cache: "no-store",
      }
    );

    const updateData =
      await readJsonSafely(updateResponse);

    /* =====================================================
       6. Handle Strapi update error
    ===================================================== */

    if (!updateResponse.ok) {
      console.error(
        "STRAPI UPDATE FAILED",
        {
          status: updateResponse.status,
          statusText: updateResponse.statusText,
          documentId: cleanDocumentId,
          response: updateData,
        }
      );

      const strapiError =
        updateData &&
        typeof updateData === "object" &&
        "error" in updateData
          ? (
              updateData as {
                error?: {
                  message?: string;
                  details?: unknown;
                };
              }
            ).error
          : undefined;

      return NextResponse.json(
        {
          success: false,
          error:
            strapiError?.message ||
            "Strapi could not save the admin reply.",
          details:
            process.env.NODE_ENV === "development"
              ? updateData
              : undefined,
        },
        {
          status:
            updateResponse.status >= 400 &&
            updateResponse.status < 600
              ? updateResponse.status
              : 500,
        }
      );
    }

    /* =====================================================
       7. Confirm Strapi actually returned the updated entry
    ===================================================== */

    const savedMessage =
      updateData?.data;

    if (!savedMessage) {
      console.error(
        "Strapi update succeeded but no data was returned.",
        updateData
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "The reply update was not confirmed by Strapi.",
        },
        {
          status: 500,
        }
      );
    }

    console.log(
      "Admin reply successfully saved in Strapi:",
      {
        documentId: savedMessage.documentId,
        messageStatus:
          savedMessage.messageStatus,
        hasAdminReply:
          Boolean(savedMessage.adminReply),
      }
    );

    /* =====================================================
       8. Create Gmail transporter
    ===================================================== */

    const transporter =
      nodemailer.createTransport({
        service: "gmail",

        auth: {
          user: gmailUser,
          pass: gmailPass,
        },
      });

    /* =====================================================
       9. Escape reply before putting it into HTML
    ===================================================== */

    const safeReply =
      escapeHtml(cleanReply).replace(
        /\r?\n/g,
        "<br />"
      );

    /* =====================================================
       10. Send email
    ===================================================== */

    try {
      await transporter.sendMail({
        from: gmailUser,
        to: cleanEmail,
        subject: "Reply from FriscoDesi",

        text:
          `Reply from FriscoDesi\n\n` +
          `${cleanReply}\n\n` +
          `Thank you,\n` +
          `FriscoDesi Team`,

        html: `
          <!DOCTYPE html>
          <html>
            <body>
              <h3>Reply from FriscoDesi</h3>

              <p>
                ${safeReply}
              </p>

              <br />

              <p>Thank you,</p>

              <p>
                <strong>FriscoDesi Team</strong>
              </p>
            </body>
          </html>
        `,
      });
    } catch (emailError) {
      /*
       * IMPORTANT:
       * The reply is already safely saved in Strapi.
       *
       * We don't delete it just because email failed.
       */

      console.error(
        "Reply saved, but email could not be sent:",
        emailError
      );

      return NextResponse.json(
        {
          success: false,
          saved: true,
          emailSent: false,
          error:
            "Reply was saved successfully, but the email could not be sent.",
        },
        {
          status: 502,
        }
      );
    }

    /* =====================================================
       11. Success
    ===================================================== */

    return NextResponse.json(
      {
        success: true,
        saved: true,
        emailSent: true,

        message:
          "Reply saved and sent successfully.",

        data: savedMessage,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    /* =====================================================
       Unexpected error
    ===================================================== */

    console.error(
      "Admin reply API error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Something went wrong while processing the reply.",
      },
      {
        status: 500,
      }
    );
  }
}