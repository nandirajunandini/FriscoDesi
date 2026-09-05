import { notFound } from "next/navigation";
import Link from "next/link";

/* ============================= */
/* Interfaces                    */
/* ============================= */

interface Event {
  id: number;
  name: string;
  slug: string;
  date: string;
  location: string;
  address: string;
  featured: boolean;
  description: any;
  image?: {
    url: string;
  };
}

/* ============================= */
/* Fetch Event                   */
/* ============================= */

async function getEvent(slug: string): Promise<Event | null> {
  const res = await fetch(
    `${process.env.STRAPI_URL}/api/events?filters[slug][$eq]=${slug}&populate=*`,
    { cache: "no-store" }
  );

  if (!res.ok) return null;

  const data = await res.json();
  return data.data[0] || null;
}

/* ============================= */
/* Page Component                */
/* ============================= */

export default async function EventDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await getEvent(slug);

  if (!event) return notFound();

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-16">
      <div className="max-w-4xl mx-auto">

        {/* Back */}
        <Link
          href="/events"
          className="text-indigo-600 hover:underline text-sm"
        >
          ← Back to Events
        </Link>

        {/* Card */}
        <div className="mt-6 bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-100">

          {/* Image (No Crop) */}
          {event.image?.url && (
            <div className="bg-gray-100 flex justify-center">
              <img
                src={`${process.env.STRAPI_URL}${event.image.url}`}
                alt={event.name}
                className="w-full max-h-125 object-contain"
              />
            </div>
          )}

          {/* Content */}
          <div className="p-8">

            {event.featured && (
              <span className="inline-block bg-yellow-100 text-yellow-700 text-xs font-semibold px-3 py-1 rounded-full mb-4">
                ⭐ Featured Event
              </span>
            )}

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {event.name}
            </h1>

            <div className="space-y-2 text-gray-600 mb-6">
              <p>📅 {new Date(event.date).toLocaleDateString()}</p>
              <p>📍 {event.location}</p>
              <p className="text-sm text-gray-500">{event.address}</p>
            </div>

            {/* Description */}
            {event.description && (
              <div className="mt-6">
                <h2 className="text-xl font-semibold mb-4">
                  About This Event
                </h2>

                <div className="space-y-4 text-gray-700 leading-relaxed">
                  {event.description.map((block: any, index: number) => (
                    <p key={index}>
                      {block.children?.map((child: any) => child.text).join("")}
                    </p>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </main>
  );
}