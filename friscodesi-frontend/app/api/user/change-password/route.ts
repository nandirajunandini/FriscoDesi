import { NextResponse } from "next/server";
import { cookies } from "next/headers";

/* =========================================================
   POST - Change Current User Password
========================================================= */

export async function POST(request: Request) {
  try {
    /* =====================================================
       Get login token from cookie
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
       Get request body
    ===================================================== */

    const body = await request.json();

    const currentPassword =
      typeof body.currentPassword === "string"
        ? body.currentPassword
        : "";

    const newPassword =
      typeof body.newPassword === "string"
        ? body.newPassword
        : "";

    const passwordConfirmation =
      typeof body.passwordConfirmation === "string"
        ? body.passwordConfirmation
        : "";

    /* =====================================================
       Validate current password
    ===================================================== */

    if (!currentPassword) {
      return NextResponse.json(
        {
          error:
            "Current password is required",
        },
        {
          status: 400,
        }
      );
    }

    /* =====================================================
       Validate new password
    ===================================================== */

    if (!newPassword) {
      return NextResponse.json(
        {
          error:
            "New password is required",
        },
        {
          status: 400,
        }
      );
    }

    /* =====================================================
       Validate password confirmation
    ===================================================== */

    if (!passwordConfirmation) {
      return NextResponse.json(
        {
          error:
            "Please confirm your new password",
        },
        {
          status: 400,
        }
      );
    }

    /* =====================================================
       Check passwords match
    ===================================================== */

    if (
      newPassword !==
      passwordConfirmation
    ) {
      return NextResponse.json(
        {
          error:
            "New passwords do not match",
        },
        {
          status: 400,
        }
      );
    }

    /* =====================================================
       Basic password length validation
    ===================================================== */

    if (newPassword.length < 6) {
      return NextResponse.json(
        {
          error:
            "New password must be at least 6 characters",
        },
        {
          status: 400,
        }
      );
    }

    /* =====================================================
       Call Strapi
    ===================================================== */

    const response = await fetch(
      "http://localhost:1337/api/auth/change-password",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",

          Authorization:
            `Bearer ${token}`,
        },

        body: JSON.stringify({
          currentPassword,
          password: newPassword,
          passwordConfirmation,
        }),

        cache: "no-store",
      }
    );

    const data =
      await response.json();

    /* =====================================================
       Handle Strapi error
    ===================================================== */

    if (!response.ok) {
      console.error(
        "Strapi change password error:",
        data
      );

      return NextResponse.json(
        {
          error:
            data?.error?.message ||
            "Unable to change password",
        },
        {
          status: response.status,
        }
      );
    }

    /* =====================================================
       Success
    ===================================================== */

    return NextResponse.json({
      message:
        "Password changed successfully",
      user: data.user,
    });
  } catch (error) {
    console.error(
      "Change password error:",
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