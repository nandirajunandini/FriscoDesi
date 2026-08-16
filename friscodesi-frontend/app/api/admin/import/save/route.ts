import { NextRequest, NextResponse } from "next/server";

function createSlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const STRAPI_URL = process.env.STRAPI_URL;
    const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN;
    const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
    const APP_URL = process.env.NEXT_PUBLIC_APP_URL;

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
        { status: 500 }
      );
    }

    if (!body.name) {
      return NextResponse.json(
        {
          error: "Business name is required.",
        },
        { status: 400 }
      );
    }

    if (!body.id) {
      return NextResponse.json(
        {
          error: "Google Place ID is required.",
        },
        { status: 400 }
      );
    }

    const slug = createSlug(body.name);

    /* =====================================================
       Check Existing Listing
    ===================================================== */

    const existingRes = await fetch(
      `${STRAPI_URL}/api/listings?filters[slug][$eq]=${encodeURIComponent(
        slug
      )}`,
      {
        headers: {
          Authorization: `Bearer ${STRAPI_TOKEN}`,
        },
        cache: "no-store",
      }
    );

    if (!existingRes.ok) {
      const errorText = await existingRes.text();

      return NextResponse.json(
        {
          error: "Unable to check existing listing.",
          details: errorText,
        },
        { status: existingRes.status }
      );
    }

    const existing = await existingRes.json();

    if (existing.data?.length > 0) {
      return NextResponse.json(
        {
          error: "Business already imported.",
        },
        { status: 400 }
      );
    }

    /* =====================================================
       Create Listing
    ===================================================== */

    const createRes = await fetch(
      `${STRAPI_URL}/api/listings`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${STRAPI_TOKEN}`,
        },
        body: JSON.stringify({
          data: {
            name: body.name,
            slug,

            address: body.address || "",
            zip: body.zipCode || "",

            rating: body.rating || 0,
            reviewCount: body.reviewCount || 0,

            phone: body.phone || "",
            website: body.website || "",

            // IMPORTANT:
            // Save the Google Place ID
            googlePlaceId: body.id,

            featured: false,

            category: body.category,

            foodType:
              body.foodType || "Not Applicable",
          },
        }),
      }
    );

    const created = await createRes.json();

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
          status: createRes.status,
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

    /* =====================================================
       Get Google Place Details
    ===================================================== */

    const detailsRes = await fetch(
      `${APP_URL}/api/place-details?placeId=${encodeURIComponent(
        body.id
      )}`,
      {
        cache: "no-store",
      }
    );

    if (!detailsRes.ok) {
      const detailsError =
        await detailsRes.text();

      console.error(
        "PLACE DETAILS FAILED:",
        detailsError
      );

      return NextResponse.json({
        success: true,
        message:
          "Business imported, but Google photos could not be retrieved.",
        listing: created.data,
        imagesUploaded: 0,
      });
    }

    const details =
      await detailsRes.json();

    console.log(
      "Google photos found:",
      details.photos?.length || 0
    );

    /* =====================================================
       Upload ALL Google Photos
    ===================================================== */

    const mediaIds: number[] = [];

    if (
      details.photos &&
      details.photos.length > 0
    ) {
      for (
        let index = 0;
        index < details.photos.length;
        index++
      ) {
        const photo =
          details.photos[index];

        try {
          console.log(
            `Downloading photo ${index + 1}/${details.photos.length}:`,
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

          if (!imageRes.ok) {
            console.error(
              "Google photo download failed:",
              imageRes.status
            );

            continue;
          }

          const contentType =
            imageRes.headers.get(
              "content-type"
            ) || "image/jpeg";

          const extension =
            contentType.includes("png")
              ? "png"
              : contentType.includes("webp")
              ? "webp"
              : "jpg";

          const imageBuffer =
            await imageRes.arrayBuffer();

          const file = new File(
            [imageBuffer],
            `${slug}-${index + 1}-${Date.now()}.${extension}`,
            {
              type: contentType,
            }
          );

          /* =================================================
             Upload to Strapi Media Library
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
                method: "POST",
                headers: {
                  Authorization:
                    `Bearer ${STRAPI_TOKEN}`,
                },
                body: formData,
              }
            );

          if (!uploadRes.ok) {
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
           * Small delay between uploads
           */
          await new Promise(
            (resolve) =>
              setTimeout(resolve, 300)
          );
        } catch (error) {
          console.error(
            `Photo ${index + 1} upload error:`,
            error
          );
        }
      }
    }

    /* =====================================================
       Attach ALL Uploaded Images to Listing
    ===================================================== */

    if (mediaIds.length > 0) {
      console.log(
        "Attaching media IDs:",
        mediaIds
      );

      const updateRes =
        await fetch(
          `${STRAPI_URL}/api/listings/${listingId}`,
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
                images: mediaIds,
              },
            }),
          }
        );

      const updateText =
        await updateRes.text();

      if (!updateRes.ok) {
        console.error(
          "FAILED TO ATTACH IMAGES:",
          updateRes.status,
          updateText
        );

        return NextResponse.json(
          {
            success: true,

            message:
              "Business imported, but images could not be attached.",

            listing:
              created.data,

            imagesUploaded:
              mediaIds.length,

            mediaIds,
          },
          { status: 200 }
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
      success: true,

      message:
        "Business imported successfully.",

      listing:
        created.data,

      imagesUploaded:
        mediaIds.length,
    });
  } catch (error: any) {
    console.error(
      "IMPORT ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        error:
          error?.message ||
          "Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}