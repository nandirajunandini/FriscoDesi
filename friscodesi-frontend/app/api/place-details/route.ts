import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest
) {
  try {
    const apiKey =
      process.env.GOOGLE_PLACES_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "GOOGLE_PLACES_API_KEY is missing.",
        },
        {
          status: 500,
        }
      );
    }

    const placeId =
      request.nextUrl.searchParams.get(
        "placeId"
      );

    if (!placeId) {
      return NextResponse.json(
        {
          error:
            "placeId is required.",
        },
        {
          status: 400,
        }
      );
    }

    const response =
      await fetch(
        `https://places.googleapis.com/v1/places/${encodeURIComponent(
          placeId
        )}`,
        {
          headers: {
            "X-Goog-Api-Key":
              apiKey,

            /*
              Added:

              types
              primaryType
              servesVegetarianFood

              These are used by the
              import route to classify
              food businesses.
            */

            "X-Goog-FieldMask": [
              "id",
              "displayName",
              "formattedAddress",
              "rating",
              "userRatingCount",
              "internationalPhoneNumber",
              "websiteUri",
              "regularOpeningHours",
              "reviews",
              "photos",
              "location",
              "googleMapsUri",

              "types",
              "primaryType",
              "servesVegetarianFood",
            ].join(","),
          },
        }
      );

    if (!response.ok) {
      const error =
        await response.text();

      return NextResponse.json(
        {
          error:
            "Google Places Details API failed.",

          details:
            error,
        },
        {
          status:
            response.status,
        }
      );
    }

    const data =
      await response.json();

    /*
      ==========================================
      Convert Google photos to usable URLs
      ==========================================
    */

    if (data.photos) {
      data.photos =
        data.photos.map(
          (photo: any) => ({
            ...photo,

            url:
              `https://places.googleapis.com/v1/${photo.name}/media?maxHeightPx=900&maxWidthPx=1200&key=${apiKey}`,
          })
        );
    }

    /*
      Debug food information
    */

    console.log(
      "Google food information:",
      {
        placeId:
          data.id,

        name:
          data.displayName?.text,

        types:
          data.types,

        primaryType:
          data.primaryType,

        servesVegetarianFood:
          data.servesVegetarianFood,
      }
    );

    return NextResponse.json(
      data
    );
  } catch (err: any) {
    console.error(
      "Place details error:",
      err
    );

    return NextResponse.json(
      {
        error:
          err.message,
      },
      {
        status: 500,
      }
    );
  }
}