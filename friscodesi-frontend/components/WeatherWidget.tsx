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
          `${data.location.name}, ${data.location.region || data.location.country}`
        );

        setToday({
          temp: Math.round(data.current.temp_f),
          feels: Math.round(data.current.feelslike_f),
          humidity: data.current.humidity,
          condition: data.current.condition.text,
          icon: "https:" + data.current.condition.icon,
        });

        const weather = data.forecast.forecastday.map((item: any) => ({
          day: new Date(item.date).toLocaleDateString("en-US", {
            weekday: "short",
          }),
          date: new Date(item.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          icon: "https:" + item.day.condition.icon,
          condition: item.day.condition.text,
          rain: item.day.daily_chance_of_rain,
          maxTemp: Math.round(item.day.maxtemp_f),
          minTemp: Math.round(item.day.mintemp_f),
        }));

        setForecast(weather);
      } catch (err) {
        console.error(err);
      }
    }

    fetchWeather();
  }, []);

  if (!today) {
    return (
      <div className="bg-white rounded-3xl shadow-xl p-6 w-[480px]">
        Loading weather...
      </div>
    );
  }

  return (
    <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200 w-[480px] overflow-hidden">

      {/* Header */}

      <div className="bg-gradient-to-r from-blue-600 to-sky-500 text-white p-6">

        <h2 className="text-3xl font-bold text-center">
          Frisco Weather
        </h2>

        <p className="text-center mt-2">
          📍 {location}
        </p>

        <div className="flex items-center justify-center gap-4 mt-5">

          <img
            src={today.icon}
            alt="weather"
            className="w-20 h-20"
          />

          <div>

            <h1 className="text-5xl font-bold">
              {today.temp}°F
            </h1>

            <p className="text-lg">
              {today.condition}
            </p>

            <p className="text-sm">
              Feels like {today.feels}°
            </p>

            <p className="text-sm">
              💧 Humidity {today.humidity}%
            </p>

          </div>

        </div>

      </div>

      {/* Forecast */}

      <div className="p-5">

        <h3 className="text-xl font-semibold text-blue-600 text-center mb-5">
          7-Day Forecast
        </h3>
        {forecast.map((day, index) => (

          <div
            key={index}
            className="flex items-center justify-between py-4 border-b border-gray-200 last:border-none"
          >

            {/* Day & Date */}
            <div className="w-20">
              <p className="font-bold text-gray-800">
                {day.day}
              </p>

              <p className="text-sm text-gray-500">
                {day.date}
              </p>
            </div>

            {/* Weather */}
            <div className="flex items-center gap-3 flex-1">

              <img
                src={day.icon}
                alt={day.condition}
                className="w-12 h-12"
              />

              <div>

                <p className="font-medium text-gray-800">
                  {day.condition}
                </p>

                <p className="text-sm text-blue-500">
                  💧 Rain {day.rain}%
                </p>

              </div>

            </div>

            {/* Temperature */}
            <div className="text-right">

              <p className="font-bold text-gray-900">
                H: {day.maxTemp}°
              </p>

              <p className="text-sm text-gray-500">
                L: {day.minTemp}°
              </p>

            </div>

          </div>

        ))}

      </div>

      {/* Footer */}

      <div className="bg-gray-50 text-center py-3 text-xs text-gray-500 border-t">
  Last Updated: {new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}
</div>

    </div>
  );
}