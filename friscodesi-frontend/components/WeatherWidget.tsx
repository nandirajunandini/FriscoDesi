"use client";

import { useEffect, useState } from "react";

interface ForecastDay {
  day: string;
  date: string;
  icon: string;
  condition: string;
  rain: number;
  maxTemp: number;
  minTemp: number;
}

export default function WeatherWidget() {
  const [forecast, setForecast] = useState<ForecastDay[]>([]);
  const [location, setLocation] = useState("");
  const [today, setToday] = useState<any>(null);

  useEffect(() => {
    async function fetchWeather() {
      try {
        const res = await fetch("/api/weather");
        const data = await res.json();

        setLocation(
          `${data.location.name}, ${
            data.location.region || data.location.country
          }`
        );

        setToday({
          temp: Math.round(data.current.temp_f),
          feels: Math.round(data.current.feelslike_f),
          humidity: data.current.humidity,
          condition: data.current.condition.text,
          icon: "https:" + data.current.condition.icon,
        });

        const weather = data.forecast.forecastday.map(
          (item: any) => ({
            day: new Date(item.date).toLocaleDateString(
              "en-US",
              {
                weekday: "short",
              }
            ),

            date: new Date(item.date).toLocaleDateString(
              "en-US",
              {
                month: "short",
                day: "numeric",
              }
            ),

            icon:
              "https:" + item.day.condition.icon,

            condition:
              item.day.condition.text,

            rain:
              item.day.daily_chance_of_rain,

            maxTemp:
              Math.round(item.day.maxtemp_f),

            minTemp:
              Math.round(item.day.mintemp_f),
          })
        );

        setForecast(weather);
      } catch (err) {
        console.error(err);
      }
    }

    fetchWeather();
  }, []);

  /* =========================
     Loading
  ========================= */

  if (!today) {
    return (
      <div className="w-full max-w-md bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8 text-center">
        <div className="flex flex-col items-center gap-3">

          <div className="w-10 h-10 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin" />

          <p className="text-gray-500 font-medium">
            Loading Frisco weather...
          </p>

        </div>
      </div>
    );
  }

  return (
    <div
      className="
        w-full
        max-w-md
        bg-white
        rounded-[28px]
        shadow-2xl
        shadow-blue-950/20
        overflow-hidden
        border
        border-white/60
      "
    >

      {/* =========================
          CURRENT WEATHER
      ========================= */}

      <div
        className="
          relative
          overflow-hidden
          bg-gradient-to-br
          from-blue-700
          via-blue-600
          to-sky-500
          text-white
          px-7
          pt-7
          pb-8
        "
      >

        {/* Decorative glow */}

        <div
          className="
            absolute
            -top-20
            -right-20
            w-48
            h-48
            rounded-full
            bg-white/10
            blur-3xl
          "
        />

        <div
          className="
            absolute
            -bottom-20
            -left-20
            w-40
            h-40
            rounded-full
            bg-red-400/20
            blur-3xl
          "
        />

        <div className="relative">

          {/* Header */}

          <div className="flex items-center justify-between">

            <div>

              <h2 className="text-2xl font-bold tracking-tight">
                Frisco Weather
              </h2>

              <p className="mt-1 text-sm text-blue-100 flex items-center gap-1">
                <span className="text-red-300">
                  ●
                </span>

                {location}
              </p>

            </div>

            {/* Live indicator */}

            <div
              className="
                flex
                items-center
                gap-1.5
                px-3
                py-1.5
                rounded-full
                bg-white/10
                border
                border-white/20
                text-xs
                text-blue-50
              "
            >
              <span className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse" />
              Live
            </div>

          </div>


          {/* Current Temperature */}

          <div className="flex items-center justify-center gap-5 mt-7">

            <img
              src={today.icon}
              alt={today.condition}
              className="w-24 h-24 drop-shadow-lg"
            />

            <div>

              <h1
                className="
                  text-5xl
                  sm:text-6xl
                  font-extrabold
                  tracking-tight
                "
              >
                {today.temp}°F
              </h1>

              <p className="text-lg font-medium text-blue-50 mt-1">
                {today.condition}
              </p>

              <p className="text-sm text-blue-100 mt-1">
                Feels like {today.feels}°
              </p>

              <p className="text-sm text-blue-100 mt-1">
                💧 Humidity {today.humidity}%
              </p>

            </div>

          </div>

        </div>

      </div>


      {/* =========================
          FORECAST
      ========================= */}

      <div className="px-6 py-6">

        <div className="flex items-center justify-between mb-4">

          <h3 className="text-lg font-bold text-gray-900">
            7-Day Forecast
          </h3>

          <span className="text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full">
            Frisco, TX
          </span>

        </div>


        <div>

          {forecast.map((day, index) => (

            <div
              key={index}
              className="
                flex
                items-center
                justify-between
                py-3.5
                border-b
                border-gray-100
                last:border-none
                hover:bg-gray-50
                rounded-xl
                px-2
                transition
              "
            >

              {/* Day */}

              <div className="w-16">

                <p className="font-semibold text-gray-900">
                  {day.day}
                </p>

                <p className="text-xs text-gray-400 mt-0.5">
                  {day.date}
                </p>

              </div>


              {/* Weather */}

              <div className="flex items-center gap-2 flex-1">

                <img
                  src={day.icon}
                  alt={day.condition}
                  className="w-11 h-11"
                />

                <div>

                  <p className="text-sm font-medium text-gray-800">
                    {day.condition}
                  </p>

                  <p className="text-xs text-blue-500 mt-0.5">
                    💧 {day.rain}% rain
                  </p>

                </div>

              </div>


              {/* Temperature */}

              <div className="text-right">

                <p className="font-bold text-gray-900">
                  {day.maxTemp}°
                </p>

                <p className="text-xs text-gray-400">
                  {day.minTemp}°
                </p>

              </div>

            </div>

          ))}

        </div>

      </div>


      {/* =========================
          FOOTER
      ========================= */}

      <div
        className="
          bg-gray-50
          border-t
          border-gray-100
          text-center
          py-3
          text-xs
          text-gray-400
        "
      >
        Last updated{" "}
        {new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </div>

    </div>
  );
}