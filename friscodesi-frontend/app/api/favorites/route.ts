import { NextRequest, NextResponse } from "next/server";

/* =========================================================
   Strapi URL
========================================================= */

const STRAPI_URL = "http://localhost:1337";

/* =========================================================
   SAFE JSON HELPER
========================================================= */

async function safeJson(response: Response) {
  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return {
      raw: text,
    };
  }
}

/* =========================================================
   GET FAVORITES
========================================================= */

export async function GET(request: NextRequest) {
  try {
    const token =
      request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          error: "You must be logged in",
        },
        {
          status: 401,
        }
      );
    }

    /* -----------------------------------------
       Get logged-in user
    ----------------------------------------- */

    const userResponse = await fetch(
      `${STRAPI_URL}/api/users/me`,
      {
        method: "GET",

        headers: {
          Authorization: `Bearer ${token}`,
        },

        cache: "no-store",
      }
    );

    const user =
      await safeJson(userResponse);

    if (!userResponse.ok) {
      console.error(
        "Get user error:",
        user
      );

      return NextResponse.json(
        {
          error:
            "Unable to identify logged-in user",
        },
        {
          status: 401,
        }
      );
    }

    /* -----------------------------------------
       Check ONE listing
    ----------------------------------------- */

    const listingId =
      request.nextUrl.searchParams.get(
        "listingId"
      );

    if (listingId) {
      const favoriteResponse =
        await fetch(
          `${STRAPI_URL}/api/favorites?filters[user][id][$eq]=${encodeURIComponent(
            user.id
          )}&filters[listing][id][$eq]=${encodeURIComponent(
            listingId
          )}`,
          {
            method: "GET",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },

            cache: "no-store",
          }
        );

      const favoriteData =
        await safeJson(
          favoriteResponse
        );

      if (!favoriteResponse.ok) {
        console.error(
          "Favorite check error:",
          favoriteData
        );

        return NextResponse.json(
          {
            error:
              favoriteData?.error?.message ||
              "Unable to check favorite",
          },
          {
            status:
              favoriteResponse.status,
          }
        );
      }

      return NextResponse.json({
        isFavorite:
          favoriteData.data?.length > 0,
      });
    }

    /* -----------------------------------------
       Get ALL favorites
    ----------------------------------------- */

    const favoritesResponse =
      await fetch(
        `${STRAPI_URL}/api/favorites?filters[user][id][$eq]=${encodeURIComponent(
          user.id
        )}&populate=listing`,
        {
          method: "GET",

          headers: {
            Authorization:
              `Bearer ${token}`,
          },

          cache: "no-store",
        }
      );

    const favoritesData =
      await safeJson(
        favoritesResponse
      );

    if (!favoritesResponse.ok) {
      console.error(
        "Get favorites error:",
        favoritesData
      );

      return NextResponse.json(
        {
          error:
            favoritesData?.error?.message ||
            "Unable to fetch favorites",
        },
        {
          status:
            favoritesResponse.status,
        }
      );
    }

    return NextResponse.json({
      data:
        favoritesData.data || [],
    });

  } catch (error) {
    console.error(
      "GET favorites error:",
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

/* =========================================================
   POST FAVORITE
========================================================= */

export async function POST(request: NextRequest) {
  try {
    const token =
      request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          error: "You must be logged in",
        },
        {
          status: 401,
        }
      );
    }

    /* -----------------------------------------
       Read body
    ----------------------------------------- */

    const body =
      await request.json();

    const listingId =
      body.listingId;

    if (!listingId) {
      return NextResponse.json(
        {
          error:
            "listingId is required",
        },
        {
          status: 400,
        }
      );
    }

    /* -----------------------------------------
       Get logged-in user
    ----------------------------------------- */

    const userResponse =
      await fetch(
        `${STRAPI_URL}/api/users/me`,
        {
          method: "GET",

          headers: {
            Authorization:
              `Bearer ${token}`,
          },

          cache: "no-store",
        }
      );

    const user =
      await safeJson(userResponse);

    if (!userResponse.ok) {
      console.error(
        "Get user error:",
        user
      );

      return NextResponse.json(
        {
          error:
            "Unable to identify logged-in user",
        },
        {
          status: 401,
        }
      );
    }

    /* -----------------------------------------
       Check existing favorite
    ----------------------------------------- */

    const existingResponse =
      await fetch(
        `${STRAPI_URL}/api/favorites?filters[user][id][$eq]=${encodeURIComponent(
          user.id
        )}&filters[listing][id][$eq]=${encodeURIComponent(
          listingId
        )}`,
        {
          method: "GET",

          headers: {
            Authorization:
              `Bearer ${token}`,
          },

          cache: "no-store",
        }
      );

    const existingData =
      await safeJson(
        existingResponse
      );

    if (
      existingResponse.ok &&
      existingData.data?.length > 0
    ) {
      return NextResponse.json({
        message:
          "This listing is already in your favorites",

        isFavorite: true,
      });
    }

    /* -----------------------------------------
       Create favorite
    ----------------------------------------- */

    const createResponse =
      await fetch(
        `${STRAPI_URL}/api/favorites`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            data: {
              user: user.id,
              listing: listingId,
            },
          }),
        }
      );

    const createData =
      await safeJson(
        createResponse
      );

    if (!createResponse.ok) {
      console.error(
        "Create favorite error:",
        createData
      );

      return NextResponse.json(
        {
          error:
            createData?.error?.message ||
            "Unable to add favorite",
        },
        {
          status:
            createResponse.status,
        }
      );
    }

    return NextResponse.json(
      {
        message:
          "Favorite added successfully",

        isFavorite: true,

        data:
          createData.data,
      },
      {
        status: 201,
      }
    );

  } catch (error) {
    console.error(
      "POST favorite error:",
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

/* =========================================================
   DELETE FAVORITE
========================================================= */

export async function DELETE(request: NextRequest) {
  try {
    const token =
      request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          error: "You must be logged in",
        },
        {
          status: 401,
        }
      );
    }

    /* -----------------------------------------
       Get listing ID
    ----------------------------------------- */

    const body =
      await request.json();

    const listingId =
      body.listingId;

    if (!listingId) {
      return NextResponse.json(
        {
          error:
            "listingId is required",
        },
        {
          status: 400,
        }
      );
    }

    console.log(
      "DELETE listingId:",
      listingId
    );

    /* -----------------------------------------
       Get logged-in user
    ----------------------------------------- */

    const userResponse =
      await fetch(
        `${STRAPI_URL}/api/users/me`,
        {
          method: "GET",

          headers: {
            Authorization:
              `Bearer ${token}`,
          },

          cache: "no-store",
        }
      );

    const user =
      await safeJson(userResponse);

    if (!userResponse.ok) {
      console.error(
        "Get user error:",
        user
      );

      return NextResponse.json(
        {
          error:
            "Unable to identify logged-in user",
        },
        {
          status: 401,
        }
      );
    }

    /* -----------------------------------------
       Find favorite
    ----------------------------------------- */

    const favoriteResponse =
      await fetch(
        `${STRAPI_URL}/api/favorites?filters[user][id][$eq]=${encodeURIComponent(
          user.id
        )}&filters[listing][id][$eq]=${encodeURIComponent(
          listingId
        )}`,
        {
          method: "GET",

          headers: {
            Authorization:
              `Bearer ${token}`,
          },

          cache: "no-store",
        }
      );

    const favoriteData =
      await safeJson(
        favoriteResponse
      );

    if (!favoriteResponse.ok) {
      console.error(
        "Find favorite error:",
        favoriteData
      );

      return NextResponse.json(
        {
          error:
            favoriteData?.error?.message ||
            "Unable to find favorite",
        },
        {
          status:
            favoriteResponse.status,
        }
      );
    }

    console.log(
      "Favorite search result:",
      favoriteData
    );

    /* -----------------------------------------
       Favorite doesn't exist
    ----------------------------------------- */

    if (
      !favoriteData.data ||
      favoriteData.data.length === 0
    ) {
      return NextResponse.json({
        message:
          "Favorite not found",

        isFavorite: false,
      });
    }

    /* -----------------------------------------
       Get favorite record
    ----------------------------------------- */

    const favorite =
      favoriteData.data[0];

    console.log(
      "Favorite found:",
      favorite
    );

    /* -----------------------------------------
       Get Strapi v5 documentId
    ----------------------------------------- */

    const favoriteId =
      favorite.documentId ||
      favorite.id;

    if (!favoriteId) {
      console.error(
        "Favorite ID missing:",
        favorite
      );

      return NextResponse.json(
        {
          error:
            "Favorite ID is missing",
        },
        {
          status: 500,
        }
      );
    }

    console.log(
      "Deleting favorite:",
      favoriteId
    );

    /* -----------------------------------------
       Delete favorite
    ----------------------------------------- */

    const deleteResponse =
      await fetch(
        `${STRAPI_URL}/api/favorites/${favoriteId}`,
        {
          method: "DELETE",

          headers: {
            Authorization:
              `Bearer ${token}`,
          },

          cache: "no-store",
        }
      );

    /*
      Do not assume DELETE has JSON.
      Strapi may return 204 No Content.
    */

    const deleteData =
      await safeJson(
        deleteResponse
      );

    /* -----------------------------------------
       Delete failed
    ----------------------------------------- */

    if (!deleteResponse.ok) {
      console.error(
        "Strapi delete error:",
        deleteData
      );

      return NextResponse.json(
        {
          error:
            deleteData?.error?.message ||
            "Unable to remove favorite",
        },
        {
          status:
            deleteResponse.status,
        }
      );
    }

    /* -----------------------------------------
       Delete successful
    ----------------------------------------- */

    console.log(
      "Favorite deleted successfully:",
      favoriteId
    );

    return NextResponse.json({
      message:
        "Favorite removed successfully",

      isFavorite: false,
    });

  } catch (error) {
    console.error(
      "DELETE favorites error:",
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