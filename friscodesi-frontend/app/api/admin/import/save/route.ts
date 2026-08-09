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

    const slug = createSlug(body.name);

    /* ==========================
       Check Existing Listing
    ========================== */

    const existingRes = await fetch(
      `${process.env.STRAPI_URL}/api/listings?filters[slug][$eq]=${slug}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
        },
        cache: "no-store",
      }
    );

    const existing = await existingRes.json();

    if (existing.data?.length > 0) {
      return NextResponse.json(
        {
          error: "Business already imported.",
        },
        {
          status: 400,
        }
      );
    }

    /* ==========================
       Create Listing
    ========================== */

    const createRes = await fetch(
      `${process.env.STRAPI_URL}/api/listings`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
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

            googlePlaceId: body.id || "",

            featured: false,

            category: body.category,

            foodType: body.foodType || "Not Applicable",
          },
        }),
      }
    );

    const created = await createRes.json();

    if (!createRes.ok) {
      console.error(created);

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

    const listingId = created.data.documentId;
    console.log("CREATED LISTING:", created.data);
    console.log("DOCUMENT ID:", listingId);
    /* ==========================
       Fetch Google Place Details
    ========================== */

    const detailsRes = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/place-details?placeId=${body.id}`,
      {
        cache: "no-store",
      }
    );

    let mediaIds: number[] = [];

    if (detailsRes.ok) {
      const details = await detailsRes.json();

      if (details.photos?.length) {

        for (const photo of details.photos.slice(0,1)) {

          try {

            /* Download Google Image */

           const imageRes = await fetch(
            
  `https://places.googleapis.com/v1/${photo.name}/media?maxHeightPx=900&maxWidthPx=1200`,
  {
    headers: {
      "X-Goog-Api-Key": process.env.GOOGLE_PLACES_API_KEY!,
    },
  }
);
console.log("Content-Type:", imageRes.headers.get("content-type"));
            if (!imageRes.ok) continue;

            const imageBuffer = await imageRes.arrayBuffer();

const file = new File(
  [imageBuffer],
  `${slug}-${Date.now()}.jpg`,
  {
    type: "image/jpeg",
  }
);

const formData = new FormData();

formData.append("files", file);

for (const pair of formData.entries()) {
  console.log(pair[0], pair[1]);
}
           const uploadRes = await fetch(
  `${process.env.STRAPI_URL}/api/upload`,
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
    },
    body: formData,
  }
);

console.log("Upload Status:", uploadRes.status);

const uploadText = await uploadRes.text();

console.log("Upload Response:", uploadText);

if (!uploadRes.ok) {
  continue;
}

const uploaded = JSON.parse(uploadText);

console.log("Uploaded:", uploaded);

            if (uploaded.length > 0) {
              mediaIds.push(uploaded[0].id);
            }

          } catch (err) {
            console.error("Image Upload Error:", err);
          }

        }

      }
    }
    /* ==========================
       Attach Images to Listing
    ========================== */

    if (mediaIds.length > 0) {

  console.log("Media IDs:", mediaIds);

  const updateRes = await fetch(
    `${process.env.STRAPI_URL}/api/listings/${listingId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
      },
      body: JSON.stringify({
        data: {
          images: mediaIds.map((id)=>id),
        },
      }),
    }
  );

  console.log("Attach Status:", updateRes.status);

  const updateText = await updateRes.text();

  console.log("Attach Response:", updateText);

  if (!updateRes.ok) {
    console.error("Unable to attach images");
  } else {
    console.log(`${mediaIds.length} images attached successfully.`);
  }

}

    return NextResponse.json({
      success: true,
      message: "Business imported successfully.",
      listing: created.data,
    });
    } catch (error) {

    console.error(
      "Import Error:",
      error
    );

    return NextResponse.json(
      {
        error: "Internal Server Error",
      },
      {
        status: 500,
      }
    );

  }

}
