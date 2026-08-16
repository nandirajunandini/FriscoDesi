import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ documentId: string }> }
) {
  try {

    const STRAPI_URL = process.env.STRAPI_URL!;
    const TOKEN = process.env.STRAPI_API_TOKEN!;


    const { documentId } = await params;

    console.log(
      "DELETE DOCUMENT ID:",
      documentId
    );


    /*
      Get listing with images
    */

   // Get listing with images

const listingRes = await fetch(
  `${STRAPI_URL}/api/listings/${documentId}?populate=images`,
  {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
    },
    cache: "no-store",
  }
);

const listingData = await listingRes.json();

console.log(
  "STRAPI LISTING RESPONSE:",
  JSON.stringify(listingData, null, 2)
);

if (!listingRes.ok) {
  return NextResponse.json(
    {
      error: "Failed to get listing",
      details: listingData,
    },
    {
      status: listingRes.status,
    }
  );
}

const listing = listingData.data;

if (!listing) {
  return NextResponse.json(
    {
      error: "Listing not found",
    },
    {
      status: 404,
    }
  );
}



    /*
      Delete uploaded images
    */

    if (
      listing.images &&
      listing.images.length > 0
    ) {


      for (
        const image of listing.images
      ) {


        const mediaDelete =
          await fetch(
            `${STRAPI_URL}/api/upload/files/${image.id}`,
            {
              method:"DELETE",
              headers:{
                Authorization:
                  `Bearer ${TOKEN}`,
              },
            }
          );


        console.log(
          "Deleted media:",
          image.id,
          mediaDelete.status
        );

      }

    }



    /*
      Delete listing
      Strapi v5 uses documentId
    */


    const deleteListing =
      await fetch(
        `${STRAPI_URL}/api/listings/${documentId}`,
        {
          method:"DELETE",
          headers:{
            Authorization:
              `Bearer ${TOKEN}`,
          },
        }
      );



    const deleteResponse =
      await deleteListing.text();



    console.log(
      "Listing delete response:",
      deleteListing.status,
      deleteResponse
    );



    if(!deleteListing.ok){

      return NextResponse.json(
        {
          error:
          "Failed deleting listing",
          details:
          deleteResponse
        },
        {
          status:500
        }
      );

    }



    return NextResponse.json(
      {
        success:true,
        message:
        "Listing and images removed successfully"
      }
    );


  }
  catch(error:any){

    console.error(
      "DELETE ERROR:",
      error
    );


    return NextResponse.json(
      {
        error:
        "Delete failed",
        details:
        error.message
      },
      {
        status:500
      }
    );

  }
}