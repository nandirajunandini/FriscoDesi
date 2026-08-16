import { NextResponse } from "next/server";

export async function GET() {
  try {
    const STRAPI_URL =
      process.env.STRAPI_URL!;

    const STRAPI_TOKEN =
      process.env.STRAPI_API_TOKEN!;

    const GOOGLE_API_KEY =
      process.env.GOOGLE_PLACES_API_KEY!;

    const APP_URL =
      process.env.NEXT_PUBLIC_APP_URL!;

    if (
      !STRAPI_URL ||
      !STRAPI_TOKEN ||
      !GOOGLE_API_KEY ||
      !APP_URL
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Missing required environment variables.",
        },
        {
          status: 500,
        }
      );
    }

    /* =====================================================
       Get Listings
    ===================================================== */

    const listingsRes =
      await fetch(
        `${STRAPI_URL}/api/listings?populate=images&pagination[pageSize]=100`,
        {
          headers: {
            Authorization:
              `Bearer ${STRAPI_TOKEN}`,
          },

          cache: "no-store",
        }
      );

    if (!listingsRes.ok) {
      const errorText =
        await listingsRes.text();

      return NextResponse.json(
        {
          success: false,

          message:
            "Failed to fetch listings from Strapi.",

          details: errorText,
        },
        {
          status:
            listingsRes.status,
        }
      );
    }

    const listingsData =
      await listingsRes.json();

    /* =====================================================
       Only Listings WITHOUT Images
    ===================================================== */

    const listings =
      listingsData.data?.filter(
        (listing: any) =>
          !listing.images ||
          listing.images.length === 0
      ) ?? [];

    console.log(
      "===================================="
    );

    console.log(
      "Listings needing images:",
      listings.length
    );

    let updated = 0;

    let placeIdsFixed = 0;

    let notFound = 0;

    let imagesUploaded = 0;

    /* =====================================================
       Process Listings
    ===================================================== */

    for (
      const listing of listings
    ) {
      try {
        console.log(
          "===================================="
        );

        console.log(
          "Processing:",
          listing.name
        );

        console.log(
          "Document ID:",
          listing.documentId
        );

        /* =================================================
           Get Existing Google Place ID
        ================================================= */

        let placeId =
          listing.googlePlaceId;

        /* =================================================
           Find Google Place ID if Missing
        ================================================= */

        if (!placeId) {
          console.log(
            "No Google Place ID. Searching Google:",
            listing.name
          );

          const textQuery =
            listing.address
              ? `${listing.name}, ${listing.address}`
              : `${listing.name}, Frisco, TX`;

          console.log(
            "Google search query:",
            textQuery
          );

          const searchRes =
            await fetch(
              "https://places.googleapis.com/v1/places:searchText",
              {
                method: "POST",

                headers: {
                  "Content-Type":
                    "application/json",

                  "X-Goog-Api-Key":
                    GOOGLE_API_KEY,

                  "X-Goog-FieldMask":
                    "places.id,places.displayName,places.formattedAddress",
                },

                body: JSON.stringify({
                  textQuery,

                  pageSize: 1,
                }),
              }
            );

          if (!searchRes.ok) {
            console.log(
              "Google search failed:",
              await searchRes.text()
            );

            continue;
          }

          const searchData =
            await searchRes.json();

          console.log(
            "Google results:",
            searchData.places?.length || 0
          );

          const place =
            searchData.places?.[0];

          if (!place?.id) {
            console.log(
              "No Google Place found:",
              listing.name
            );

            notFound++;

            continue;
          }

          placeId =
            place.id;

          console.log(
            "Google Place found:",
            placeId
          );

          /* =================================================
             Save Google Place ID
          ================================================= */

          const savePlaceIdRes =
            await fetch(
              `${STRAPI_URL}/api/listings/${listing.documentId}`,
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
                      placeId,
                  },
                }),
              }
            );

          if (!savePlaceIdRes.ok) {
            console.log(
              "Failed saving Google Place ID:",
              await savePlaceIdRes.text()
            );

            continue;
          }

          placeIdsFixed++;

          console.log(
            "Google Place ID saved:",
            placeId
          );
        } else {
          console.log(
            "Existing Google Place ID:",
            placeId
          );
        }

        /* =================================================
           Get Google Place Details
        ================================================= */

        const detailsRes =
          await fetch(
            `${APP_URL}/api/place-details?placeId=${encodeURIComponent(
              placeId
            )}`,
            {
              cache: "no-store",
            }
          );

        if (!detailsRes.ok) {
          console.log(
            "Place details failed:",
            listing.name
          );

          continue;
        }

        const details =
          await detailsRes.json();

        /* =================================================
           Check Photos
        ================================================= */

        if (
          !details.photos ||
          details.photos.length === 0
        ) {
          console.log(
            "No Google photos:",
            listing.name
          );

          continue;
        }

        console.log(
          "Google photos found:",
          details.photos.length
        );

        /* =================================================
           Upload ALL Photos
        ================================================= */

        const mediaIds: number[] =
          [];

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
              listing.name
            );

            let imageRes:
              Response | null =
              null;

            /* =============================================
               Retry Google Photo Download
            ============================================= */

            for (
              let attempt = 1;
              attempt <= 3;
              attempt++
            ) {
              try {
                imageRes =
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
                  imageRes.ok
                ) {
                  break;
                }

                console.log(
                  `Photo attempt ${attempt} failed:`,
                  imageRes.status
                );
              } catch (error) {
                console.log(
                  `Photo attempt ${attempt} error:`,
                  error
                );
              }

              if (
                attempt < 3
              ) {
                await new Promise(
                  (resolve) =>
                    setTimeout(
                      resolve,
                      1000
                    )
                );
              }
            }

            /* =============================================
               Skip if Download Failed
            ============================================= */

            if (
              !imageRes ||
              !imageRes.ok
            ) {
              console.log(
                "Photo download failed after retries."
              );

              continue;
            }

            /* =============================================
               Convert to Buffer
            ============================================= */

            const buffer =
              await imageRes.arrayBuffer();

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

            /* =============================================
               Create File
            ============================================= */

            const file =
              new File(
                [buffer],
                `${listing.slug}-${index + 1}-${Date.now()}.${extension}`,
                {
                  type: contentType,
                }
              );

            /* =============================================
               Upload to Strapi
            ============================================= */

            const form =
              new FormData();

            form.append(
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

                  body: form,
                }
              );

            if (
              !uploadRes.ok
            ) {
              console.log(
                "Upload failed:",
                uploadRes.status,

                await uploadRes.text()
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

              imagesUploaded++;

              console.log(
                "Uploaded media:",
                uploaded[0].id
              );
            }

            /* =============================================
               Small Delay
            ============================================= */

            await new Promise(
              (resolve) =>
                setTimeout(
                  resolve,
                  300
                )
            );
          } catch (error) {
            console.log(
              "Photo processing error:",
              error
            );
          }
        }

        /* =================================================
           Attach Images
        ================================================= */

        if (
          mediaIds.length > 0
        ) {
          console.log(
            "Attaching images:",
            mediaIds
          );

          const updateRes =
            await fetch(
              `${STRAPI_URL}/api/listings/${listing.documentId}`,
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
                    images:
                      mediaIds,
                  },
                }),
              }
            );

          const updateText =
            await updateRes.text();

          if (
            updateRes.ok
          ) {
            updated++;

            console.log(
              "UPDATED:",
              listing.name
            );

            console.log(
              "Images attached:",
              mediaIds.length
            );
          } else {
            console.log(
              "IMAGE ATTACH FAILED:",
              updateRes.status,

              updateText
            );
          }
        } else {
          console.log(
            "No images uploaded:",
            listing.name
          );
        }

        /* =================================================
           Delay Before Next Listing
        ================================================= */

        await new Promise(
          (resolve) =>
            setTimeout(
              resolve,
              500
            )
        );
      } catch (error) {
        console.error(
          "Failed listing:",
          listing.name,

          error
        );
      }
    }

    /* =====================================================
       Final Response
    ===================================================== */

    return NextResponse.json({
      success: true,

      processed:
        listings.length,

      placeIdsFixed,

      updated,

      notFound,

      imagesUploaded,

      message:
        `Processed ${listings.length} listings. ` +
        `Fixed ${placeIdsFixed} Place IDs. ` +
        `Updated ${updated} listings. ` +
        `Uploaded ${imagesUploaded} images. ` +
        `${notFound} listings were not found on Google.`,
    });
  } catch (error: any) {
    console.error(
      "FIX IMAGES ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Failed fixing images",

        error:
          error?.message ||
          "Unknown error",
      },
      {
        status: 500,
      }
    );
  }
}