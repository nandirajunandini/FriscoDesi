import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

type StrapiMessage = {
  id: number;
  documentId?: string;
  name?: string;
  email?: string;
  message?: string;
  messageStatus?: string;
  adminReply?: string;
  createdAt?: string;
};

export async function GET(
  _req: NextRequest
) {
  try {
    /* =========================================
       1. CHECK ENVIRONMENT VARIABLES
    ========================================= */

    const strapiUrl =
      process.env.STRAPI_URL?.trim();

    const strapiApiToken =
      process.env.STRAPI_API_TOKEN?.trim();

    if (!strapiUrl || !strapiApiToken) {
      console.error(
        "Messages API: Missing Strapi environment variables."
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Server configuration error.",
        },
        {
          status: 500,
        }
      );
    }


    /* =========================================
       2. GET LOGGED-IN USER TOKEN
    ========================================= */

    const cookieStore = await cookies();

    const token =
      cookieStore.get("token")?.value ||
      cookieStore.get("userToken")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error:
            "You must be logged in to view your messages.",
        },
        {
          status: 401,
        }
      );
    }


    /* =========================================
       3. GET CURRENT USER FROM STRAPI
    ========================================= */

    const userResponse = await fetch(
      `${strapiUrl}/api/users/me`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
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
        "Messages API: Unable to get current user.",
        {
          status: userResponse.status,
          data: userData,
        }
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Unable to identify your account.",
        },
        {
          status: 401,
        }
      );
    }


    /* =========================================
       4. GET USER EMAIL
    ========================================= */

    const email =
      typeof userData?.email === "string"
        ? userData.email
            .trim()
            .toLowerCase()
        : "";

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Unable to identify your email address.",
        },
        {
          status: 401,
        }
      );
    }


    /* =========================================
       5. BUILD STRAPI FILTER
    ========================================= */

    const params = new URLSearchParams();

    params.set(
      "filters[email][$eq]",
      email
    );

    params.set(
      "sort",
      "createdAt:desc"
    );

    /*
     * Explicitly request the fields that the
     * dashboard needs, including adminReply.
     *
     * This makes the API response predictable
     * and prevents accidentally exposing
     * unrelated fields.
     */

    params.append(
      "fields[0]",
      "name"
    );

    params.append(
      "fields[1]",
      "email"
    );

    params.append(
      "fields[2]",
      "message"
    );

    params.append(
      "fields[3]",
      "messageStatus"
    );

    params.append(
      "fields[4]",
      "adminReply"
    );

    params.append(
      "fields[5]",
      "createdAt"
    );


    /* =========================================
       6. FETCH USER'S CONTACT MESSAGES
    ========================================= */

    const messagesUrl =
      `${strapiUrl}/api/contact-messages?${params.toString()}`;

    const messagesResponse =
      await fetch(
        messagesUrl,
        {
          method: "GET",
          headers: {
            Authorization:
              `Bearer ${strapiApiToken}`,
            Accept: "application/json",
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


    if (!messagesResponse.ok) {
      console.error(
        "Messages API: Strapi contact messages request failed.",
        {
          status:
            messagesResponse.status,
          data: messagesData,
        }
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Unable to load your messages.",
        },
        {
          status: 500,
        }
      );
    }


    /* =========================================
       7. VALIDATE STRAPI RESPONSE
    ========================================= */

    const rawMessages =
      Array.isArray(messagesData?.data)
        ? messagesData.data
        : [];


    /* =========================================
       8. NORMALIZE RESPONSE
    ========================================= */

    const messages =
      rawMessages.map(
        (item: StrapiMessage) => ({
          id: item.id,

          documentId:
            item.documentId,

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
            typeof item.messageStatus ===
            "string"
              ? item.messageStatus
              : "new",

          /*
           * THIS IS THE IMPORTANT PART.
           *
           * The admin reply is now returned
           * to the dashboard.
           */

          adminReply:
            typeof item.adminReply ===
            "string"
              ? item.adminReply
              : "",

          createdAt:
            typeof item.createdAt ===
            "string"
              ? item.createdAt
              : "",
        })
      );


    /* =========================================
       9. RETURN RESPONSE
    ========================================= */

    return NextResponse.json(
      {
        success: true,
        messages,
      },
      {
        status: 200,
        headers: {
          "Cache-Control":
            "private, no-store, max-age=0",
        },
      }
    );

  } catch (error) {
    console.error(
      "Messages API unexpected error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Something went wrong while loading your messages.",
      },
      {
        status: 500,
      }
    );
  }
}