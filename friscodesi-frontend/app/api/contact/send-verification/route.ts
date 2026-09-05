import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import crypto from "crypto";

/* =========================================================
   POST - Send Contact Email Verification Code
========================================================= */

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const message =
      typeof body.message === "string"
        ? body.message.trim()
        : "";

    /* =====================================================
       1. Validate fields
    ===================================================== */

    if (!name || !email || !message) {
      return NextResponse.json(
        {
          error: "All fields are required.",
        },
        {
          status: 400,
        }
      );
    }

    /* =====================================================
       2. Validate email format
    ===================================================== */

    const emailRegex =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          error:
            "Please enter a valid email address.",
        },
        {
          status: 400,
        }
      );
    }

    /* =====================================================
       3. Check environment variables
    ===================================================== */

    if (
      !process.env.STRAPI_URL ||
      !process.env.STRAPI_API_TOKEN ||
      !process.env.GMAIL_USER ||
      !process.env.GMAIL_PASS
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
       4. Generate 6-digit verification code
    ===================================================== */

    const verificationCode =
      crypto.randomInt(100000, 1000000).toString();

    /* =====================================================
       5. Hash verification code
       
       We store only the hash in Strapi.
       The actual code is never stored.
    ===================================================== */

    const codeHash =
      crypto
        .createHash("sha256")
        .update(verificationCode)
        .digest("hex");

    /* =====================================================
       6. Verification expires in 10 minutes
    ===================================================== */

    const expiresAt = new Date(
      Date.now() + 10 * 60 * 1000
    ).toISOString();

    /* =====================================================
       7. Remove previous verification records
       
       This prevents multiple active codes for the
       same email address.
    ===================================================== */

    const existingResponse = await fetch(
      `${process.env.STRAPI_URL}/api/email-verifications?filters[email][$eq]=${encodeURIComponent(
        email
      )}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
        },
        cache: "no-store",
      }
    );

    if (existingResponse.ok) {
      const existingData =
        await existingResponse.json();

      const existingRecords =
        existingData?.data || [];

      for (const record of existingRecords) {
        await fetch(
          `${process.env.STRAPI_URL}/api/email-verifications/${record.documentId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
            },
          }
        );
      }
    }

    /* =====================================================
       8. Save temporary verification data
    ===================================================== */

    const createResponse = await fetch(
      `${process.env.STRAPI_URL}/api/email-verifications`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
        },

        body: JSON.stringify({
          data: {
            email,
            name,
            message,
            codeHash,
            expiresAt,
            attempts: 0,
          },
        }),

        cache: "no-store",
      }
    );

    const createData =
      await createResponse.json();

    if (!createResponse.ok) {
      console.error(
        "Strapi verification create error:",
        createData
      );

      return NextResponse.json(
        {
          error:
            "Unable to start email verification.",
        },
        {
          status: 500,
        }
      );
    }

    /* =====================================================
       9. Create mail transporter
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
       10. Send verification email
    ===================================================== */

    try {
      await transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: email,
        replyTo: process.env.GMAIL_USER,

        subject:
          "Verify your email - FriscoDesi",

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
              Verify your email address
            </h2>

            <p>
              Hi ${escapeHtml(name)},
            </p>

            <p>
              Please use the verification code
              below to continue sending your
              message to FriscoDesi.
            </p>

            <div
              style="
                margin: 25px 0;
                padding: 20px;
                background: #f3f4f6;
                border-radius: 10px;
                text-align: center;
              "
            >

              <div
                style="
                  font-size: 32px;
                  font-weight: bold;
                  letter-spacing: 8px;
                "
              >
                ${verificationCode}
              </div>

            </div>

            <p>
              This code will expire in
              <strong>10 minutes</strong>.
            </p>

            <p>
              If you did not request this code,
              you can safely ignore this email.
            </p>

            <br />

            <p>
              Thank you,<br />
              <strong>FriscoDesi Team</strong>
            </p>

          </div>
        `,
      });
    } catch (emailError) {
      console.error(
        "Verification email error:",
        emailError
      );

      /*
       * The verification record should not remain
       * if we could not send the email.
       */

      await fetch(
        `${process.env.STRAPI_URL}/api/email-verifications/${createData.data.documentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
          },
        }
      );

      return NextResponse.json(
        {
          error:
            "We could not send a verification email to this address. Please check the email address and try again.",
        },
        {
          status: 400,
        }
      );
    }

    /* =====================================================
       11. Success
    ===================================================== */

    return NextResponse.json({
      success: true,
      message:
        "A verification code has been sent to your email address.",
    });
  } catch (error) {
    console.error(
      "SEND VERIFICATION ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong while sending the verification code.",
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