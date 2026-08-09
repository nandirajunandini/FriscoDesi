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
  image?: {
    url: string;
  };
  featured: boolean;
}

/* ============================= */
/* Fetch Events                  */
/* ============================= */

async function getEvents(): Promise<Event[]> {
  const res = await fetch(
    "http://localhost:1337/api/events?populate=image&sort=date:asc",
    { cache: "no-store" }
  );

  if (!res.ok) return [];

  const data = await res.json();

  return data.data.map((event: any) => ({
    id: event.id,
    name: event.name,
    slug: event.slug,
    date: event.date,
    location: event.location,
    address: event.address,
    image: event.image,
    featured: event.featured,
  }));
}

/* ============================= */
/* Page Component                */
/* ============================= */

export default async function EventsPage() {
  const events = await getEvents();

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-16">
      <div className="max-w-6xl mx-auto">

        {/* Title */}
        <h1 className="text-4xl font-bold text-gray-900 mb-12">
          Community Events
        </h1>

        {events.length === 0 && (
          <p className="text-gray-500">No events found.</p>
        )}

        {/* Grid */}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Link key={event.id} href={`/events/${event.slug}`} className="group">

              <div className="bg-white rounded-3xl shadow-sm hover:shadow-xl transition duration-300 overflow-hidden border border-gray-100">

                {/* Image */}
                {event.image?.url && (
                  <img
                    src={`http://localhost:1337${event.image.url}`}
                    alt={event.name}
                    className="h-56 w-full object-cover group-hover:scale-105 transition duration-300"
                  />
                )}

                <div className="p-6">

                  {/* Featured Badge */}
                  {event.featured && (
                    <span className="inline-block bg-yellow-100 text-yellow-700 text-xs font-semibold px-3 py-1 rounded-full mb-3">
                      ⭐ Featured
                    </span>
                  )}

                  {/* Title */}
                  <h2 className="text-xl font-semibold text-gray-900 group-hover:text-indigo-600 transition">
                    {event.name}
                  </h2>

                  {/* Date */}
                  <p className="text-gray-500 mt-2 text-sm">
                    📅 {new Date(event.date).toLocaleDateString()}
                  </p>

                  {/* Location */}
                  <p className="text-gray-600 mt-1 text-sm">
                    📍 {event.location}
                  </p>

                </div>
              </div>

            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}