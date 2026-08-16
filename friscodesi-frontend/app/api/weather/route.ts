import { NextResponse } from "next/server";

function buildFallbackWeatherData() {
  const today = new Date();
  const formatDate = (offset: number) => {
    const date = new Date(today);
    date.setDate(date.getDate() + offset);
    return date.toISOString().slice(0, 10);
  };

  return {
    location: {
      name: "Frisco",
      region: "Texas",
      country: "United States of America",
    },
    current: {
      temp_f: 82,
      feelslike_f: 84,
      humidity: 55,
      condition: {
        text: "Partly cloudy",
        icon: "//cdn.weatherapi.com/weather/64x64/day/116.png",
      },
    },
    forecast: {
      forecastday: [
        { date: formatDate(0), day: { maxtemp_f: 82, mintemp_f: 68, daily_chance_of_rain: 20, condition: { text: "Partly cloudy", icon: "//cdn.weatherapi.com/weather/64x64/day/116.png" } } },
        { date: formatDate(1), day: { maxtemp_f: 84, mintemp_f: 70, daily_chance_of_rain: 30, condition: { text: "Sunny", icon: "//cdn.weatherapi.com/weather/64x64/day/113.png" } } },
        { date: formatDate(2), day: { maxtemp_f: 86, mintemp_f: 71, daily_chance_of_rain: 25, condition: { text: "Partly cloudy", icon: "//cdn.weatherapi.com/weather/64x64/day/116.png" } } },
        { date: formatDate(3), day: { maxtemp_f: 88, mintemp_f: 72, daily_chance_of_rain: 35, condition: { text: "Sunny", icon: "//cdn.weatherapi.com/weather/64x64/day/113.png" } } },
        { date: formatDate(4), day: { maxtemp_f: 89, mintemp_f: 73, daily_chance_of_rain: 40, condition: { text: "Light rain", icon: "//cdn.weatherapi.com/weather/64x64/day/296.png" } } },
        { date: formatDate(5), day: { maxtemp_f: 87, mintemp_f: 71, daily_chance_of_rain: 45, condition: { text: "Light rain", icon: "//cdn.weatherapi.com/weather/64x64/day/296.png" } } },
        { date: formatDate(6), day: { maxtemp_f: 86, mintemp_f: 70, daily_chance_of_rain: 20, condition: { text: "Sunny", icon: "//cdn.weatherapi.com/weather/64x64/day/113.png" } } },
      ],
    },
  };
}

export async function GET() {
  try {
    const apiKey = process.env.WEATHER_API_KEY;

    if (!apiKey) {
      console.warn("WEATHER_API_KEY is missing. Using fallback weather data.");
      return NextResponse.json(buildFallbackWeatherData());
    }

    const res = await fetch(
      `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=Frisco&days=7&aqi=no&alerts=no`,
      {
        cache: "no-store",
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      console.warn(
        `Weather API request failed (${res.status}): ${errorText.slice(0, 200)}. Using fallback weather data.`
      );
      return NextResponse.json(buildFallbackWeatherData());
    }

    const data = await res.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Weather route error:", error);
    return NextResponse.json(buildFallbackWeatherData());
  }
}