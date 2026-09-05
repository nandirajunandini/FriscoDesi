import Link from "next/link";
import { notFound } from "next/navigation";
import AnimatedCategoryGrid from "./category-grid";

/* ============================= */
/* Interfaces                    */
/* ============================= */

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Section {
  id: number;
  name: string;
  slug: string;
  categories: Category[];
}

/* ============================= */
/* Fetch Section                 */
/* ============================= */

async function getSection(slug: string): Promise<Section | null> {
  const res = await fetch(
    `${process.env.STRAPI_URL}/api/sections?filters[slug][$eq]=${slug}&populate=categories`,
    {
      cache: "no-store",
    }
  );

  if (!res.ok) return null;

  const data = await res.json();
  return data.data?.[0] || null;
}

/* ============================= */
/* Hero Colors                   */
/* ============================= */

const heroColors: Record<string, string> = {
  residents: "from-red-600 via-red-500 to-orange-400",
  services: "from-red-600 via-red-500 to-orange-400",
  sports: "from-red-600 via-red-500 to-orange-400",
  culture: "from-red-600 via-red-500 to-orange-400",
  "students-education": "from-red-600 via-red-500 to-orange-400",
  "community-impact": "from-red-600 via-red-500 to-orange-400",
};

/* ============================= */
/* Page Component                */
/* ============================= */

export default async function SectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const section = await getSection(slug);

  if (!section) return notFound();

  const categories = section.categories || [];

  const heroGradient =
    heroColors[section.slug] ||
    "from-red-600 via-red-500 to-orange-400";

  return (
    <main className="min-h-screen bg-linear-to-b from-gray-50 to-white">

      {/* ================= HERO ================= */}

      <section
        className={`bg-linear-to-r ${heroGradient} text-white py-20 shadow-lg`}
      >
        <div className="max-w-6xl mx-auto px-6">

          <div className="text-sm mb-5 text-white/80">
            <Link href="/" className="hover:underline">
              Home
            </Link>
            <span className="mx-2">/</span>
            {section.name}
          </div>

          <h1 className="text-5xl font-extrabold mb-5">
            {section.name}
          </h1>

          <p className="max-w-3xl text-lg text-white/90 leading-8">
            Explore categories inside <strong>{section.name}</strong> and
            discover trusted businesses, services, organizations and community
            resources.
          </p>

        </div>
      </section>

      {/* ================= CATEGORY GRID ================= */}

      <section className="max-w-7xl mx-auto px-6 py-16">

        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          Browse Categories
        </h2>

        <p className="text-gray-600 mb-12">
          Choose a category below to explore businesses and services.
        </p>

        {categories.length === 0 ? (
          <div className="text-center py-20 text-gray-500 text-lg">
            No categories found.
          </div>
        ) : (
          <AnimatedCategoryGrid categories={categories} />
        )}

        <div className="mt-16">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-red-600 font-semibold hover:text-red-700 transition"
          >
            ← Back to Dashboard
          </Link>
        </div>

      </section>
    </main>
  );
}