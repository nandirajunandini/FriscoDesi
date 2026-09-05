import { NextResponse } from "next/server";
import { cookies } from "next/headers";

/* =========================================================
   GET - Fetch Messages for Current User
========================================================= */

export async function GET() {
  try {
    /* =====================================================
       1. Validate environment configuration
    ===================================================== */

    const strapiUrl =
      process.env.STRAPI_URL;

    const strapiApiToken =
      process.env.STRAPI_API_TOKEN;

    if (!strapiUrl) {
      console.error(
        "STRAPI_URL is not configured"
      );

      return NextResponse.json(
        {
          error:
            "Server configuration error",
        },
        {
          status: 500,
        }
      );
    }

    if (!strapiApiToken) {
      console.error(
        "STRAPI_API_TOKEN is not configured"
      );

      return NextResponse.json(
        {
          error:
            "Server configuration error",
        },
        {
          status: 500,
        }
      );
    }

    /* =====================================================
       2. Get authentication token
    ===================================================== */

    const cookieStore =
      await cookies();

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
       3. Get currently authenticated user
    ===================================================== */

    const userResponse =
      await fetch(
        `${strapiUrl}/api/users/me`,
        {
          method: "GET",

          headers: {
            Authorization:
              `Bearer ${token}`,
          },

          cache: "no-store",
        }
      );

    let userData: any = null;

    try {
      userData =
        await userResponse.json();
    } catch {
      userData = null;
    }

    if (!userResponse.ok) {
      console.error(
        "Strapi current user error:",
        userData
      );

      return NextResponse.json(
        {
          error:
            "Unable to identify current user",
        },
        {
          status:
            userResponse.status,
        }
      );
    }

    /* =====================================================
       4. Validate user email
    ===================================================== */

    const userEmail =
      typeof userData?.email === "string"
        ? userData.email.trim()
        : "";

    if (!userEmail) {
      console.error(
        "Authenticated Strapi user has no email"
      );

      return NextResponse.json(
        {
          error:
            "Your account does not have a valid email address",
        },
        {
          status: 400,
        }
      );
    }

    /* =====================================================
       5. Fetch only this user's messages
    ===================================================== */

    const query =
      new URLSearchParams();

    query.set(
      "filters[email][$eq]",
      userEmail
    );

    query.set(
      "sort",
      "createdAt:desc"
    );

    /*
     * Only request the fields needed
     * by the Messages page.
     */

    query.set(
      "fields[0]",
      "name"
    );

    query.set(
      "fields[1]",
      "email"
    );

    query.set(
      "fields[2]",
      "message"
    );

    query.set(
      "fields[3]",
      "messageStatus"
    );

    query.set(
      "fields[4]",
      "adminReply"
    );

    query.set(
      "fields[5]",
      "createdAt"
    );

    query.set(
      "fields[6]",
      "updatedAt"
    );

    const messagesResponse =
      await fetch(
        `${strapiUrl}/api/contact-messages?${query.toString()}`,
        {
          method: "GET",

          headers: {
            Authorization:
              `Bearer ${strapiApiToken}`,
          },

          cache: "no-store",
        }
      );

    let messagesData: any = null;

    try {
      messagesData =
        await messagesResponse.json();
    } catch {
      messagesData = null;
    }

    /* =====================================================
       6. Handle Strapi errors
    ===================================================== */

    if (!messagesResponse.ok) {
      console.error(
        "Strapi messages error:",
        messagesData
      );

      return NextResponse.json(
        {
          error:
            messagesData?.error?.message ||
            "Unable to fetch your messages",
        },
        {
          status:
            messagesResponse.status,
        }
      );
    }

    /* =====================================================
       7. Normalize response
    ===================================================== */

    const messages =
      Array.isArray(messagesData?.data)
        ? messagesData.data
        : [];

    const formattedMessages =
      messages.map(
        (item: any) => ({
          id: item.id,
          documentId:
            item.documentId,
          name:
            item.name || "",
          email:
            item.email || "",
          message:
            item.message || "",
          messageStatus:
            item.messageStatus || "new",
          adminReply:
            item.adminReply || "",
          createdAt:
            item.createdAt || null,
          updatedAt:
            item.updatedAt || null,
        })
      );

    /* =====================================================
       8. Return safe response
    ===================================================== */

    return NextResponse.json(
      {
        messages:
          formattedMessages,
      },
      {
        status: 200,
      }
    );

  } catch (error) {
    console.error(
      "User messages API error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Internal server error",
      },
      {
        status: 500,
      }
    );
  }
}