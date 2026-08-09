import { NextRequest, NextResponse } from "next/server";


function extractZipCode(address: string) {
  const match = address.match(/\b\d{5}\b/);

  return match ? match[0] : "";
}



/* =============================
   Convert Filters For Google
============================= */

function getFilterKeyword(filter?: string) {

  const map: Record<string, string> = {

    "Pure Veg":
      "vegetarian",

    "Non Veg":
      "Indian restaurant",

    "Veg & Non Veg":
      "Indian restaurant",

    "South Indian":
      "South Indian restaurant",

    "North Indian":
      "North Indian restaurant",


    Dentist:
      "dentist",

    Doctor:
      "doctor",

    Pharmacy:
      "pharmacy",


    Nanny:
      "nanny service",

    "Nanny Service":
      "nanny service",


    Maid:
      "house cleaning service",

    Salon:
      "beauty salon",

    Mechanic:
      "auto repair",


    Realtor:
      "real estate agent",

    Apartment:
      "apartments",

  };


  return filter
    ? map[filter] || filter
    : "";

}





export async function POST(
  req: NextRequest
) {


  try {


    const {
      query,
      category,
      filter,
      minRating,
      sortBy,

    } = await req.json();




    if (!query) {

      return NextResponse.json(
        {
          error:
            "Query is required",
        },
        {
          status:400,
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
          status:500,
        }
      );

    }





    const filterKeyword =
      getFilterKeyword(filter);




    let searchQuery =
      `${query} in Frisco TX`;




    if (filterKeyword) {

      searchQuery =
        `${filterKeyword} ${searchQuery}`;

    }



    console.log(
      "Google Search:",
      searchQuery
    );





    const response =
      await fetch(

        "https://places.googleapis.com/v1/places:searchText",

        {

          method:"POST",


          headers:{


            "Content-Type":
              "application/json",


            "X-Goog-Api-Key":
              apiKey,


            "X-Goog-FieldMask":
              [
                "places.id",
                "places.displayName",
                "places.formattedAddress",
                "places.rating",
                "places.userRatingCount",
                "places.websiteUri",
                "places.nationalPhoneNumber",
                "places.photos",

              ].join(","),


          },



          body:JSON.stringify({

            textQuery:
              searchQuery,


            pageSize:
              20,


          }),


        }

      );





    if (!response.ok) {


      const error =
        await response.text();



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






    let places =

      data.places?.map(

        (place:any)=>(


          {

            id:
              place.id,


            name:
              place.displayName?.text
              ?? "",



            address:
              place.formattedAddress
              ?? "",



            zipCode:
              extractZipCode(
                place.formattedAddress
                ?? ""
              ),



            rating:
              place.rating
              ?? 0,



            reviewCount:
              place.userRatingCount
              ?? 0,



            phone:
              place.nationalPhoneNumber
              ?? "",



            website:
              place.websiteUri
              ?? "",



            photos:
              place.photos
              ?? [],


          }


        )

      )
      ?? [];






    // Rating Filter

    if(minRating){


      places =
        places.filter(
          (place:any)=>
            place.rating >=
            Number(minRating)
        );


    }






    // Sorting

    if(sortBy === "reviews"){


      places.sort(
        (a:any,b:any)=>
          b.reviewCount -
          a.reviewCount
      );



    } else {



      places.sort(
        (a:any,b:any)=>
          b.rating -
          a.rating
      );



    }






    return NextResponse.json({

      places,


      searchQuery,


    });






  } catch(error:any){



    console.error(
      "Import search error:",
      error
    );



    return NextResponse.json(

      {
        error:
          "Something went wrong",
      },

      {
        status:500,
      }

    );


  }


}