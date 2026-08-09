import { NextResponse } from "next/server";

export async function GET() {
  try {
    const apiKey = process.env.WEATHER_API_KEY;

    const res = await fetch(
      `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=Frisco&days=7&aqi=no&alerts=no`,
      {
        cache: "no-store",
      }
    );

    if (!res.ok) {
      throw new Error("Failed to fetch weather");
    }

    const data = await res.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to fetch weather" },
      { status: 500 }
    );
  }
}