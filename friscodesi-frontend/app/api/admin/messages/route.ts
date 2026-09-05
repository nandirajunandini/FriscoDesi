import { NextRequest, NextResponse } from "next/server";

export async function GET(_req: NextRequest) {
  try {
    /* =====================================================
       Validate environment variables
    ===================================================== */

    const strapiUrl = process.env.STRAPI_URL;
    const strapiToken = process.env.STRAPI_API_TOKEN;

    if (!strapiUrl || !strapiToken) {
      console.error(
        "Missing STRAPI_URL or STRAPI_API_TOKEN"
      );

      return NextResponse.json(
        {
          success: false,
          error: "Server configuration error.",
        },
        {
          status: 500,
        }
      );
    }

    /* =====================================================
       Fetch messages from Strapi
    ===================================================== */

    const response = await fetch(
      `${strapiUrl}/api/contact-messages?sort=createdAt:desc`,
      {
        method: "GET",

        headers: {
          Authorization: `Bearer ${strapiToken}`,
          Accept: "application/json",
        },

        cache: "no-store",
      }
    );

    /* =====================================================
       Safely parse Strapi response
    ===================================================== */

    let data: any = {};

    try {
      data = await response.json();
    } catch {
      data = {};
    }

    /* =====================================================
       Handle Strapi errors
    ===================================================== */

    if (!response.ok) {
      console.error(
        "Strapi messages API error:",
        data
      );

      return NextResponse.json(
        {
          success: false,
          error:
            data?.error?.message ||
            "Unable to load messages.",
        },
        {
          status: response.status >= 500
            ? 502
            : response.status,
        }
      );
    }

    /* =====================================================
       Format Strapi response
       Strapi 5 returns fields directly on data items
    ===================================================== */

    const messages = Array.isArray(data?.data)
      ? data.data.map((item: any) => ({
          id: item.id,
          documentId: item.documentId,

          name:
            typeof item.name === "string"
              ? item.name
              : "",

          email:
            typeof item.email === "string"
              ? item.email
              : "",

          message:
            typeof item.message === "string"
              ? item.message
              : "",

          messageStatus:
            typeof item.messageStatus === "string"
              ? item.messageStatus
              : "new",

          adminReply:
            typeof item.adminReply === "string"
              ? item.adminReply
              : "",

          createdAt:
            typeof item.createdAt === "string"
              ? item.createdAt
              : "",

          updatedAt:
            typeof item.updatedAt === "string"
              ? item.updatedAt
              : "",
        }))
      : [];

    /* =====================================================
       Return response
    ===================================================== */

    return NextResponse.json(
      {
        success: true,
        messages,
      },
      {
        status: 200,
      }
    );

  } catch (error) {
    console.error(
      "Admin messages API error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Something went wrong while loading messages.",
      },
      {
        status: 500,
      }
    );
  }
}