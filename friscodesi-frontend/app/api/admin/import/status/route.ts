import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const STRAPI_URL = process.env.STRAPI_URL;
    const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN;

    if (!STRAPI_URL || !STRAPI_TOKEN) {
      return NextResponse.json(
        {
          error: "Strapi configuration is missing",
        },
        {
          status: 500,
        }
      );
    }

    const body = await request.json();

    const placeIds: string[] = Array.isArray(body.placeIds)
      ? body.placeIds
      : [];

    if (placeIds.length === 0) {
      return NextResponse.json({
        imported: {},
      });
    }

    /*
      Build Strapi filter:

      googlePlaceId IN [
        placeId1,
        placeId2,
        ...
      ]
    */

    const params = new URLSearchParams();

    placeIds.forEach((placeId, index) => {
      params.append(
        `filters[googlePlaceId][$in][${index}]`,
        placeId
      );
    });

    params.append(
      "fields[0]",
      "googlePlaceId"
    );

    params.append(
      "fields[1]",
      "documentId"
    );

    params.append(
      "fields[2]",
      "name"
    );

    params.append(
      "pagination[pageSize]",
      "100"
    );


    /*
      Get matching listings from Strapi
    */

    const response = await fetch(
      `${STRAPI_URL}/api/listings?${params.toString()}`,
      {
        headers: {
          Authorization:
            `Bearer ${STRAPI_TOKEN}`,
        },

        cache: "no-store",
      }
    );


    if (!response.ok) {
      const errorText =
        await response.text();

      console.error(
        "Strapi status check failed:",
        errorText
      );

      return NextResponse.json(
        {
          error:
            "Failed to check imported listings",
          details: errorText,
        },
        {
          status: response.status,
        }
      );
    }


    const data =
      await response.json();


    /*
      Convert Strapi response into:

      {
        "googlePlaceId1": "documentId1",
        "googlePlaceId2": "documentId2"
      }
    */

    const imported: Record<
      string,
      string
    > = {};


    for (
      const listing of data.data || []
    ) {

      const googlePlaceId =
        listing.googlePlaceId;

      const documentId =
        listing.documentId;


      if (
        googlePlaceId &&
        documentId
      ) {

        imported[googlePlaceId] =
          documentId;

      }

    }


    console.log(
      "Imported listings found:",
      Object.keys(imported).length
    );


    return NextResponse.json({
      imported,
    });


  } catch (error) {

    console.error(
      "Import status error:",
      error
    );


    return NextResponse.json(
      {
        error:
          "Failed checking import status",
      },
      {
        status: 500,
      }
    );
  }
}