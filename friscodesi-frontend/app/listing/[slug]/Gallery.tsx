import type { Listing } from "./page";

interface Props {
  listing: Listing;
}

export default function Gallery({ listing }: Props) {

  // Photos are already prepared inside page.tsx
  // Google Places photos are stored here
  const photos = listing.photos ?? [];


  return (
    <section className="px-6 py-12">

      <div className="max-w-6xl mx-auto">

        <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-10">


          <div className="flex items-center justify-between mb-8">

            <h2 className="text-3xl font-bold text-gray-900">
              Photo Gallery
            </h2>


            {photos.length > 0 && (

              <span className="bg-yellow-100 text-red-600 px-4 py-2 rounded-full text-sm font-semibold">

                {photos.length} Photos

              </span>

            )}

          </div>



          {photos.length > 0 ? (

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">


              {photos.map((photo, index) => (

                <div
                  key={index}
                  className="group overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition duration-300"
                >

                  <img

                    src={photo}

                    alt={`${listing.name} Photo ${index + 1}`}

                    loading="lazy"

                    referrerPolicy="no-referrer"

                    className="w-full h-64 object-cover transition duration-500 group-hover:scale-110"

                  />

                </div>

              ))}


            </div>


          ) : (

            <div className="rounded-2xl border-2 border-dashed border-gray-300 py-20 text-center">


              <div className="text-6xl mb-4">
                📷
              </div>


              <h3 className="text-2xl font-semibold text-gray-700">
                No Photos Available
              </h3>


              <p className="mt-3 text-gray-500">
                No photos are available for this business.
              </p>


            </div>

          )}


        </div>


      </div>


    </section>
  );
}