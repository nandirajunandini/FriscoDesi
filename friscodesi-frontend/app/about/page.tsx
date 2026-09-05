"use client";

import { useRouter } from "next/navigation";

import Link from "next/link";

const discoveryItems = [
  {
    number: "01",
    title: "Local Businesses",
    description:
      "Discover trusted businesses and services that are part of the Frisco community.",
    icon: (
      <svg
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 21h18M5 21V9h14v12M8 9V5h8v4M8 13h2M14 13h2M8 17h2M14 17h2"
        />
      </svg>
    ),
  },
  {
    number: "02",
    title: "Food & Stores",
    description:
      "Find restaurants, grocery stores, shops and everyday essentials close to home.",
    icon: (
      <svg
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 3v7a3 3 0 006 0V3M7 3v7M10 3v7M7 13v8M17 3v18M17 3a4 4 0 014 4v3h-4"
        />
      </svg>
    ),
  },
  {
    number: "03",
    title: "Community",
    description:
      "Explore organizations, activities, events and resources that bring people together.",
    icon: (
      <svg
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        viewBox="0 0 24 24"
      >
        <circle cx="9" cy="8" r="3" />
        <circle cx="17" cy="9" r="2.5" />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 20a6 6 0 0112 0M14 20a5 5 0 017 0"
        />
      </svg>
    ),
  },
  {
    number: "04",
    title: "Professional Services",
    description:
      "Find healthcare, real estate, household services and other local professionals.",
    icon: (
      <svg
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        viewBox="0 0 24 24"
      >
        <rect x="3" y="6" width="18" height="14" rx="2" />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8 6V4h8v2M7 12h10M12 9v6"
        />
      </svg>
    ),
  },
];

const values = [
  {
    title: "Community First",
    description:
      "Bringing residents, families, businesses and organizations closer together.",
    icon: (
      <svg
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        viewBox="0 0 24 24"
      >
        <circle cx="9" cy="8" r="3" />
        <circle cx="17" cy="9" r="2.5" />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 20a6 6 0 0112 0M14 20a5 5 0 017 0"
        />
      </svg>
    ),
  },
  {
    title: "Easy Discovery",
    description:
      "A simple way to discover local businesses, services and resources without the hassle.",
    icon: (
      <svg
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        viewBox="0 0 24 24"
      >
        <circle cx="11" cy="11" r="7" />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M20 20l-4-4"
        />
      </svg>
    ),
  },
  {
    title: "Supporting Local",
    description:
      "Helping local businesses build visibility and reach more people in the community.",
    icon: (
      <svg
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 3v18M3 12h18"
        />
        <circle cx="12" cy="12" r="9" />
      </svg>
    ),
  },
];

export default function AboutPage() {
  const router = useRouter();

  const handleCategoryClick = (path: string) => {
    const isLoggedIn = document.cookie
      .split("; ")
      .some((cookie) => cookie.startsWith("token="));

    if (isLoggedIn) {
      router.push(path);
      return;
    }

    router.push(`/login?redirect=${encodeURIComponent(path)}`);
  };
  return (
    <main className="min-h-screen overflow-hidden bg-[#faf9f6] text-gray-900">

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative overflow-hidden">

        {/* Background */}
        <div className="absolute inset-0 bg-linear-to-br from-[#fffdf9] via-[#faf9f6] to-[#fff5f4]" />

        <div className="absolute -right-40 -top-40 h-128 w-lg rounded-full bg-red-100/50 blur-3xl" />

        <div className="absolute -bottom-40 -left-40 h-112 w-md rounded-full bg-yellow-100/50 blur-3xl" />

        {/* Decorative rings */}
        <div className="absolute right-[8%] top-28 hidden h-40 w-40 rounded-full border border-red-200/60 lg:block" />

        <div className="absolute right-[11%] top-36 hidden h-24 w-24 rounded-full border border-yellow-300/50 lg:block" />

        <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-28 lg:py-32">

          <div className="grid items-center gap-16 lg:grid-cols-[1.05fr_0.95fr]">

            {/* LEFT */}

            <div>

              <div className="inline-flex items-center gap-2 rounded-full border border-red-100 bg-white/80 px-4 py-2 shadow-sm backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-red-500" />

                <span className="text-sm font-semibold text-red-500">
                  About FriscoDesi
                </span>
              </div>

              <h1 className="mt-7 max-w-3xl text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
                Discover.
                <br />
                <span className="text-red-500">Connect.</span>
                <br />
                Belong.
              </h1>

              <p className="mt-7 max-w-2xl text-lg leading-8 text-gray-600 md:text-xl">
                FriscoDesi is a community-focused platform built to make it
                easier to discover businesses, services, organizations,
                activities and resources across Frisco.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">

                <Link
                  href="/"
                  className="group inline-flex items-center justify-center gap-2 rounded-full bg-red-500 px-7 py-3.5 font-semibold text-white shadow-lg shadow-red-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-red-600 hover:shadow-xl"
                >
                  Explore FriscoDesi

                  <span className="transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </Link>

                <Link
                  href="/register"
                  className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-7 py-3.5 font-semibold text-gray-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-red-200 hover:text-red-500 hover:shadow-md"
                >
                  Join the Community
                </Link>

              </div>

            </div>


            {/* RIGHT VISUAL */}

            <div className="relative mx-auto w-full max-w-md lg:ml-auto">

              <div className="absolute -inset-8 rounded-[3rem] bg-red-100/50 blur-3xl" />

              <div className="relative overflow-hidden rounded-4xl border border-white bg-white p-6 shadow-2xl shadow-gray-300/30 sm:p-8">

                {/* Top */}
                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                      Your Community Hub
                    </p>

                    <h2 className="mt-2 text-2xl font-bold">
                      FriscoDesi
                    </h2>

                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500 text-white shadow-lg shadow-red-500/20">

                    <svg
                      className="h-6 w-6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 21s8-4.5 8-10.5A4.5 4.5 0 0012 7a4.5 4.5 0 00-8 3.5C4 16.5 12 21 12 21z"
                      />
                    </svg>

                  </div>

                </div>


                {/* Feature list */}

                <div className="mt-8 space-y-3">

                  {[
                    "Local businesses",
                    "Food & stores",
                    "Community resources",
                    "Professional services",
                  ].map((item, index) => (

                    <div
                      key={item}
                      className="group flex items-center gap-4 rounded-2xl border border-gray-100 bg-[#faf9f6] p-4 transition-all duration-300 hover:-translate-x-1 hover:border-red-100 hover:bg-white"
                    >

                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-bold ${
                          index % 2 === 0
                            ? "bg-red-50 text-red-500"
                            : "bg-yellow-50 text-yellow-600"
                        }`}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </div>

                      <div className="flex-1">

                        <p className="font-semibold text-gray-800">
                          {item}
                        </p>

                        <div className="mt-1 h-1.5 w-16 rounded-full bg-gray-200 transition-all duration-300 group-hover:w-24 group-hover:bg-red-200" />

                      </div>

                      <span className="text-gray-300 transition group-hover:text-red-400">
                        →
                      </span>

                    </div>

                  ))}

                </div>


                {/* Bottom message */}

                <div className="mt-6 rounded-2xl bg-red-50 p-5">

                  <p className="text-sm font-semibold text-red-600">
                    One place. Many possibilities.
                  </p>

                  <p className="mt-1 text-sm leading-6 text-gray-600">
                    Built to make local discovery easier.
                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          INTRODUCTION
      ===================================================== */}

      <section className="bg-white py-20 sm:py-24 md:py-28">

        <div className="mx-auto max-w-7xl px-6">

          <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">

            <div>

              <p className="text-sm font-bold uppercase tracking-[0.2em] text-red-500">
                Why We Exist
              </p>

              <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                One community.
                <br />
                Many possibilities.
              </h2>

            </div>


            <div className="max-w-3xl">

              <p className="text-lg leading-8 text-gray-600">
                Finding the right business, service or community resource
                should not require searching across countless websites,
                directories and social media pages.
              </p>

              <p className="mt-5 text-lg leading-8 text-gray-600">
                FriscoDesi brings useful local resources together in one
                place, helping residents discover what they need while
                giving local businesses and organizations a better way to
                connect with the community.
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          DISCOVER
      ===================================================== */}

      <section className="bg-[#faf9f6] py-20 sm:py-24 md:py-28">

        <div className="mx-auto max-w-7xl px-6">

          <div className="mx-auto max-w-2xl text-center">

            <p className="text-sm font-bold uppercase tracking-[0.2em] text-red-500">
              Explore
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              What can you discover?
            </h2>

            <p className="mt-5 text-lg leading-7 text-gray-600">
              Explore a growing collection of businesses, services and
              community resources across Frisco.
            </p>

          </div>


          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

            {discoveryItems.map((item) => (

              <div
                key={item.title}
                className="group relative overflow-hidden rounded-3xl border border-gray-200/80 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-red-100 hover:shadow-2xl hover:shadow-gray-200/50"
              >

                <div className="flex items-start justify-between">

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-500 transition-all duration-300 group-hover:bg-red-500 group-hover:text-white">
                    {item.icon}
                  </div>

                  <span className="text-xs font-bold tracking-widest text-gray-300">
                    {item.number}
                  </span>

                </div>

                <h3 className="mt-7 text-xl font-bold">
                  {item.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-gray-600">
                  {item.description}
                </p>

                <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-red-500">
                  Discover
                  <span className="transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </div>

                <div className="absolute -bottom-16 -right-16 h-32 w-32 rounded-full bg-red-50 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              </div>

            ))}

          </div>

        </div>

      </section>


      {/* =====================================================
          MISSION
      ===================================================== */}

      <section className="bg-white py-20 sm:py-24 md:py-28">

        <div className="mx-auto max-w-7xl px-6">

          <div className="grid gap-14 lg:grid-cols-2 lg:items-center">

            <div>

              <p className="text-sm font-bold uppercase tracking-[0.2em] text-red-500">
                Our Mission
              </p>

              <h2 className="mt-4 max-w-xl text-3xl font-bold tracking-tight sm:text-4xl">
                Making local discovery simple, useful and accessible.
              </h2>

              <p className="mt-6 max-w-xl text-lg leading-8 text-gray-600">
                FriscoDesi is designed around a simple idea: useful local
                information should be easy to find.
              </p>

              <p className="mt-4 max-w-xl text-lg leading-8 text-gray-600">
                Whether you're looking for a service, discovering a new
                business or exploring community activities, FriscoDesi helps
                bring those possibilities closer to you.
              </p>

            </div>


            {/* Mission visual */}

            <div className="relative">

              <div className="absolute -inset-5 rounded-[2.5rem] bg-red-50 blur-2xl" />

              <div className="relative rounded-4xl border border-gray-100 bg-[#faf9f6] p-8 shadow-xl shadow-gray-200/40 sm:p-10">

                <div className="flex items-center gap-5">

                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-red-500 text-white shadow-lg shadow-red-500/20">

                    <svg
                      className="h-7 w-7"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 21s8-4.5 8-10.5A4.5 4.5 0 0012 7a4.5 4.5 0 00-8 3.5C4 16.5 12 21 12 21z"
                      />
                    </svg>

                  </div>

                  <div>

                    <p className="text-sm font-semibold text-gray-500">
                      Our focus
                    </p>

                    <h3 className="text-2xl font-bold">
                      Community connection
                    </h3>

                  </div>

                </div>


                <div className="my-8 h-px bg-gray-200" />

                <div className="space-y-5">

                  {[
                    "Discover useful local resources",
                    "Connect people with businesses",
                    "Support community organizations",
                  ].map((item, index) => (

                    <div
                      key={item}
                      className="flex items-center gap-4"
                    >

                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-50 text-xs font-bold text-red-500">
                        {index + 1}
                      </div>

                      <p className="font-medium text-gray-700">
                        {item}
                      </p>

                    </div>

                  ))}

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          VALUES
      ===================================================== */}

      <section className="bg-[#faf9f6] py-20 sm:py-24 md:py-28">

        <div className="mx-auto max-w-7xl px-6">

          <div className="mx-auto max-w-2xl text-center">

            <p className="text-sm font-bold uppercase tracking-[0.2em] text-red-500">
              Our Values
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Built with the community in mind.
            </h2>

          </div>


          <div className="mt-14 grid gap-6 md:grid-cols-3">

            {values.map((value) => (

              <div
                key={value.title}
                className="group rounded-3xl border border-gray-200/80 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-gray-200/50"
              >

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500 text-white shadow-lg shadow-red-500/15 transition-transform duration-300 group-hover:scale-105">
                  {value.icon}
                </div>

                <h3 className="mt-7 text-xl font-bold">
                  {value.title}
                </h3>

                <p className="mt-3 leading-7 text-gray-600">
                  {value.description}
                </p>

              </div>

            ))}

          </div>

        </div>

      </section>


      {/* =====================================================
          FINAL CTA
      ===================================================== */}

      <section className="bg-[#faf9f6] px-6 pb-20 pt-4 sm:pb-24 md:pb-28">

        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] bg-linear-to-br from-slate-950 via-blue-950 to-blue-800 px-8 py-20 text-center shadow-2xl sm:px-12 md:px-20">

          {/* Decorative glows */}

          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-red-500/20 blur-3xl" />

          <div className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-blue-400/20 blur-3xl" />

          <div className="absolute right-20 top-20 h-3 w-3 rounded-full bg-red-400/60" />

          <div className="absolute bottom-24 left-24 h-2 w-2 rounded-full bg-white/40" />

          <div className="relative">

            <p className="text-sm font-bold uppercase tracking-[0.2em] text-red-300">
              Join FriscoDesi
            </p>

            <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl">
              Your community is closer than you think.
            </h2>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-blue-100">
              Discover local businesses, services and resources — and become
              part of the growing FriscoDesi community.
            </p>

            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">

              <Link
                href="/register"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-red-500 px-8 py-3.5 font-semibold text-white shadow-lg shadow-black/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-red-600 hover:shadow-xl"
              >
                Join FriscoDesi

                <span className="transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </Link>

              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-8 py-3.5 font-semibold text-white backdrop-blur transition-all duration-300 hover:bg-white hover:text-blue-950"
              >
                Explore the Platform
              </Link>

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}