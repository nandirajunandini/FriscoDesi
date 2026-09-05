import {
  NextRequest,
  NextResponse,
} from "next/server";


function createSlug(
  name: string
) {
  return name
    .toLowerCase()
    .trim()
    .replace(
      /[^a-z0-9]+/g,
      "-"
    )
    .replace(
      /^-|-$/g,
      "");
}


/* =====================================================
   Determine Food Type From Google Places
===================================================== */

function determineFoodType(
  details: any
): string {

  const types: string[] =
    Array.isArray(
      details?.types
    )
      ? details.types
      : [];

  const primaryType =
    details?.primaryType ||
    "";


  /*
    ==============================================
    PURE VEGETARIAN
    ==============================================

    Google has dedicated place types for:

    vegetarian_restaurant
    vegan_restaurant

    We treat these as Pure Veg.
  */

  const isVegetarianRestaurant =
    types.includes(
      "vegetarian_restaurant"
    ) ||
    types.includes(
      "vegan_restaurant"
    ) ||
    primaryType ===
      "vegetarian_restaurant" ||
    primaryType ===
      "vegan_restaurant";


  if (
    isVegetarianRestaurant
  ) {
    return "Pure Veg";
  }


  /*
    ==============================================
    SERVES VEGETARIAN FOOD
    ==============================================

    Google does not provide a separate
    "servesNonVegetarianFood" field.

    Therefore:

    servesVegetarianFood = true
      → Veg & Non Veg

    This assumes a normal restaurant that
    serves vegetarian food is mixed rather
    than Pure Veg.

    Pure Veg was already handled above.
  */

  if (
    details?.servesVegetarianFood ===
    true
  ) {
    return "Veg & Non Veg";
  }


  /*
    ==============================================
    DOES NOT SERVE VEGETARIAN FOOD
    ==============================================

    We classify this as Non Veg.
  */

  if (
    details?.servesVegetarianFood ===
    false
  ) {
    return "Non Veg";
  }


  /*
    ==============================================
    UNKNOWN
    ==============================================
  */

  return "Not Applicable";
}


export async function POST(
  req: NextRequest
) {

  try {

    const body =
      await req.json();


    const STRAPI_URL =
      process.env.STRAPI_URL;

    const STRAPI_TOKEN =
      process.env.STRAPI_API_TOKEN;

    const GOOGLE_API_KEY =
      process.env.GOOGLE_PLACES_API_KEY;

    const APP_URL =
      process.env.NEXT_PUBLIC_APP_URL;


    if (
      !STRAPI_URL ||
      !STRAPI_TOKEN ||
      !GOOGLE_API_KEY ||
      !APP_URL
    ) {

      return NextResponse.json(
        {
          error:
            "Missing STRAPI_URL, STRAPI_API_TOKEN, GOOGLE_PLACES_API_KEY or NEXT_PUBLIC_APP_URL.",
        },
        {
          status: 500,
        }
      );

    }


    if (!body.name) {

      return NextResponse.json(
        {
          error:
            "Business name is required.",
        },
        {
          status: 400,
        }
      );

    }


    if (!body.id) {

      return NextResponse.json(
        {
          error:
            "Google Place ID is required.",
        },
        {
          status: 400,
        }
      );

    }


    const slug =
      createSlug(
        body.name
      );


    /* =====================================================
       Check Existing Listing
    ===================================================== */

    const existingRes =
      await fetch(
        `${STRAPI_URL}/api/listings?filters[slug][$eq]=${encodeURIComponent(
          slug
        )}`,
        {
          headers: {
            Authorization:
              `Bearer ${STRAPI_TOKEN}`,
          },

          cache:
            "no-store",
        }
      );


    if (!existingRes.ok) {

      const errorText =
        await existingRes.text();


      return NextResponse.json(
        {
          error:
            "Unable to check existing listing.",

          details:
            errorText,
        },
        {
          status:
            existingRes.status,
        }
      );

    }


    const existing =
      await existingRes.json();


    if (
      existing.data?.length >
      0
    ) {

      return NextResponse.json(
        {
          error:
            "Business already imported.",
        },
        {
          status: 400,
        }
      );

    }


    /* =====================================================
       Get Google Place Details BEFORE Creating Listing
    ===================================================== */

    console.log(
      "Getting Google Place Details:",
      body.name
    );


    const detailsRes =
      await fetch(
        `${APP_URL}/api/place-details?placeId=${encodeURIComponent(
          body.id
        )}`,
        {
          cache:
            "no-store",
        }
      );


    let details: any =
      null;


    let foodType =
      "Not Applicable";


    if (
      detailsRes.ok
    ) {

      details =
        await detailsRes.json();


      /*
        Determine Food Type automatically
      */

      foodType =
        determineFoodType(
          details
        );


      console.log(
        "===================================="
      );

      console.log(
        "FOOD TYPE CLASSIFICATION"
      );

      console.log(
        "Business:",
        body.name
      );

      console.log(
        "Google types:",
        details.types
      );

      console.log(
        "Primary type:",
        details.primaryType
      );

      console.log(
        "Serves vegetarian:",
        details.servesVegetarianFood
      );

      console.log(
        "Determined foodType:",
        foodType
      );

      console.log(
        "===================================="
      );

    } else {

      console.log(
        "Google Place Details failed. Using Not Applicable."
      );

    }


    /* =====================================================
       Create Listing
    ===================================================== */

    const createRes =
      await fetch(
        `${STRAPI_URL}/api/listings`,
        {
          method:
            "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${STRAPI_TOKEN}`,
          },

          body:
            JSON.stringify({
              data: {

                name:
                  body.name,

                slug,

                address:
                  body.address ||
                  "",

                zip:
                  body.zipCode ||
                  "",

                rating:
                  body.rating ||
                  0,

                reviewCount:
                  body.reviewCount ||
                  0,

                phone:
                  body.phone ||
                  "",

                website:
                  body.website ||
                  "",

                googlePlaceId:
                  body.id,

                featured:
                  false,

                category:
                  body.category,

                /*
                  Automatically determined.
                */

                foodType:
                  foodType,
              },
            }),
        }
      );


    const created =
      await createRes.json();


    if (!createRes.ok) {

      console.error(
        "CREATE LISTING FAILED:",
        created
      );


      return NextResponse.json(
        {
          error:
            created.error?.message ||
            "Unable to import business.",
        },
        {
          status:
            createRes.status,
        }
      );

    }


    const listingId =
      created.data.documentId;


    console.log(
      "===================================="
    );

    console.log(
      "CREATED LISTING:",
      body.name
    );

    console.log(
      "DOCUMENT ID:",
      listingId
    );

    console.log(
      "GOOGLE PLACE ID:",
      body.id
    );

    console.log(
      "FOOD TYPE:",
      foodType
    );


    /* =====================================================
       Google Photos
    ===================================================== */

    /*
      If Place Details failed above,
      try one more time so image importing
      still works.
    */

    if (!details) {

      const retryDetailsRes =
        await fetch(
          `${APP_URL}/api/place-details?placeId=${encodeURIComponent(
            body.id
          )}`,
          {
            cache:
              "no-store",
          }
        );


      if (
        retryDetailsRes.ok
      ) {

        details =
          await retryDetailsRes.json();

      }

    }


    console.log(
      "Google photos found:",
      details?.photos?.length ||
        0
    );


    /* =====================================================
       Upload ALL Google Photos
    ===================================================== */

    const mediaIds:
      number[] = [];


    if (
      details?.photos &&
      details.photos.length >
        0
    ) {

      for (
        let index = 0;
        index <
        details.photos.length;
        index++
      ) {

        const photo =
          details.photos[index];


        try {

          console.log(
            `Downloading photo ${
              index + 1
            }/${
              details.photos.length
            }:`,
            body.name
          );


          const imageRes =
            await fetch(
              `https://places.googleapis.com/v1/${photo.name}/media?maxHeightPx=900&maxWidthPx=1200`,
              {
                headers: {
                  "X-Goog-Api-Key":
                    GOOGLE_API_KEY,
                },
              }
            );


          if (
            !imageRes.ok
          ) {

            console.error(
              "Google photo download failed:",
              imageRes.status
            );

            continue;

          }


          const contentType =
            imageRes.headers.get(
              "content-type"
            ) ||
            "image/jpeg";


          const extension =
            contentType.includes(
              "png"
            )
              ? "png"
              : contentType.includes(
                  "webp"
                )
              ? "webp"
              : "jpg";


          const imageBuffer =
            await imageRes.arrayBuffer();


          const file =
            new File(
              [imageBuffer],

              `${slug}-${
                index + 1
              }-${Date.now()}.${extension}`,

              {
                type:
                  contentType,
              }
            );


          /* =================================================
             Upload to Strapi
          ================================================= */

          const formData =
            new FormData();


          formData.append(
            "files",
            file
          );


          const uploadRes =
            await fetch(
              `${STRAPI_URL}/api/upload`,
              {
                method:
                  "POST",

                headers: {
                  Authorization:
                    `Bearer ${STRAPI_TOKEN}`,
                },

                body:
                  formData,
              }
            );


          if (
            !uploadRes.ok
          ) {

            const uploadError =
              await uploadRes.text();


            console.error(
              "STRAPI IMAGE UPLOAD FAILED:",
              uploadRes.status,
              uploadError
            );

            continue;

          }


          const uploaded =
            await uploadRes.json();


          if (
            uploaded?.[0]?.id
          ) {

            mediaIds.push(
              uploaded[0].id
            );


            console.log(
              "Uploaded image:",
              index + 1,

              "Media ID:",
              uploaded[0].id
            );

          }


          /*
            Small delay between uploads
          */

          await new Promise(
            (resolve) =>
              setTimeout(
                resolve,
                300
              )
          );


        } catch (
          error
        ) {

          console.error(
            `Photo ${
              index + 1
            } upload error:`,

            error
          );

        }

      }

    }


    /* =====================================================
       Attach ALL Uploaded Images
    ===================================================== */

    if (
      mediaIds.length >
      0
    ) {

      console.log(
        "Attaching media IDs:",
        mediaIds
      );


      const updateRes =
        await fetch(
          `${STRAPI_URL}/api/listings/${listingId}`,
          {
            method:
              "PUT",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${STRAPI_TOKEN}`,
            },

            body:
              JSON.stringify({
                data: {
                  images:
                    mediaIds,
                },
              }),
          }
        );


      const updateText =
        await updateRes.text();


      if (
        !updateRes.ok
      ) {

        console.error(
          "FAILED TO ATTACH IMAGES:",
          updateRes.status,
          updateText
        );


        return NextResponse.json(
          {
            success:
              true,

            message:
              "Business imported, but images could not be attached.",

            listing:
              created.data,

            imagesUploaded:
              mediaIds.length,

            foodType,

            mediaIds,
          },
          {
            status:
              200,
          }
        );

      }


      console.log(
        "Images attached successfully."
      );


      console.log(
        "Total images:",
        mediaIds.length
      );

    } else {

      console.log(
        "No images were uploaded."
      );

    }


    /* =====================================================
       Final Response
    ===================================================== */

    return NextResponse.json({
      success:
        true,

      message:
        "Business imported successfully.",

      listing:
        created.data,

      imagesUploaded:
        mediaIds.length,

      /*
        Useful for testing.
      */

      foodType,

      documentId:
        listingId,
    });


  } catch (
    error: any
  ) {

    console.error(
      "IMPORT ERROR:",
      error
    );


    return NextResponse.json(
      {
        success:
          false,

        error:
          error?.message ||
          "Internal Server Error",
      },
      {
        status:
          500,
      }
    );

  }

}