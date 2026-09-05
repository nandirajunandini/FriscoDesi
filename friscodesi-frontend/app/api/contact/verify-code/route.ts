import { NextResponse } from "next/server";
import crypto from "crypto";
import nodemailer from "nodemailer";

/* =========================================================
   POST - Verify Contact Email Code
========================================================= */

export async function POST(req: Request) {
  try {
    /* =====================================================
       1. Read request body
    ===================================================== */

    const body = await req.json();

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const verificationCode =
      typeof body.verificationCode === "string"
        ? body.verificationCode.trim()
        : "";

    /* =====================================================
       2. Validate fields
    ===================================================== */

    if (!email || !verificationCode) {
      return NextResponse.json(
        {
          error:
            "Email and verification code are required.",
        },
        {
          status: 400,
        }
      );
    }

    /* =====================================================
       3. Validate verification code format
    ===================================================== */

    if (!/^\d{6}$/.test(verificationCode)) {
      return NextResponse.json(
        {
          error:
            "Please enter the 6-digit verification code.",
        },
        {
          status: 400,
        }
      );
    }

    /* =====================================================
       4. Check environment variables
    ===================================================== */

    if (
      !process.env.STRAPI_URL ||
      !process.env.STRAPI_API_TOKEN ||
      !process.env.GMAIL_USER ||
      !process.env.GMAIL_PASS ||
      !process.env.ADMIN_EMAIL
    ) {
      console.error(
        "Missing required environment variables."
      );

      return NextResponse.json(
        {
          error:
            "Server configuration error.",
        },
        {
          status: 500,
        }
      );
    }

    /* =====================================================
       5. Find verification record
    ===================================================== */

    const verificationResponse =
      await fetch(
        `${process.env.STRAPI_URL}/api/email-verifications?filters[email][$eq]=${encodeURIComponent(
          email
        )}&pagination[pageSize]=1`,
        {
          method: "GET",

          headers: {
            Authorization:
              `Bearer ${process.env.STRAPI_API_TOKEN}`,
          },

          cache: "no-store",
        }
      );

    const verificationData =
      await verificationResponse.json();

    if (!verificationResponse.ok) {
      console.error(
        "Strapi verification lookup error:",
        verificationData
      );

      return NextResponse.json(
        {
          error:
            "Unable to verify your email. Please request a new code.",
        },
        {
          status: 500,
        }
      );
    }

    const records =
      verificationData?.data || [];

    /* =====================================================
       6. No verification record
    ===================================================== */

    if (records.length === 0) {
      return NextResponse.json(
        {
          error:
            "No verification request was found for this email. Please request a new code.",
        },
        {
          status: 400,
        }
      );
    }

    const record = records[0];

    /* =====================================================
       7. Check expiration
    ===================================================== */

    const expiresAt =
      new Date(record.expiresAt).getTime();

    if (
      Number.isNaN(expiresAt) ||
      Date.now() > expiresAt
    ) {
      await fetch(
        `${process.env.STRAPI_URL}/api/email-verifications/${record.documentId}`,
        {
          method: "DELETE",

          headers: {
            Authorization:
              `Bearer ${process.env.STRAPI_API_TOKEN}`,
          },
        }
      );

      return NextResponse.json(
        {
          error:
            "This verification code has expired. Please request a new code.",
        },
        {
          status: 400,
        }
      );
    }

    /* =====================================================
       8. Check attempts
    ===================================================== */

    const attempts =
      typeof record.attempts === "number"
        ? record.attempts
        : 0;

    const MAX_ATTEMPTS = 5;

    if (attempts >= MAX_ATTEMPTS) {
      await fetch(
        `${process.env.STRAPI_URL}/api/email-verifications/${record.documentId}`,
        {
          method: "DELETE",

          headers: {
            Authorization:
              `Bearer ${process.env.STRAPI_API_TOKEN}`,
          },
        }
      );

      return NextResponse.json(
        {
          error:
            "Too many incorrect attempts. Please request a new verification code.",
        },
        {
          status: 429,
        }
      );
    }

    /* =====================================================
       9. Hash entered verification code
    ===================================================== */

    const enteredCodeHash =
      crypto
        .createHash("sha256")
        .update(verificationCode)
        .digest("hex");

    /* =====================================================
       10. Compare hashes
    ===================================================== */

    if (
      enteredCodeHash !==
      record.codeHash
    ) {
      const newAttempts =
        attempts + 1;

      await fetch(
        `${process.env.STRAPI_URL}/api/email-verifications/${record.documentId}`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${process.env.STRAPI_API_TOKEN}`,
          },

          body: JSON.stringify({
            data: {
              attempts: newAttempts,
            },
          }),
        }
      );

      const remainingAttempts =
        MAX_ATTEMPTS - newAttempts;

      if (remainingAttempts <= 0) {
        await fetch(
          `${process.env.STRAPI_URL}/api/email-verifications/${record.documentId}`,
          {
            method: "DELETE",

            headers: {
              Authorization:
                `Bearer ${process.env.STRAPI_API_TOKEN}`,
            },
          }
        );

        return NextResponse.json(
          {
            error:
              "Too many incorrect attempts. Please request a new verification code.",
          },
          {
            status: 429,
          }
        );
      }

      return NextResponse.json(
        {
          error:
            `Incorrect verification code. ${remainingAttempts} attempt${
              remainingAttempts === 1
                ? ""
                : "s"
            } remaining.`,
        },
        {
          status: 400,
        }
      );
    }

    /* =====================================================
       11. Verification successful
    ===================================================== */

    const name =
      typeof record.name === "string"
        ? record.name.trim()
        : "";

    const message =
      typeof record.message === "string"
        ? record.message.trim()
        : "";

    if (!name || !message) {
      console.error(
        "Verification record is missing name or message:",
        record
      );

      return NextResponse.json(
        {
          error:
            "The contact request is incomplete. Please start again.",
        },
        {
          status: 400,
        }
      );
    }

    /* =====================================================
       12. Escape HTML
    ===================================================== */

    const safeName =
      escapeHtml(name);

    const safeEmail =
      escapeHtml(email);

    const safeMessage =
      escapeHtml(message);

    /* =====================================================
       13. SAVE CONTACT MESSAGE TO STRAPI FIRST
       
       IMPORTANT:
       We save the verified message before sending emails.
    ===================================================== */

    const contactResponse =
      await fetch(
        `${process.env.STRAPI_URL}/api/contact-messages`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${process.env.STRAPI_API_TOKEN}`,
          },

          body: JSON.stringify({
            data: {
              name,
              email,
              message,
              messageStatus: "new",
            },
          }),

          cache: "no-store",
        }
      );

    const contactData =
      await contactResponse.json();

    if (!contactResponse.ok) {
      console.error(
        "Strapi contact message error:",
        contactData
      );

      /*
       * IMPORTANT:
       * Do not send emails if the message could
       * not be saved successfully.
       */

      return NextResponse.json(
        {
          error:
            "We could not save your message. Please try again.",
        },
        {
          status: 500,
        }
      );
    }

    /* =====================================================
       14. Create mail transporter
    ===================================================== */

    const transporter =
      nodemailer.createTransport({
        service: "gmail",

        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_PASS,
        },
      });

    /* =====================================================
       15. Send email to ADMIN
    ===================================================== */

    let adminEmailSent = false;

    try {
      await transporter.sendMail({
        from:
          `"FriscoDesi Contact" <${process.env.GMAIL_USER}>`,

        to: process.env.ADMIN_EMAIL,

        replyTo: email,

        subject:
          `New message from ${name}`,

        text: `
New Contact Message

Name: ${name}
Email: ${email}

Message:

${message}
        `.trim(),

        html: `
          <div
            style="
              font-family: Arial, sans-serif;
              line-height: 1.6;
              max-width: 600px;
              margin: auto;
            "
          >

            <h2>
              New Contact Message
            </h2>

            <p>
              <strong>Name:</strong>
              ${safeName}
            </p>

            <p>
              <strong>Email:</strong>
              ${safeEmail}
            </p>

            <p>
              <strong>Message:</strong>
            </p>

            <p>
              ${safeMessage.replace(
                /\n/g,
                "<br />"
              )}
            </p>

          </div>
        `,
      });

      adminEmailSent = true;

    } catch (error) {
      console.error(
        "Admin email error:",
        error
      );
    }

    /* =====================================================
       16. Send confirmation email to USER
    ===================================================== */

    let userEmailSent = false;

    try {
      await transporter.sendMail({
        from:
          `"FriscoDesi" <${process.env.GMAIL_USER}>`,

        to: email,

        replyTo: process.env.GMAIL_USER,

        subject:
          "Your message was received - FriscoDesi",

        text: `
Hi ${name},

Your email has been verified successfully.

We have received your message and our team will get back to you shortly.

Thank you,
FriscoDesi Team
        `.trim(),

        html: `
          <div
            style="
              font-family: Arial, sans-serif;
              line-height: 1.6;
              max-width: 600px;
              margin: auto;
            "
          >

            <h2>
              Thank you for contacting FriscoDesi
            </h2>

            <p>
              Hi ${safeName},
            </p>

            <p>
              Your email has been verified successfully.
            </p>

            <p>
              We have received your message and
              our team will get back to you shortly.
            </p>

            <hr />

            <p>
              <strong>Your message:</strong>
            </p>

            <p>
              ${safeMessage.replace(
                /\n/g,
                "<br />"
              )}
            </p>

            <hr />

            <p>
              Thank you,<br />
              <strong>FriscoDesi Team</strong>
            </p>

          </div>
        `,
      });

      userEmailSent = true;

    } catch (error) {
      console.error(
        "User confirmation email error:",
        error
      );
    }

    /* =====================================================
       17. Delete verification record
    ===================================================== */

    try {
      await fetch(
        `${process.env.STRAPI_URL}/api/email-verifications/${record.documentId}`,
        {
          method: "DELETE",

          headers: {
            Authorization:
              `Bearer ${process.env.STRAPI_API_TOKEN}`,
          },
        }
      );
    } catch (deleteError) {
      console.error(
        "Verification cleanup error:",
        deleteError
      );
    }

    /* =====================================================
       18. Handle email delivery status
    ===================================================== */

    /*
     * At this point the message is safely stored in Strapi.
     *
     * Even if an email failed, we should not tell the user
     * that the entire contact request failed.
     */

    if (!adminEmailSent) {
      return NextResponse.json(
        {
          success: true,

          message:
            "Your message was received successfully, but we could not notify our team by email. Your message has been saved and will be reviewed.",
        },
        {
          status: 200,
        }
      );
    }

    if (!userEmailSent) {
      return NextResponse.json(
        {
          success: true,

          message:
            "Your message was sent successfully. We could not send the confirmation email, but your message has been received by our team.",
        },
        {
          status: 200,
        }
      );
    }

    /* =====================================================
       19. Complete success
    ===================================================== */

    return NextResponse.json(
      {
        success: true,

        message:
          "Your email has been verified and your message has been sent successfully.",
      },
      {
        status: 200,
      }
    );

  } catch (error) {
    console.error(
      "VERIFY CONTACT ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong while verifying your email.",
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================================================
   Escape HTML
========================================================= */

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}