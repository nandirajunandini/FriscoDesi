import Link from "next/link";
import WeatherWidget from "@/components/WeatherWidget";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-100 flex flex-col">

      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-700 via-blue-600 to-sky-500 text-white min-h-screen flex items-start pt-4">

        {/* Background Blur */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-400 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-400 rounded-full blur-3xl opacity-20"></div>

        <div className="relative max-w-7xl mx-auto w-full px-6 py-6 grid lg:grid-cols-2 gap-16 items-start">

          {/* Left Side */}
          <div className="flex flex-col justify-start pt-8 text-center lg:text-left">

            <h1 className="text-5xl lg:text-6xl font-extrabold leading-tight">
              Discover
              <br />
              <span className="text-yellow-300">
                FriscoDesi
              </span>
            </h1>

            <p className="mt-6 text-xl text-blue-100 max-w-xl mx-auto lg:mx-0 leading-8">
              Your complete community hub for residents,
              families, students, and visitors in
              Frisco, Texas.
            </p>

            <div className="mt-10 flex flex-wrap justify-center lg:justify-start gap-4">

              <Link
                href="/register"
                className="bg-white text-indigo-700 px-8 py-4 rounded-full font-semibold shadow-lg hover:scale-105 transition"
              >
                Get Started
              </Link>

              <Link
                href="/login"
                className="border border-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-indigo-700 transition"
              >
                Login
              </Link>

            </div>

          </div>

          {/* Right Side */}
          <div className="flex justify-center lg:justify-end pt-4">
            <WeatherWidget />
          </div>

        </div>

      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-gray-900 text-gray-400 text-center py-8 text-sm">
        © {new Date().getFullYear()} FriscoDesi. Built for the community ❤️
      </footer>

    </main>
  );
}