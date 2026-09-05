import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
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

    const password =
      typeof body.password === "string"
        ? body.password
        : "";

    if (!username || !email || !password) {
      return NextResponse.json(
        {
          error: "Username, email and password are required.",
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
          error: "Please enter a valid email address.",
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

    if (
      !process.env.STRAPI_URL
    ) {
      console.error(
        "Missing STRAPI_URL environment variable."
      );

      return NextResponse.json(
        {
          error: "Server configuration error.",
        },
        {
          status: 500,
        }
      );
    }

    /* =====================================================
       CREATE STRAPI USER
    ===================================================== */

    const res = await fetch(
      `${process.env.STRAPI_URL}/api/auth/local/register`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          username,
          email,
          password,
        }),

        cache: "no-store",
      }
    );

    const data = await res.json();

    if (!res.ok) {
      const message =
        data?.error?.message ||
        "Registration failed. Please try again.";

      return NextResponse.json(
        {
          error: message,
        },
        {
          status: res.status,
        }
      );
    }

    /* =====================================================
       SAVE AUTHENTICATION
    ===================================================== */

    const response = NextResponse.json(
      {
        success: true,
      },
      {
        status: 200,
      }
    );

    response.cookies.set(
      "token",
      data.jwt,
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
      data.jwt,
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
      "Registration error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to create your account. Please try again later.",
      },
      {
        status: 500,
      }
    );
  }
}