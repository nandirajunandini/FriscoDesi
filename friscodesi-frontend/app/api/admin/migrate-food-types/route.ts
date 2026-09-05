import { NextResponse } from "next/server";

/* =====================================================
   Determine Food Type
===================================================== */

function determineFoodType(details: any): string {
  const types: string[] = Array.isArray(details?.types)
    ? details.types
    : [];

  const primaryType = details?.primaryType || "";

  /*
    Pure Veg

    Google specifically identifies vegetarian
    and vegan restaurants.
  */

  const isPureVeg =
    types.includes("vegetarian_restaurant") ||
    types.includes("vegan_restaurant") ||
    primaryType === "vegetarian_restaurant" ||
    primaryType === "vegan_restaurant";

  if (isPureVeg) {
    return "Pure Veg";
  }

  /*
    Veg & Non Veg

    Google says the restaurant serves
    vegetarian food.

    We classify a normal restaurant that
    serves vegetarian food as Veg & Non Veg.
  */

  if (details?.servesVegetarianFood === true) {
    return "Veg & Non Veg";
  }

  /*
    Non Veg

    Google says vegetarian food is not served.
  */

  if (details?.servesVegetarianFood === false) {
    return "Non Veg";
  }

  /*
    Google did not provide enough information.
  */

  return "Not Applicable";
}


/* =====================================================
   Search Google Place
   Used when listing has no Google Place ID
===================================================== */

async function searchGooglePlace(
  name: string,
  address: string,
  apiKey: string
) {
  const textQuery = address
    ? `${name}, ${address}`
    : `${name}, Frisco, TX`;

  console.log(
    "Google search:",
    textQuery
  );

  const response = await fetch(
    "https://places.googleapis.com/v1/places:searchText",
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",

        "X-Goog-Api-Key": apiKey,

        "X-Goog-FieldMask": [
          "places.id",
          "places.displayName",
          "places.formattedAddress",
          "places.types",
          "places.primaryType",
        ].join(","),
      },

      body: JSON.stringify({
        textQuery,
        pageSize: 1,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();

    throw new Error(
      `Google search failed (${response.status}): ${error}`
    );
  }

  const data = await response.json();

  const place = data.places?.[0];

  if (!place?.id) {
    return null;
  }

  return place;
}


/* =====================================================
   Get Google Place Details
===================================================== */

async function getGooglePlaceDetails(
  placeId: string,
  apiKey: string
) {
  const response = await fetch(
    `https://places.googleapis.com/v1/places/${encodeURIComponent(
      placeId
    )}`,
    {
      method: "GET",

      headers: {
        "X-Goog-Api-Key": apiKey,

        "X-Goog-FieldMask": [
          "id",
          "displayName",
          "types",
          "primaryType",
          "servesVegetarianFood",
        ].join(","),
      },

      cache: "no-store",
    }
  );

  if (!response.ok) {
    const error = await response.text();

    throw new Error(
      `Google details failed (${response.status}): ${error}`
    );
  }

  return await response.json();
}


/* =====================================================
   POST - Migrate Existing Food Listings
===================================================== */

export async function POST() {
  try {
    const STRAPI_URL =
      process.env.STRAPI_URL;

    const STRAPI_TOKEN =
      process.env.STRAPI_API_TOKEN;

    const GOOGLE_API_KEY =
      process.env.GOOGLE_PLACES_API_KEY;

    /* =================================================
       Validate Environment
    ================================================= */

    if (
      !STRAPI_URL ||
      !STRAPI_TOKEN ||
      !GOOGLE_API_KEY
    ) {
      return NextResponse.json(
        {
          success: false,

          error:
            "Missing STRAPI_URL, STRAPI_API_TOKEN or GOOGLE_PLACES_API_KEY.",
        },
        {
          status: 500,
        }
      );
    }

    console.log(
      "=========================================="
    );

    console.log(
      "STARTING FOOD TYPE MIGRATION"
    );

    console.log(
      "=========================================="
    );


    /* =================================================
       Get All Listings
    ================================================= */

    const allListings: any[] = [];

    let page = 1;

    const pageSize = 100;

    while (true) {
      const url =
        `${STRAPI_URL}/api/listings` +
        `?populate=category` +
        `&pagination[page]=${page}` +
        `&pagination[pageSize]=${pageSize}`;

      console.log(
        "Fetching listings page:",
        page
      );

      const response = await fetch(
        url,
        {
          headers: {
            Authorization:
              `Bearer ${STRAPI_TOKEN}`,
          },

          cache: "no-store",
        }
      );

      if (!response.ok) {
        const error =
          await response.text();

        return NextResponse.json(
          {
            success: false,

            error:
              "Failed to fetch listings from Strapi.",

            details: error,
          },
          {
            status: response.status,
          }
        );
      }

      const result =
        await response.json();

      const listings =
        result.data || [];

      allListings.push(
        ...listings
      );

      const pagination =
        result.meta?.pagination;

      if (
        !pagination ||
        page >= pagination.pageCount
      ) {
        break;
      }

      page++;
    }


    /* =================================================
       Find Food Listings
    ================================================= */

    const foodListings =
      allListings.filter(
        (listing: any) => {
          const category =
            listing.category;

          const categoryName =
            category?.name ||
            category?.data?.name ||
            category?.attributes?.name ||
            "";

          return (
            categoryName
              .toLowerCase()
              .trim() === "food"
          );
        }
      );

    console.log(
      "Total listings:",
      allListings.length
    );

    console.log(
      "Food listings:",
      foodListings.length
    );


    /* =================================================
       Migration Results
    ================================================= */

    const updated: any[] = [];

    const skipped: any[] = [];

    const failed: any[] = [];


    /* =================================================
       Process Each Food Listing
    ================================================= */

    for (
      const listing of foodListings
    ) {
      const documentId =
        listing.documentId;

      const name =
        listing.name || "Unknown";

      const address =
        listing.address || "";

      let googlePlaceId =
        listing.googlePlaceId || "";

      console.log(
        "------------------------------------------"
      );

      console.log(
        "Processing:",
        name
      );

      console.log(
        "Existing foodType:",
        listing.foodType
      );

      console.log(
        "Existing Google Place ID:",
        googlePlaceId ||
          "MISSING"
      );


      try {
        /* =========================================
           Step 1:
           Find Google Place ID if missing
        ========================================= */

        if (!googlePlaceId) {
          console.log(
            "Google Place ID missing."
          );

          console.log(
            "Searching Google using:",
            name,
            address
          );

          const googlePlace =
            await searchGooglePlace(
              name,
              address,
              GOOGLE_API_KEY
            );

          if (!googlePlace) {
            console.log(
              "Google place not found:",
              name
            );

            skipped.push({
              name,
              documentId,

              reason:
                "Google place not found",
            });

            continue;
          }

          googlePlaceId =
            googlePlace.id;

          console.log(
            "Google Place ID found:",
            googlePlaceId
          );


          /* =========================================
             Save Google Place ID to Strapi
          ========================================= */

          const savePlaceIdResponse =
            await fetch(
              `${STRAPI_URL}/api/listings/${documentId}`,
              {
                method: "PUT",

                headers: {
                  "Content-Type":
                    "application/json",

                  Authorization:
                    `Bearer ${STRAPI_TOKEN}`,
                },

                body: JSON.stringify({
                  data: {
                    googlePlaceId:
                      googlePlaceId,
                  },
                }),
              }
            );

          if (
            !savePlaceIdResponse.ok
          ) {
            const error =
              await savePlaceIdResponse.text();

            console.error(
              "Failed saving Google Place ID:",
              error
            );

            failed.push({
              name,
              documentId,

              reason:
                "Failed to save Google Place ID",

              details:
                error,
            });

            continue;
          }

          console.log(
            "Google Place ID saved."
          );
        }


        /* =========================================
           Step 2:
           Get Google Place Details
        ========================================= */

        const details =
          await getGooglePlaceDetails(
            googlePlaceId,
            GOOGLE_API_KEY
          );

        console.log(
          "Google name:",
          details.displayName?.text
        );

        console.log(
          "Google types:",
          details.types
        );

        console.log(
          "Google primary type:",
          details.primaryType
        );

        console.log(
          "Serves vegetarian:",
          details.servesVegetarianFood
        );


        /* =========================================
           Step 3:
           Determine Food Type
        ========================================= */

        const foodType =
          determineFoodType(
            details
          );

        console.log(
          "DETERMINED FOOD TYPE:",
          foodType
        );


        /* =========================================
           Step 4:
           Skip only when Google has no information
        ========================================= */

        if (
          foodType ===
          "Not Applicable"
        ) {
          console.log(
            "Google did not provide enough food information."
          );

          skipped.push({
            name,
            documentId,
            googlePlaceId,

            reason:
              "Google food type information unavailable",
          });

          continue;
        }


        /* =========================================
           Step 5:
           Update Strapi
        ========================================= */

        const updateResponse =
          await fetch(
            `${STRAPI_URL}/api/listings/${documentId}`,
            {
              method: "PUT",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${STRAPI_TOKEN}`,
              },

              body: JSON.stringify({
                data: {
                  foodType,
                  googlePlaceId,
                },
              }),
            }
          );

        if (
          !updateResponse.ok
        ) {
          const error =
            await updateResponse.text();

          console.error(
            "Strapi update failed:",
            error
          );

          failed.push({
            name,
            documentId,
            googlePlaceId,
            foodType,

            reason:
              error,
          });

          continue;
        }

        console.log(
          "UPDATED:",
          name,
          "→",
          foodType
        );

        updated.push({
          name,
          documentId,
          googlePlaceId,
          foodType,
        });


        /* =========================================
           Small delay
        ========================================= */

        await new Promise(
          (resolve) =>
            setTimeout(
              resolve,
              500
            )
        );

      } catch (error: any) {
        console.error(
          "Migration failed:",
          name,
          error
        );

        failed.push({
          name,
          documentId,
          googlePlaceId,

          reason:
            error?.message ||
            "Unknown error",
        });
      }
    }


    /* =================================================
       Final Result
    ================================================= */

    console.log(
      "=========================================="
    );

    console.log(
      "FOOD TYPE MIGRATION COMPLETE"
    );

    console.log(
      "Food listings:",
      foodListings.length
    );

    console.log(
      "Updated:",
      updated.length
    );

    console.log(
      "Skipped:",
      skipped.length
    );

    console.log(
      "Failed:",
      failed.length
    );

    console.log(
      "=========================================="
    );


    return NextResponse.json({
      success: true,

      message:
        "Food type migration completed.",

      totalFoodListings:
        foodListings.length,

      updated:
        updated.length,

      skipped:
        skipped.length,

      failed:
        failed.length,

      updatedListings:
        updated,

      skippedListings:
        skipped,

      failedListings:
        failed,
    });

  } catch (error: any) {
    console.error(
      "FOOD TYPE MIGRATION ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        error:
          error?.message ||
          "Food type migration failed.",
      },
      {
        status: 500,
      }
    );
  }
}