import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const verificationCode =
      typeof body.verificationCode === "string"
        ? body.verificationCode.trim()
        : "";

    const username =
      typeof body.username === "string"
        ? body.username.trim()
        : "";

    const password =
      typeof body.password === "string"
        ? body.password
        : "";

    /* =====================================================
       VALIDATION
    ===================================================== */

    if (
      !email ||
      !verificationCode ||
      !username ||
      !password
    ) {
      return NextResponse.json(
        {
          error:
            "Registration information and verification code are required.",
        },
        {
          status: 400,
        }
      );
    }

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

    if (password.length < 6) {
      return NextResponse.json(
        {
          error:
            "Password must be at least 6 characters long.",
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
      !process.env.STRAPI_API_TOKEN
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
       FIND VERIFICATION RECORD
    ===================================================== */

    const verificationResponse =
      await fetch(
        `${process.env.STRAPI_URL}/api/registration-verifications?filters[email][$eq]=${encodeURIComponent(
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

    const verificationText =
      await verificationResponse.text();

    let verificationData: any = {};

    try {
      verificationData =
        JSON.parse(verificationText);
    } catch {
      console.error(
        "Invalid Strapi verification response:",
        verificationText
      );
    }

    if (!verificationResponse.ok) {
      console.error(
        "Verification lookup error:",
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
       CHECK EXPIRATION
    ===================================================== */

    const expiresAt =
      new Date(
        record.expiresAt
      ).getTime();

    if (
      Number.isNaN(expiresAt) ||
      Date.now() > expiresAt
    ) {
      await deleteVerification(
        record.documentId
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
       CHECK ATTEMPTS
    ===================================================== */

    const attempts =
      typeof record.attempts === "number"
        ? record.attempts
        : 0;

    const MAX_ATTEMPTS = 5;

    if (attempts >= MAX_ATTEMPTS) {
      await deleteVerification(
        record.documentId
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
       HASH CODE
    ===================================================== */

    const enteredCodeHash =
      crypto
        .createHash("sha256")
        .update(verificationCode)
        .digest("hex");

    /* =====================================================
       COMPARE CODE
    ===================================================== */

    if (
      enteredCodeHash !==
      record.codeHash
    ) {
      const newAttempts =
        attempts + 1;

      await fetch(
        `${process.env.STRAPI_URL}/api/registration-verifications/${record.documentId}`,
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
        MAX_ATTEMPTS -
        newAttempts;

      if (remainingAttempts <= 0) {
        await deleteVerification(
          record.documentId
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
       CODE VERIFIED
    ===================================================== */

    /* =====================================================
       CREATE STRAPI USER
    ===================================================== */

    const registerResponse =
      await fetch(
        `${process.env.STRAPI_URL}/api/auth/local/register`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            username,
            email,
            password,
          }),

          cache: "no-store",
        }
      );

    const registerText =
      await registerResponse.text();

    let registerData: any = {};

    try {
      registerData =
        JSON.parse(registerText);
    } catch {
      console.error(
        "Invalid Strapi registration response:",
        registerText
      );
    }

    /* =====================================================
       REGISTRATION FAILED
    ===================================================== */

    if (!registerResponse.ok) {
      console.error(
        "Strapi registration error:",
        registerData
      );

      /*
       * Keep the verification record here so the user
       * can correct registration information and try
       * again with the same verified code.
       */

      return NextResponse.json(
        {
          error:
            registerData?.error?.message ||
            "Unable to create your account. Please try again.",
        },
        {
          status:
            registerResponse.status,
        }
      );
    }

    /* =====================================================
       REGISTRATION SUCCESSFUL
    ===================================================== */

    await deleteVerification(
      record.documentId
    );

    /* =====================================================
       SAVE AUTHENTICATION
    ===================================================== */

    const response =
      NextResponse.json(
        {
          success: true,

          message:
            "Email verified and account created successfully.",
        },
        {
          status: 200,
        }
      );

    response.cookies.set(
      "token",
      registerData.jwt,
      {
        httpOnly: true,

        secure:
          process.env.NODE_ENV ===
          "production",

        sameSite: "lax",

        path: "/",
      }
    );

    response.cookies.set(
      "userToken",
      registerData.jwt,
      {
        httpOnly: true,

        secure:
          process.env.NODE_ENV ===
          "production",

        sameSite: "lax",

        path: "/",
      }
    );

    response.cookies.set(
      "role",
      "User",
      {
        httpOnly: true,

        secure:
          process.env.NODE_ENV ===
          "production",

        sameSite: "lax",

        path: "/",
      }
    );

    return response;

  } catch (error) {
    console.error(
      "VERIFY REGISTRATION ERROR:",
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
   DELETE VERIFICATION RECORD
========================================================= */

async function deleteVerification(
  documentId: string
) {
  try {
    await fetch(
      `${process.env.STRAPI_URL}/api/registration-verifications/${documentId}`,
      {
        method: "DELETE",

        headers: {
          Authorization:
            `Bearer ${process.env.STRAPI_API_TOKEN}`,
        },
      }
    );
  } catch (error) {
    console.error(
      "Registration verification cleanup error:",
      error
    );
  }
}