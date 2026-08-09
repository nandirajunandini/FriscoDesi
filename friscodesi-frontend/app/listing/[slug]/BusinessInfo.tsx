import type { Listing } from "./page";

interface Props {
  listing: Listing;
}

export default function BusinessInfo({ listing }: Props) {
  return (
    <section className="px-6 py-12">
      <div className="max-w-6xl mx-auto">

        <div className="grid lg:grid-cols-2 gap-8">

          {/* ================= About ================= */}

          <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-10">

            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              About
            </h2>

            {listing.description ? (
              <div className="space-y-6 text-gray-700 leading-8 text-lg">

                {listing.description.map(
                  (block: any, index: number) => (
                    <p key={index}>
                      {block.children
                        ?.map((child: any) => child.text)
                        .join("")}
                    </p>
                  )
                )}

              </div>
            ) : (
              <p className="text-gray-500">
                No description available.
              </p>
            )}

          </div>

          {/* ================= Business Information ================= */}

          <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-10">

            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Business Information
            </h2>

            <div className="space-y-6">

              <div className="flex items-start gap-4">
                <span className="text-2xl">📍</span>

                <div>
                  <h3 className="font-semibold">
                    Address
                  </h3>

                  <p className="text-gray-600">
                    {listing.address}
                  </p>
                </div>
              </div>

              {listing.phone && (
                <div className="flex items-start gap-4">

                  <span className="text-2xl">📞</span>

                  <div>

                    <h3 className="font-semibold">
                      Phone
                    </h3>

                    <a
                      href={`tel:${listing.phone}`}
                      className="text-blue-600 hover:underline"
                    >
                      {listing.phone}
                    </a>

                  </div>

                </div>
              )}

              {listing.website && (
                <div className="flex items-start gap-4">

                  <span className="text-2xl">🌐</span>

                  <div>

                    <h3 className="font-semibold">
                      Website
                    </h3>

                    <a
                      href={listing.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline break-all"
                    >
                      {listing.website}
                    </a>

                  </div>

                </div>
              )}

              <div className="flex items-start gap-4">

                <span className="text-2xl">⭐</span>

                <div>

                  <h3 className="font-semibold">
                    Rating
                  </h3>

                  <p className="text-gray-600">
                    {listing.rating} / 5
                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>

        {/* ================= Opening Hours ================= */}

        <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-10 mt-8">

          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Opening Hours
          </h2>

          {listing.openingHours &&
          listing.openingHours.length > 0 ? (

            <div className="space-y-4">

              {listing.openingHours.map((day, index) => (

                <div
                  key={index}
                  className="flex justify-between border-b pb-3"
                >
                  <span className="text-gray-700">
                    {day}
                  </span>
                </div>

              ))}

            </div>

          ) : (

            <p className="text-gray-500">
              Opening hours are currently unavailable.
            </p>

          )}

        </div>

      </div>
    </section>
  );
}