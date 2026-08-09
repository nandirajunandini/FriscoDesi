import { notFound } from "next/navigation";
import Link from "next/link";
import AnimatedListingGrid from "./animated-listings";

/* ============================= */
/* Type Definitions              */
/* ============================= */

interface Listing {
  id: number;
  name: string;
  slug: string;
  address: string;
  rating: number;
}

interface Section {
  id: number;
  name: string;
  slug: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  section: Section;
  listings: Listing[];
}

/* ============================= */
/* Fetch Category From Strapi    */
/* ============================= */

async function getCategory(slug: string): Promise<Category | null> {
  const res = await fetch(
    `http://localhost:1337/api/categories?filters[slug][$eq]=${slug}&populate=section&populate=listings`,
    { cache: "no-store" }
  );

  if (!res.ok) return null;

  const data = await res.json();

  if (!data.data || data.data.length === 0) return null;

  const category = data.data[0];

  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    section: category.section,
    listings: category.listings || [],
  };
}

/* ============================= */
/* Page Component                */
/* ============================= */

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const category = await getCategory(slug);

  if (!category) return notFound();

  const listingCount = category.listings.length;

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white px-6 py-14">

      <div className="max-w-6xl mx-auto">

        {/* Breadcrumb */}
        <div className="flex flex-wrap items-center text-sm text-gray-500 mb-8">

          <Link
            href="/"
            className="hover:text-indigo-600 transition"
          >
            Home
          </Link>

          <span className="mx-2">/</span>

          <Link
            href={`/section/${category.section.slug}`}
            className="hover:text-indigo-600 transition"
          >
            {category.section.name}
          </Link>

          <span className="mx-2">/</span>

          <span className="text-gray-800 font-medium">
            {category.name}
          </span>

        </div>


        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12">

          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              {category.name}
            </h1>

            <p className="text-gray-500 mt-3 text-lg">
              Discover trusted listings in {category.name}
            </p>
          </div>


          <div className="mt-6 md:mt-0">

            <div className="bg-indigo-100 text-indigo-700 px-5 py-2 rounded-full font-medium text-sm shadow-sm">
              {listingCount}{" "}
              {listingCount === 1 ? "Listing" : "Listings"}
            </div>

          </div>

        </div>


        {/* Listings */}
        <AnimatedListingGrid
          listings={category.listings}
          categorySlug={category.slug}
        />


        {/* Back */}
        <div className="mt-16">

          <Link
            href={`/section/${category.section.slug}`}
            className="inline-flex items-center text-indigo-600 font-medium hover:underline"
          >
            ← Back to {category.section.name}
          </Link>

        </div>

      </div>

    </main>
  );
}