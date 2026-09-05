import { NextRequest, NextResponse } from "next/server";

const STRAPI_URL = process.env.STRAPI_URL;

/* =====================================================
   Safely read JSON response
===================================================== */

async function readResponse(res: Response) {
  const text = await res.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return {
      error: text,
    };
  }
}

/* =====================================================
   GET ADMIN SETTINGS
===================================================== */

export async function GET(request: NextRequest) {
  try {
    const adminToken =
      request.cookies.get("adminToken")?.value;

    if (!adminToken) {
      return NextResponse.json(
        {
          error: "Admin authentication required",
        },
        {
          status: 401,
        }
      );
    }

    console.log(
      "🔐 Admin token exists:",
      true
    );

    console.log(
      "🔐 Token length:",
      adminToken.length
    );

    const res = await fetch(
      `${STRAPI_URL}/api/admin-setting`,
      {
        method: "GET",

        headers: {
          Authorization:
            `Bearer ${adminToken}`,
          "Content-Type":
            "application/json",
        },

        cache: "no-store",
      }
    );

    const data =
      await readResponse(res);

    console.log(
      "⚙️ Admin settings status:",
      res.status
    );

    console.log(
      "⚙️ Admin settings response:",
      data
    );

    if (!res.ok) {
      return NextResponse.json(
        {
          error:
            data?.error ||
            data?.message ||
            "Failed to fetch admin settings",
        },
        {
          status: res.status,
        }
      );
    }

    return NextResponse.json(
      data || { data: null },
      {
        status: 200,
      }
    );

  } catch (error) {
    console.error(
      "❌ Admin settings GET error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to fetch admin settings",
      },
      {
        status: 500,
      }
    );
  }
}

/* =====================================================
   UPDATE ADMIN SETTINGS
===================================================== */

export async function PUT(request: NextRequest) {
  try {
    const adminToken =
      request.cookies.get("adminToken")?.value;

    if (!adminToken) {
      return NextResponse.json(
        {
          error: "Admin authentication required",
        },
        {
          status: 401,
        }
      );
    }

    console.log(
      "🔐 Admin token exists:",
      true
    );

    const body =
      await request.json();

    console.log(
      "📤 Updating admin settings:",
      body
    );

    const res = await fetch(
      `${STRAPI_URL}/api/admin-setting`,
      {
        method: "PUT",

        headers: {
          Authorization:
            `Bearer ${adminToken}`,

          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          data: body,
        }),

        cache: "no-store",
      }
    );

    const data =
      await readResponse(res);

    console.log(
      "⚙️ Admin settings update status:",
      res.status
    );

    console.log(
      "⚙️ Admin settings update response:",
      data
    );

    if (!res.ok) {
      return NextResponse.json(
        {
          error:
            data?.error ||
            data?.message ||
            "Failed to update admin settings",
        },
        {
          status: res.status,
        }
      );
    }

    return NextResponse.json(
      data || {
        data: null,
        message:
          "Settings updated successfully",
      },
      {
        status: 200,
      }
    );

  } catch (error) {
    console.error(
      "❌ Admin settings PUT error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to update admin settings",
      },
      {
        status: 500,
      }
    );
  }
}