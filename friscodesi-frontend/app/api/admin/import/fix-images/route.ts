import { NextResponse } from "next/server";

export async function GET() {
  try {
    const STRAPI_URL = process.env.STRAPI_URL!;
    const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN!;
    const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY!;
    const APP_URL = process.env.NEXT_PUBLIC_APP_URL!;


    /* =================================
       Get listings with Google Place ID
    ================================= */

    const listingsRes = await fetch(
      `${STRAPI_URL}/api/listings?filters[googlePlaceId][$notNull]=true&populate=images`,
      {
        headers: {
          Authorization: `Bearer ${STRAPI_TOKEN}`,
        },
        cache: "no-store",
      }
    );


    const listingsData = await listingsRes.json();


    const listings =
      listingsData.data?.filter(
        (listing: any) =>
          !listing.images ||
          listing.images.length === 0
      ) ?? [];


    console.log(
      "Listings needing images:",
      listings.length
    );


    let updated = 0;



    /* =================================
       Process each listing
    ================================= */

    for (const listing of listings) {


      try {

        console.log(
          "Processing:",
          listing.name
        );


        const placeId =
          listing.googlePlaceId;


        if (!placeId) {
          continue;
        }



        /* =================================
           Get Google Place Details
        ================================= */


        const detailsRes = await fetch(
          `${APP_URL}/api/place-details?placeId=${placeId}`,
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



        if (
          !details.photos ||
          details.photos.length === 0
        ) {

          console.log(
            "No photos:",
            listing.name
          );

          continue;

        }



        const mediaIds:number[] = [];



        /* =================================
           Upload Google Photos
        ================================= */


        for (
          const photo of details.photos.slice(0,5)
        ) {


          try {


            const imageRes =
              await fetch(
                `https://places.googleapis.com/v1/${photo.name}/media?maxHeightPx=900&maxWidthPx=1200`,
                {
                  headers:{
                    "X-Goog-Api-Key":
                      GOOGLE_API_KEY,
                  },
                }
              );


            if(!imageRes.ok){

              console.log(
                "Photo download failed"
              );

              continue;
            }



            const buffer =
              await imageRes.arrayBuffer();



            const file =
              new File(
                [buffer],
                `${listing.slug}-${Date.now()}.jpg`,
                {
                  type:
                    "image/jpeg",
                }
              );



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
                  method:"POST",

                  headers:{
                    Authorization:
                      `Bearer ${STRAPI_TOKEN}`,
                  },

                  body:form,
                }
              );



            if(!uploadRes.ok){

              console.log(
                "Upload failed:",
                listing.name
              );

              continue;
            }



            const uploaded =
              await uploadRes.json();



            if(
              uploaded?.[0]?.id
            ){

              mediaIds.push(
                uploaded[0].id
              );

            }



            // avoid Sharp temp file locking
            await new Promise(
              resolve =>
                setTimeout(resolve,500)
            );


          }
          catch(error){

            console.log(
              "Photo error:",
              error
            );

          }


        }



        /* =================================
           Attach images to listing
        ================================= */


        if(mediaIds.length > 0){


          const updateRes =
            await fetch(
              `${STRAPI_URL}/api/listings/${listing.documentId}`,
              {
                method:"PUT",

                headers:{
                  "Content-Type":
                    "application/json",

                  Authorization:
                    `Bearer ${STRAPI_TOKEN}`,
                },


                body:JSON.stringify({

                  data:{
                    images:
                      mediaIds,
                  },

                }),

              }
            );



          if(updateRes.ok){

            updated++;

            console.log(
              "Updated:",
              listing.name
            );

          }
          else {

            console.log(
              "Update failed:",
              listing.name
            );

          }


        }
        else {

          console.log(
            "No images uploaded:",
            listing.name
          );

        }


      }
      catch(error){

        console.log(
          "Failed listing:",
          listing.name,
          error
        );

      }


    }



    return NextResponse.json({

      success:true,

      processed:
        listings.length,

      updated,

      message:
        `Updated ${updated} listings`

    });


  }
  catch(error){


    console.error(
      error
    );


    return NextResponse.json(
      {
        success:false,
        message:
          "Failed fixing images"
      },
      {
        status:500,
      }
    );

  }
}