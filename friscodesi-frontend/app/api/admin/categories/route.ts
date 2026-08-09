import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch(
      `${process.env.STRAPI_URL}/api/categories?pagination[pageSize]=100`,
      {
        headers: {
          Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
        },
        cache: "no-store",
      }
    );

    const data = await res.json();


    const categories =
      data.data?.map((item:any)=>({
        id:item.id,
        documentId:item.documentId,
        name:item.name
      })) || [];


    return NextResponse.json({
      categories
    });


  } catch (error) {

    console.error(error);

    return NextResponse.json(
      {
        error:"Unable to fetch categories"
      },
      {
        status:500
      }
    );

  }
}