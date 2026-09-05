import Link from "next/link";

interface Listing {
  id: number;
  name: string;
  slug: string;
  address: string;
}

async function searchListings(query: string): Promise<Listing[]> {
  if (!query) return [];

  const res = await fetch(
    `${process.env.STRAPI_URL}/api/listings?filters[name][$containsi]=${encodeURIComponent(query)}`,
    { cache: "no-store" }
  );

  if (!res.ok) return [];

  const data = await res.json();
  return data.data || [];
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams?: { q?: string };
}) {
  const query = searchParams?.q?.trim() ?? "";
  const results = await searchListings(query);

  return (
    <main className="min-h-screen bg-linear-to-b from-gray-50 to-white px-6 py-20">
      <div className="max-w-6xl mx-auto">

        {/* No Query State */}
        {!query && (
          <div className="text-center mt-24">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              🔍 Start Searching
            </h1>
            <p className="text-gray-500 text-lg">
              Use the search bar above to find businesses and services.
            </p>
          </div>
        )}

        {/* With Query */}
        {query && (
          <>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-12">
              Results for "<span className="text-indigo-600">{query}</span>"
            </h1>

            {results.length === 0 ? (
              <div className="bg-white p-10 rounded-3xl shadow-sm text-center border">
                <p className="text-gray-500 text-lg">
                  No results found. Try a different keyword.
                </p>
              </div>
            ) : (
              <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3">
                {results.map((item) => (
                  <Link
                    key={item.id}
                    href={`/listing/${item.slug}`}
                    className="group bg-white rounded-3xl p-8 border border-gray-200 
                               shadow-sm hover:shadow-2xl 
                               hover:-translate-y-2 transition duration-300"
                  >
                    <h2 className="text-xl font-semibold text-gray-800 mb-3 group-hover:text-indigo-600 transition">
                      {item.name}
                    </h2>

                    <p className="text-gray-500 text-sm">
                      📍 {item.address}
                    </p>

                    <span className="inline-block mt-4 text-indigo-600 text-sm font-medium group-hover:underline">
                      View Details →
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}