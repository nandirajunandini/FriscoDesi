import Link from "next/link";
import AnimatedSections from "./sections-client";

/* ============================= /
/ Interfaces                    /
/ ============================= */

interface Section {
id: number;
name: string;
slug: string;
}

interface Listing {
id: number;
name: string;
slug: string;
address: string;
}

/* ============================= /
/ Fetch Data                    /
/ ============================= */

async function getSections(): Promise<Section[]> {
const res = await fetch("http://localhost:1337/api/sections", {
cache: "no-store",
});

if (!res.ok) return [];

const data = await res.json();
return data.data || [];
}

async function getFeatured(): Promise<Listing[]> {
const res = await fetch(
"http://localhost:1337/api/listings?filters[featured][$eq]=true",
{ cache: "no-store" }
);

if (!res.ok) return [];

const data = await res.json();
return data.data || [];
}

/* ============================= /
/ Dashboard Page                /
/ ============================= */

export default async function DashboardPage() {

const sections = await getSections();
const featured = await getFeatured();

return (

<main className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-blue-50 px-6 py-16">

  <div className="max-w-7xl mx-auto">

    {/* ================= HEADER ================= */}

    <div className="mb-14">
      <h1 className="text-4xl font-bold mb-3">
        Welcome to FriscoDesi 🚀
      </h1>

      <p className="text-gray-500">
        Discover services, places and community resources around you.
      </p>
    </div>

    {/* ================= FEATURED ================= */}

    {featured.length > 0 && (
      <>
        <h2 className="text-2xl font-semibold mb-8">
          ⭐ Featured Places
        </h2>

        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 mb-16">

          {featured.map((item) => (

            <Link
              key={item.id}
              href={`/listing/${item.slug}`}
              className="group bg-white p-6 rounded-2xl border border-gray-100 shadow-md hover:shadow-2xl transition duration-300 hover:-translate-y-2 hover:border-indigo-200"
            >

              <h3 className="font-semibold text-lg group-hover:text-indigo-600 transition">
                {item.name}
              </h3>

              <p className="text-gray-500 text-sm mt-2">
                📍 {item.address}
              </p>

            </Link>

          ))}

        </div>
      </>
    )}

    {/* ================= SECTIONS ================= */}

    <h2 className="text-2xl font-semibold mb-8">
      Explore Sections
    </h2>

    {/* Animated Client Component */}
    <AnimatedSections sections={sections} />

  </div>

</main>

);
}