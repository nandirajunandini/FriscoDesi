import { cookies } from "next/headers";
import Link from "next/link";
import {
  ArrowRight,
  Compass,
  Heart,
  MapPin,
  MessageSquare,
  Search,
  Sparkles,
} from "lucide-react";

import AnimatedSections from "./sections-client";
import DashboardClient from "./dashboard-client";

/* =============================
   Interfaces
============================= */

interface Section {
  id: number;
  name: string;
  slug: string;
}

interface Listing {
  id: number;
  name: string;
  slug: string;
  address: string;
}

/* =============================
   Fetch Sections
============================= */

async function getSections(): Promise<Section[]> {
  try {
    const res = await fetch(
      `${process.env.STRAPI_URL}/api/sections`,
      {
        cache: "no-store",
      }
    );

    if (!res.ok) {
      console.error(
        "Failed to fetch sections:",
        res.status
      );

      return [];
    }

    const data = await res.json();

    return data.data || [];
  } catch (error) {
    console.error(
      "Error fetching sections:",
      error
    );

    return [];
  }
}

/* =============================
   Fetch Featured Listings
============================= */

async function getFeatured(): Promise<Listing[]> {
  try {
    const res = await fetch(
      `${process.env.STRAPI_URL}/api/listings?filters[featured][$eq]=true`,
      {
        cache: "no-store",
      }
    );

    if (!res.ok) {
      console.error(
        "Failed to fetch featured listings:",
        res.status
      );

      return [];
    }

    const data = await res.json();

    return data.data || [];
  } catch (error) {
    console.error(
      "Error fetching featured listings:",
      error
    );

    return [];
  }
}

/* =============================
   Dashboard Page
============================= */

export default async function DashboardPage() {
  /* =============================
     Check Login
  ============================= */

  const cookieStore = await cookies();

 const token =
  cookieStore.get("token")?.value;

let user = null;

if (token) {
  try {
    const userRes = await fetch(
      `${process.env.STRAPI_URL}/api/users/me?populate=role`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      }
    );

    if (userRes.ok) {
      user = await userRes.json();
    }
  } catch (error) {
    console.error(
      "Failed to fetch logged-in user:",
      error
    );
  }
}

const isLoggedIn =
  Boolean(user);
  /* =============================
     Fetch Data
  ============================= */

  const [sections, featured] =
    await Promise.all([
      getSections(),
      getFeatured(),
    ]);

  /* =============================
     Dashboard
  ============================= */

  return (
    <DashboardClient
      sections={sections}
      featured={featured}
      isLoggedIn={isLoggedIn}
       user={user}
    >
      <main className="min-h-screen bg-gray-50">

        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">

          {/* ==================================================
              Welcome Section
          ================================================== */}

          <section className="relative mb-8 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">

            {/* Decorative background */}

            <div
              className="
                pointer-events-none
                absolute
                -right-20
                -top-20
                h-64
                w-64
                rounded-full
                bg-blue-50
                blur-3xl
              "
            />

            <div
              className="
                pointer-events-none
                absolute
                -bottom-24
                left-1/3
                h-48
                w-48
                rounded-full
                bg-red-50
                blur-3xl
              "
            />

            <div className="relative p-6 sm:p-8 lg:p-10">

              <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">

                {/* Welcome text */}

                <div className="max-w-2xl">

                  <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600">
                    <Sparkles size={14} />
                    Your FriscoDesi Dashboard
                  </div>

                  <h1 className="text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl lg:text-5xl">
                    Welcome to{" "}
                    <span className="text-blue-600">
                      Frisco
                    </span>
                    <span className="text-red-500">
                      Desi
                    </span>
                  </h1>

                  <p className="mt-4 max-w-xl text-base leading-7 text-gray-500 sm:text-lg">
                    Discover restaurants, services,
                    businesses and community resources
                    around Frisco.
                  </p>

                </div>

                {/* Main CTA */}

                <div className="shrink-0">

                  <Link
                    href="/"
                    className="
                      group
                      inline-flex
                      w-full
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      bg-blue-600
                      px-6
                      py-3.5
                      text-sm
                      font-semibold
                      text-white
                      shadow-sm
                      transition
                      hover:bg-blue-700
                      hover:shadow-md
                      sm:w-auto
                    "
                  >
                    <Search size={18} />

                    Explore FriscoDesi

                    <ArrowRight
                      size={17}
                      className="
                        transition-transform
                        group-hover:translate-x-1
                      "
                    />
                  </Link>

                </div>

              </div>

            </div>

          </section>


          {/* ==================================================
              Quick Actions
          ================================================== */}

          <section className="mb-10">

            <div className="mb-5">

              <h2 className="text-xl font-bold text-gray-950">
                Quick Actions
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Quickly access the things you use most.
              </p>

            </div>


            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

              {/* Explore */}

              <Link
                href="/"
                className="
                  group
                  rounded-2xl
                  border
                  border-gray-200
                  bg-white
                  p-5
                  shadow-sm
                  transition
                  duration-200
                  hover:-translate-y-0.5
                  hover:border-blue-200
                  hover:shadow-md
                "
              >

                <div className="flex items-start justify-between">

                  <div
                    className="
                      flex
                      h-11
                      w-11
                      items-center
                      justify-center
                      rounded-xl
                      bg-blue-50
                      text-blue-600
                    "
                  >
                    <Compass size={21} />
                  </div>

                  <ArrowRight
                    size={18}
                    className="
                      text-gray-300
                      transition
                      group-hover:translate-x-1
                      group-hover:text-blue-600
                    "
                  />

                </div>

                <h3 className="mt-4 font-semibold text-gray-900">
                  Explore
                </h3>

                <p className="mt-1 text-sm leading-6 text-gray-500">
                  Discover businesses, services and
                  places around you.
                </p>

              </Link>


              {/* Favorites */}

              <Link
                href="/dashboard/favorites"
                className="
                  group
                  rounded-2xl
                  border
                  border-gray-200
                  bg-white
                  p-5
                  shadow-sm
                  transition
                  duration-200
                  hover:-translate-y-0.5
                  hover:border-red-200
                  hover:shadow-md
                "
              >

                <div className="flex items-start justify-between">

                  <div
                    className="
                      flex
                      h-11
                      w-11
                      items-center
                      justify-center
                      rounded-xl
                      bg-red-50
                      text-red-500
                    "
                  >
                    <Heart size={21} />
                  </div>

                  <ArrowRight
                    size={18}
                    className="
                      text-gray-300
                      transition
                      group-hover:translate-x-1
                      group-hover:text-red-500
                    "
                  />

                </div>

                <h3 className="mt-4 font-semibold text-gray-900">
                  Favorites
                </h3>

                <p className="mt-1 text-sm leading-6 text-gray-500">
                  View the places and listings you've
                  saved.
                </p>

              </Link>


              {/* Messages */}

              <Link
                href="/dashboard/messages"
                className="
                  group
                  rounded-2xl
                  border
                  border-gray-200
                  bg-white
                  p-5
                  shadow-sm
                  transition
                  duration-200
                  hover:-translate-y-0.5
                  hover:border-purple-200
                  hover:shadow-md
                "
              >

                <div className="flex items-start justify-between">

                  <div
                    className="
                      flex
                      h-11
                      w-11
                      items-center
                      justify-center
                      rounded-xl
                      bg-purple-50
                      text-purple-600
                    "
                  >
                    <MessageSquare size={21} />
                  </div>

                  <ArrowRight
                    size={18}
                    className="
                      text-gray-300
                      transition
                      group-hover:translate-x-1
                      group-hover:text-purple-600
                    "
                  />

                </div>

                <h3 className="mt-4 font-semibold text-gray-900">
                  Messages
                </h3>

                <p className="mt-1 text-sm leading-6 text-gray-500">
                  Manage your conversations and
                  inquiries.
                </p>

              </Link>

            </div>

          </section>


          {/* ==================================================
              Featured Places
          ================================================== */}

          {featured.length > 0 && (

            <section className="mb-12">

              <div className="mb-5 flex items-end justify-between gap-4">

                <div>

                  <div className="flex items-center gap-2">

                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-500">
                      <Sparkles size={17} />
                    </div>

                    <h2 className="text-xl font-bold text-gray-950">
                      Featured Places
                    </h2>

                  </div>

                  <p className="mt-2 text-sm text-gray-500">
                    Popular places you may want to
                    explore.
                  </p>

                </div>

                <Link
                  href="/"
                  className="
                    hidden
                    shrink-0
                    items-center
                    gap-1
                    text-sm
                    font-semibold
                    text-blue-600
                    transition
                    hover:text-blue-700
                    sm:inline-flex
                  "
                >
                  View all
                  <ArrowRight size={15} />
                </Link>

              </div>


              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

                {featured.map((item) => (

                  <Link
                    key={item.id}
                    href={`/listing/${item.slug}`}
                    className="
                      group
                      overflow-hidden
                      rounded-2xl
                      border
                      border-gray-200
                      bg-white
                      shadow-sm
                      transition
                      duration-300
                      hover:-translate-y-1
                      hover:border-blue-200
                      hover:shadow-lg
                    "
                  >

                    {/* Card top */}

                    <div className="relative h-32 bg-linear-to-br from-blue-50 via-white to-red-50">

                      <div
                        className="
                          absolute
                          left-5
                          top-5
                          flex
                          h-11
                          w-11
                          items-center
                          justify-center
                          rounded-xl
                          bg-white
                          text-amber-500
                          shadow-sm
                        "
                      >
                        <Sparkles size={20} />
                      </div>

                    </div>


                    {/* Card content */}

                    <div className="p-5">

                      <h3
                        className="
                          line-clamp-1
                          text-lg
                          font-semibold
                          text-gray-900
                          transition
                          group-hover:text-blue-600
                        "
                      >
                        {item.name}
                      </h3>


                      <div className="mt-3 flex items-start gap-2">

                        <MapPin
                          size={16}
                          className="
                            mt-0.5
                            shrink-0
                            text-gray-400
                          "
                        />

                        <p className="line-clamp-2 text-sm leading-5 text-gray-500">
                          {item.address}
                        </p>

                      </div>


                      <div
                        className="
                          mt-5
                          flex
                          items-center
                          gap-1.5
                          text-sm
                          font-semibold
                          text-blue-600
                        "
                      >
                        View details

                        <ArrowRight
                          size={15}
                          className="
                            transition-transform
                            group-hover:translate-x-1
                          "
                        />
                      </div>

                    </div>

                  </Link>

                ))}

              </div>


              {/* Mobile view all */}

              <div className="mt-5 sm:hidden">

                <Link
                  href="/"
                  className="
                    inline-flex
                    items-center
                    gap-1
                    text-sm
                    font-semibold
                    text-blue-600
                  "
                >
                  View all
                  <ArrowRight size={15} />
                </Link>

              </div>

            </section>

          )}


          {/* ==================================================
              Explore Sections
          ================================================== */}

          <section>

            <div className="mb-5">

              <div className="flex items-center gap-2">

                <div
                  className="
                    flex
                    h-8
                    w-8
                    items-center
                    justify-center
                    rounded-lg
                    bg-blue-50
                    text-blue-600
                  "
                >
                  <Compass size={17} />
                </div>

                <h2 className="text-xl font-bold text-gray-950">
                  Explore by Category
                </h2>

              </div>

              <p className="mt-2 text-sm text-gray-500">
                Browse businesses and services by
                category.
              </p>

            </div>


            {sections.length > 0 ? (

              <AnimatedSections
                sections={sections}
              />

            ) : (

              <div
                className="
                  rounded-2xl
                  border
                  border-dashed
                  border-gray-300
                  bg-white
                  px-6
                  py-12
                  text-center
                "
              >

                <div
                  className="
                    mx-auto
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-full
                    bg-gray-100
                    text-gray-400
                  "
                >
                  <Compass size={22} />
                </div>

                <h3 className="mt-4 font-semibold text-gray-900">
                  No categories available
                </h3>

                <p className="mx-auto mt-1 max-w-md text-sm text-gray-500">
                  There are currently no sections
                  available to explore.
                </p>

              </div>

            )}

          </section>

        </div>

      </main>
    </DashboardClient>
  );
}