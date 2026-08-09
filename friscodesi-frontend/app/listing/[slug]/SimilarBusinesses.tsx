import Link from "next/link";
import type { Listing, SimilarBusiness } from "./page";

interface Props {
  listing: Listing;
  businesses: SimilarBusiness[];
  topRated: SimilarBusiness[];
}

export default function SimilarBusinesses({
  listing,
  businesses,
  topRated,
}: Props) {
  return (
    <section className="px-6 py-12 pb-20">
      <div className="max-w-6xl mx-auto">

        <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-10">

          {/* Header */}

          <div className="flex items-center justify-between mb-10">

            <div>

              <h2 className="text-3xl font-bold">
                You May Also Like
              </h2>

              <p className="text-gray-500 mt-2">
                More businesses from {listing.category.name}
              </p>

            </div>

            <Link
              href={`/category/${listing.category.slug}`}
              className="bg-red-600 text-white px-6 py-3 rounded-xl"
            >
              View All
            </Link>

          </div>

          {/* Similar Businesses */}

          <h3 className="text-xl font-semibold mb-4">
            Similar Businesses
          </h3>

          {businesses.length > 0 ? (

            <div className="grid md:grid-cols-3 gap-6 mb-10">

              {businesses.map((business) => (

                <Link
                  key={business.id}
                  href={`/listing/${business.slug}`}
                  className="border rounded-xl overflow-hidden hover:shadow-xl transition"
                >

                  <img
                    src={
                      business.image ||
                      "https://placehold.co/600x400?text=No+Image"
                    }
                    alt={business.name}
                    className="w-full h-44 object-cover"
                  />

                  <div className="p-4">

                    <h4 className="font-bold text-lg">
                      {business.name}
                    </h4>

                    <p className="text-sm text-gray-500 mt-2">
                      ⭐ {business.rating}
                    </p>

                  </div>

                </Link>

              ))}

            </div>

          ) : (

            <p className="text-gray-500 mb-10">
              No similar businesses found.
            </p>

          )}

          {/* Top Rated */}

          <h3 className="text-xl font-semibold mb-4">
            Top Rated Businesses
          </h3>

          {topRated.length > 0 ? (

            <div className="grid md:grid-cols-3 gap-6">

              {topRated.map((business) => (

                <Link
                  key={business.id}
                  href={`/listing/${business.slug}`}
                  className="border rounded-xl overflow-hidden hover:shadow-xl transition"
                >

                  <img
                    src={
                      business.image ||
                      "https://placehold.co/600x400?text=No+Image"
                    }
                    alt={business.name}
                    className="w-full h-44 object-cover"
                  />

                  <div className="p-4">

                    <h4 className="font-bold text-lg">
                      {business.name}
                    </h4>

                    <p className="text-sm text-gray-500 mt-2">
                      ⭐ {business.rating}
                    </p>

                  </div>

                </Link>

              ))}

            </div>

          ) : (

            <p className="text-gray-500">
              No top-rated businesses found.
            </p>

          )}

          {/* Share Buttons */}

          <div className="mt-12 flex flex-wrap justify-center gap-4">

            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                `https://your-domain.com/listing/${listing.slug}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 text-white px-6 py-3 rounded-xl"
            >
              Facebook
            </a>

            <a
              href={`https://wa.me/?text=${encodeURIComponent(
                `Check out ${listing.name}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-600 text-white px-6 py-3 rounded-xl"
            >
              WhatsApp
            </a>

            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                listing.address
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-yellow-400 text-black px-6 py-3 rounded-xl"
            >
              Open in Maps
            </a>

          </div>

          {/* Back */}

          <div className="text-center mt-10">

            <Link
              href={`/category/${listing.category.slug}`}
              className="inline-flex items-center bg-indigo-600 text-white px-8 py-3 rounded-full"
            >
              ← Back to {listing.category.name}
            </Link>

          </div>

        </div>

      </div>
    </section>
  );
}