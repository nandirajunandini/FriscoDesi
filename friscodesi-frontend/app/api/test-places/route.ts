import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error: "GOOGLE_PLACES_API_KEY is missing.",
        },
        { status: 500 }
      );
    }

    const query = request.nextUrl.searchParams.get("query");

    if (!query) {
      return NextResponse.json(
        {
          error: "Missing query parameter.",
        },
        { status: 400 }
      );
    }

    const response = await fetch(
      "https://places.googleapis.com/v1/places:searchText",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask":
            "places.id,places.displayName,places.formattedAddress,places.location,places.primaryType,places.rating,places.userRatingCount",
        },
        body: JSON.stringify({
          textQuery: query,
          pageSize: 5,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "Google Places search failed.",
          details: data,
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message,
      },
      { status: 500 }
    );
  }
}