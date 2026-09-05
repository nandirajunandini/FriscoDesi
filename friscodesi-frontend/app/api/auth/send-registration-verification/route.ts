import { NextResponse } from "next/server";
import crypto from "crypto";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const username =
      typeof body.username === "string"
        ? body.username.trim()
        : "";

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    /* =====================================================
       VALIDATION
    ===================================================== */

    if (!username || !email) {
      return NextResponse.json(
        {
          error:
            "Username and email are required.",
        },
        {
          status: 400,
        }
      );
    }

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
       ENVIRONMENT VARIABLES
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
       CHECK IF EMAIL ALREADY EXISTS
    ===================================================== */

    const existingUserResponse =
      await fetch(
        `${process.env.STRAPI_URL}/api/users?filters[email][$eq]=${encodeURIComponent(
          email
        )}`,
        {
          method: "GET",

          headers: {
            Authorization:
              `Bearer ${process.env.STRAPI_API_TOKEN}`,
          },

          cache: "no-store",
        }
      );

    if (existingUserResponse.ok) {
      const existingUserData =
        await existingUserResponse.json();

      const existingUsers =
        existingUserData || [];

      if (
        Array.isArray(existingUsers) &&
        existingUsers.length > 0
      ) {
        return NextResponse.json(
          {
            error:
              "An account with this email already exists. Please log in instead.",
          },
          {
            status: 409,
          }
        );
      }
    }

    /* =====================================================
       CHECK USERNAME
    ===================================================== */

    const existingUsernameResponse =
      await fetch(
        `${process.env.STRAPI_URL}/api/users?filters[username][$eq]=${encodeURIComponent(
          username
        )}`,
        {
          method: "GET",

          headers: {
            Authorization:
              `Bearer ${process.env.STRAPI_API_TOKEN}`,
          },

          cache: "no-store",
        }
      );

    if (existingUsernameResponse.ok) {
      const existingUsernameData =
        await existingUsernameResponse.json();

      const existingUsers =
        existingUsernameData || [];

      if (
        Array.isArray(existingUsers) &&
        existingUsers.length > 0
      ) {
        return NextResponse.json(
          {
            error:
              "This username is already taken. Please choose another username.",
          },
          {
            status: 409,
          }
        );
      }
    }

    /* =====================================================
       GENERATE CODE
    ===================================================== */

    const verificationCode =
      crypto
        .randomInt(
          100000,
          1000000
        )
        .toString();

    const codeHash =
      crypto
        .createHash("sha256")
        .update(verificationCode)
        .digest("hex");

    const expiresAt =
      new Date(
        Date.now() +
          10 * 60 * 1000
      ).toISOString();

    /* =====================================================
       REMOVE OLD REGISTRATION VERIFICATION
    ===================================================== */

    const existingVerificationResponse =
      await fetch(
        `${process.env.STRAPI_URL}/api/registration-verifications?filters[email][$eq]=${encodeURIComponent(
          email
        )}`,
        {
          method: "GET",

          headers: {
            Authorization:
              `Bearer ${process.env.STRAPI_API_TOKEN}`,
          },

          cache: "no-store",
        }
      );

    if (
      existingVerificationResponse.ok
    ) {
      const existingData =
        await existingVerificationResponse.json();

      const records =
        existingData?.data || [];

      for (const record of records) {
        await fetch(
          `${process.env.STRAPI_URL}/api/registration-verifications/${record.documentId}`,
          {
            method: "DELETE",

            headers: {
              Authorization:
                `Bearer ${process.env.STRAPI_API_TOKEN}`,
            },
          }
        );
      }
    }

    /* =====================================================
       SAVE TEMPORARY VERIFICATION
    ===================================================== */

    const createResponse =
      await fetch(
        `${process.env.STRAPI_URL}/api/registration-verifications`,
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
              username,
              email,
              codeHash,
              expiresAt,
              attempts: 0,
            },
          }),

          cache: "no-store",
        }
      );

    const createText =
      await createResponse.text();

    let createData: any = {};

    try {
      createData =
        JSON.parse(createText);
    } catch {
      console.error(
        "Strapi returned non-JSON response:",
        createText
      );
    }

    if (!createResponse.ok) {
      console.error(
        "Registration verification create error:",
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
       CREATE MAIL TRANSPORTER
    ===================================================== */

    const transporter =
      nodemailer.createTransport({
        service: "gmail",

        auth: {
          user:
            process.env.GMAIL_USER,

          pass:
            process.env.GMAIL_PASS,
        },
      });

    /* =====================================================
       SEND VERIFICATION EMAIL
    ===================================================== */

    try {
      await transporter.sendMail({
        from:
          `"FriscoDesi" <${process.env.GMAIL_USER}>`,

        to: email,

        replyTo:
          process.env.GMAIL_USER,

        subject:
          "Verify your email - FriscoDesi",

        text: `
Hi ${username},

Your FriscoDesi verification code is:

${verificationCode}

This code will expire in 10 minutes.

If you did not request this registration, you can safely ignore this email.

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
              Verify your email
            </h2>

            <p>
              Hi ${escapeHtml(username)},
            </p>

            <p>
              Please use the verification code
              below to complete your FriscoDesi
              registration.
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
              If you did not request this
              registration, you can safely ignore
              this email.
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
        "Registration verification email error:",
        emailError
      );

      /* Delete temporary record */

      if (
        createData?.data?.documentId
      ) {
        await fetch(
          `${process.env.STRAPI_URL}/api/registration-verifications/${createData.data.documentId}`,
          {
            method: "DELETE",

            headers: {
              Authorization:
                `Bearer ${process.env.STRAPI_API_TOKEN}`,
            },
          }
        );
      }

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
       SUCCESS
    ===================================================== */

    return NextResponse.json(
      {
        success: true,

        message:
          "A verification code has been sent to your email address.",
      },
      {
        status: 200,
      }
    );

  } catch (error) {
    console.error(
      "SEND REGISTRATION VERIFICATION ERROR:",
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
   ESCAPE HTML
========================================================= */

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}