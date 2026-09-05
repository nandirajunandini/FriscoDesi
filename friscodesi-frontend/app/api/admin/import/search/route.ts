import { NextRequest, NextResponse } from "next/server";

function extractZipCode(address: string) {
  const match = address.match(/\b\d{5}\b/);
  return match ? match[0] : "";
}

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();

    if (!query?.trim()) {
      return NextResponse.json(
        {
          error: "Query is required",
        },
        {
          status: 400,
        }
      );
    }

    const apiKey =
      process.env.GOOGLE_PLACES_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "Google Places API key is missing",
        },
        {
          status: 500,
        }
      );
    }

    /*
      ==========================================
      ADMIN SEARCH
      ==========================================

      No Food Type filter here.

      Admin searches whatever they want.
    */

    const searchQuery = query.trim();

    console.log(
      "Google Admin Search:",
      searchQuery
    );

    const response = await fetch(
      "https://places.googleapis.com/v1/places:searchText",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",

          "X-Goog-Api-Key":
            apiKey,

          /*
            Added:
            - types
            - primaryType

            These will help the save route
            classify food businesses.
          */

          "X-Goog-FieldMask": [
            "places.id",
            "places.displayName",
            "places.formattedAddress",
            "places.rating",
            "places.userRatingCount",
            "places.websiteUri",
            "places.nationalPhoneNumber",
            "places.photos",
            "places.types",
            "places.primaryType",
          ].join(","),
        },

        body: JSON.stringify({
          textQuery: searchQuery,

          pageSize: 20,
        }),
      }
    );

    if (!response.ok) {
      const error =
        await response.text();

      console.error(
        "Google Places API error:",
        error
      );

      return NextResponse.json(
        {
          error:
            "Google Places API request failed",

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

    console.log(
      "Google results:",
      data.places?.length || 0
    );

    /*
      ==========================================
      Convert Google Places response
      ==========================================
    */

    const places =
      data.places?.map(
        (place: any) => ({
          id:
            place.id,

          name:
            place.displayName?.text ||
            "",

          address:
            place.formattedAddress ||
            "",

          zipCode:
            extractZipCode(
              place.formattedAddress ||
              ""
            ),

          rating:
            place.rating ||
            0,

          reviewCount:
            place.userRatingCount ||
            0,

          phone:
            place.nationalPhoneNumber ||
            "",

          website:
            place.websiteUri ||
            "",

          photos:
            place.photos ||
            [],

          /*
            Google place types
          */

          types:
            place.types ||
            [],

          primaryType:
            place.primaryType ||
            "",
        })
      ) || [];

    return NextResponse.json({
      places,

      searchQuery,
    });
  } catch (error: any) {
    console.error(
      "Import search error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong",

        details:
          error?.message,
      },
      {
        status: 500,
      }
    );
  }
}