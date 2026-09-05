import { NextResponse } from "next/server";
import { cookies } from "next/headers";

/* =========================================================
   GET - Fetch Current User
========================================================= */

export async function GET() {
  try {
    // Get login token from cookie
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    // User is not logged in
    if (!token) {
      return NextResponse.json(
        {
          error: "Not authenticated",
        },
        {
          status: 401,
        }
      );
    }

    // Fetch current user from Strapi
    const response = await fetch(
      `${process.env.STRAPI_URL}/api/users/me?populate=role`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      }
    );

    const data = await response.json();

    // Invalid/expired token
    if (!response.ok) {
      console.error(
        "Strapi get user error:",
        data
      );

      return NextResponse.json(
        {
          error:
            data?.error?.message ||
            "Unable to fetch user",
        },
        {
          status: response.status,
        }
      );
    }

    return NextResponse.json({
      user: data,
    });
  } catch (error) {
    console.error(
      "Get user error:",
      error
    );

    return NextResponse.json(
      {
        error: "Internal server error",
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================================================
   PUT - Update Current User
========================================================= */

export async function PUT(
  request: Request
) {
  try {
    /* =====================================================
       Get login token
    ===================================================== */

    const cookieStore = await cookies();

    const token =
      cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          error: "Not authenticated",
        },
        {
          status: 401,
        }
      );
    }

    /* =====================================================
       Get current user from Strapi
    ===================================================== */

    const meResponse = await fetch(
      `${process.env.STRAPI_URL}/api/users/me`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      }
    );

    const currentUser =
      await meResponse.json();

    if (!meResponse.ok) {
      console.error(
        "Strapi current user error:",
        currentUser
      );

      return NextResponse.json(
        {
          error:
            currentUser?.error?.message ||
            "Unable to identify current user",
        },
        {
          status: meResponse.status,
        }
      );
    }

    /* =====================================================
       Get data from frontend
    ===================================================== */

    const body = await request.json();

    const username =
      typeof body.username === "string"
        ? body.username.trim()
        : "";

    const email =
      typeof body.email === "string"
        ? body.email.trim()
        : "";

    /* =====================================================
       Validate username
    ===================================================== */

    if (!username) {
      return NextResponse.json(
        {
          error: "Username is required",
        },
        {
          status: 400,
        }
      );
    }

    /* =====================================================
       Validate email
    ===================================================== */

    if (!email) {
      return NextResponse.json(
        {
          error: "Email is required",
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
            "Please enter a valid email address",
        },
        {
          status: 400,
        }
      );
    }

    /* =====================================================
       Update user in Strapi
    ===================================================== */

    const updateResponse =
      await fetch(
        `${process.env.STRAPI_URL}/api/users/${currentUser.id}`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            username,
            email,
          }),

          cache: "no-store",
        }
      );

    const updatedUser =
      await updateResponse.json();

    /* =====================================================
       Handle Strapi error
    ===================================================== */

    if (!updateResponse.ok) {
      console.error(
        "Strapi update user error:",
        updatedUser
      );

      return NextResponse.json(
        {
          error:
            updatedUser?.error?.message ||
            "Unable to update profile",
        },
        {
          status: updateResponse.status,
        }
      );
    }

    /* =====================================================
       Success
    ===================================================== */

    return NextResponse.json({
      message:
        "Profile updated successfully",

      user: updatedUser,
    });
  } catch (error) {
    console.error(
      "Update user error:",
      error
    );

    return NextResponse.json(
      {
        error: "Internal server error",
      },
      {
        status: 500,
      }
    );
  }
}