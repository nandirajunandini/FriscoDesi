import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const code =
      typeof body.code === "string"
        ? body.code.trim()
        : "";

    const password =
      typeof body.password === "string"
        ? body.password
        : "";

    const passwordConfirmation =
      typeof body.passwordConfirmation === "string"
        ? body.passwordConfirmation
        : "";

    console.log("=================================");
    console.log("RESET PASSWORD REQUEST");
    console.log("Code exists:", !!code);
    console.log("Code length:", code.length);
    console.log("Password exists:", !!password);
    console.log(
      "Passwords match:",
      password === passwordConfirmation
    );
    console.log("=================================");

    if (!code) {
      return NextResponse.json(
        {
          error: "Invalid or missing password reset code.",
        },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        {
          error: "Please enter a new password.",
        },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        {
          error:
            "Password must be at least 6 characters long.",
        },
        { status: 400 }
      );
    }

    if (password !== passwordConfirmation) {
      return NextResponse.json(
        {
          error: "Passwords do not match.",
        },
        { status: 400 }
      );
    }

    /* =========================
       SEND TO STRAPI
    ========================= */

    const res = await fetch(
  `${process.env.STRAPI_URL}/api/auth/reset-password`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          code,
          password,
          passwordConfirmation,
        }),

        cache: "no-store",
      }
    );

    /* =========================
       READ RAW RESPONSE
    ========================= */

    const responseText = await res.text();

    console.log("=================================");
    console.log("STRAPI RESET PASSWORD RESPONSE");
    console.log("Status:", res.status);
    console.log("OK:", res.ok);
    console.log("Response:", responseText);
    console.log("=================================");

    let data: any = {};

    try {
      data = JSON.parse(responseText);
    } catch {
      data = {
        rawResponse: responseText,
      };
    }

    /* =========================
       STRAPI ERROR
    ========================= */

    if (!res.ok) {
      return NextResponse.json(
        {
          error:
            data?.error?.message ||
            data?.message ||
            "Unable to reset your password. The reset link may have expired.",
        },
        {
          status: res.status,
        }
      );
    }

    /* =========================
       SUCCESS
    ========================= */

    return NextResponse.json(
      {
        success: true,
        message:
          "Your password has been reset successfully.",
      },
      {
        status: 200,
      }
    );

  } catch (error) {
    console.error(
      "RESET PASSWORD API ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong while resetting your password. Please try again.",
      },
      {
        status: 500,
      }
    );
  }
}