import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    /* =========================
       VALIDATE EMAIL
    ========================= */

    if (!email) {
      return NextResponse.json(
        {
          error: "Please enter a valid email address.",
        },
        { status: 400 }
      );
    }

    /* =========================
       SEND RESET REQUEST TO STRAPI
    ========================= */

    const res = await fetch(
  `${process.env.STRAPI_URL}/api/auth/forgot-password`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          email,
        }),

        cache: "no-store",
      }
    );

    let data: any = {};

    try {
      data = await res.json();
    } catch {
      data = {};
    }

    /* =========================
       STRAPI ERROR
    ========================= */

    if (!res.ok) {
      console.error(
        "Strapi forgot password error:",
        data
      );

      return NextResponse.json(
        {
          error:
            "Unable to process your request. Please try again.",
        },
        { status: 400 }
      );
    }

    /* =========================
       SUCCESS
    ========================= */

    return NextResponse.json(
      {
        success: true,
        message:
          "If an account exists with this email, you will receive a password reset link shortly.",
      },
      { status: 200 }
    );

  } catch (error) {
    console.error(
      "Forgot password API error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong. Please try again.",
      },
      { status: 500 }
    );
  }
}