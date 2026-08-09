import type { Listing } from "./page";

interface Props {
  listing: Listing;
}

export default function Reviews({ listing }: Props) {
  const reviews = listing.googleData?.reviews ?? [];

  return (
    <section className="px-6 py-12">
      <div className="max-w-6xl mx-auto">

        <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-10">

          {/* Header */}

          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10">

            <div>

              <h2 className="text-3xl font-bold text-gray-900">
                Customer Reviews
              </h2>

              <p className="text-gray-500 mt-2">
                Reviews from Google Places
              </p>

            </div>

            <div className="mt-6 md:mt-0">

              <div className="bg-yellow-100 text-yellow-700 px-6 py-4 rounded-2xl text-center">

                <div className="text-4xl font-bold">
                  {listing.rating}
                </div>

                <div className="mt-2 text-sm">
                  ⭐ Overall Rating
                </div>

              </div>

            </div>

          </div>

          <div className="grid md:grid-cols-2 gap-10">

            {/* Rating Summary */}

            <div>

              <h3 className="text-xl font-semibold mb-6">
                Rating Summary
              </h3>

              {[5,4,3,2,1].map((star)=>(
                <div
                  key={star}
                  className="flex items-center gap-4 mb-4"
                >
                  <span className="w-12">
                    {star} ★
                  </span>

                  <div className="flex-1 h-3 rounded-full bg-gray-200 overflow-hidden">
                    <div
                      className={`h-full ${
                        star===5
                          ? "w-4/5"
                          : star===4
                          ? "w-3/5"
                          : star===3
                          ? "w-2/5"
                          : star===2
                          ? "w-1/5"
                          : "w-1/12"
                      } bg-yellow-400`}
                    />
                  </div>

                </div>
              ))}

            </div>

            {/* Google Reviews */}

            <div>

              <h3 className="text-xl font-semibold mb-6">
                Latest Reviews
              </h3>

              {reviews.length > 0 ? (

                <div className="space-y-6">

                  {reviews.slice(0,5).map((review:any,index:number)=>(
                    <div
                      key={index}
                      className="border rounded-2xl p-6 hover:shadow-md transition"
                    >

                      <div className="flex justify-between items-center mb-3">

                        <div className="font-semibold">
                          {review.authorAttribution?.displayName ??
                            "Google User"}
                        </div>

                        <div className="text-yellow-500">
                          {"⭐".repeat(review.rating ?? 5)}
                        </div>

                      </div>

                      <p className="text-gray-600 leading-7">
                        {review.text?.text ??
                          "No review text available."}
                      </p>

                    </div>
                  ))}

                </div>

              ) : (

                <div className="border rounded-2xl p-8 text-center text-gray-500">

                  No Google reviews available.

                </div>

              )}

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}