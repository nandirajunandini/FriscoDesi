import type { Listing } from "./page";

interface Props {
  listing: Listing;
}

export default function GoogleMap({ listing }: Props) {
  const encodedAddress = encodeURIComponent(listing.address);

  const mapUrl =
    listing.latitude && listing.longitude
      ? `https://www.google.com/maps?q=${listing.latitude},${listing.longitude}&output=embed`
      : `https://www.google.com/maps?q=${encodedAddress}&output=embed`;

  const directionsUrl =
    listing.latitude && listing.longitude
      ? `https://www.google.com/maps/search/?api=1&query=${listing.latitude},${listing.longitude}`
      : `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;

  return (
    <section className="px-6 py-12">
      <div className="max-w-6xl mx-auto">

        <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-10">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">

            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                Location
              </h2>

              <p className="text-gray-500 mt-2">
                Find this business on Google Maps.
              </p>
            </div>

            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 md:mt-0 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold transition"
            >
              📍 Get Directions
            </a>

          </div>

          <div className="overflow-hidden rounded-2xl border">

            <iframe
              src={mapUrl}
              width="100%"
              height="450"
              loading="lazy"
              className="border-0"
            />

          </div>

          <div className="mt-8 grid md:grid-cols-2 gap-6">

            <div className="bg-gray-50 rounded-2xl p-6">

              <h3 className="font-semibold text-lg mb-3">
                Business Address
              </h3>

              <p className="text-gray-600 leading-7">
                {listing.address}
              </p>

            </div>

            <div className="bg-gray-50 rounded-2xl p-6">

              <h3 className="font-semibold text-lg mb-3">
                Navigation
              </h3>

              <p className="text-gray-600 mb-5">
                Open this location directly in Google Maps.
              </p>

              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center bg-yellow-400 hover:bg-yellow-500 text-black px-5 py-3 rounded-xl font-semibold transition"
              >
                🗺️ Open Google Maps
              </a>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}