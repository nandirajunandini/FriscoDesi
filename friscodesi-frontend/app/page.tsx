import Link from "next/link";
import WeatherWidget from "@/components/WeatherWidget";
import AnimatedCategoryGrid from "@/app/section/[slug]/category-grid";

interface Category {
  id: number;
  name: string;
  slug: string;
}

/* =========================================================
   GET CATEGORIES
========================================================= */

async function getCategories(): Promise<Category[]> {
  try {
    const res = await fetch(
      "http://localhost:1337/api/categories?pagination[pageSize]=100",
      {
        cache: "no-store",
      }
    );

    if (!res.ok) {
      console.error(
        "Failed to fetch categories:",
        res.status
      );

      return [];
    }

    const data = await res.json();

    return data.data || [];
  } catch (error) {
    console.error(
      "Category fetch error:",
      error
    );

    return [];
  }
}

/* =========================================================
   HOME PAGE
========================================================= */

export default async function HomePage() {
  const categories = await getCategories();

  /*
    Show only a curated selection
    on the homepage.
  */

  const featuredCategories =
    categories.slice(0, 8);

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">

      {/* =====================================================
          HERO
      ===================================================== */}

      <section
        className="
          relative
          overflow-hidden
          bg-linear-to-br
          from-slate-950
          via-blue-950
          to-blue-700
          text-white
          min-h-[calc(100vh-80px)]
          flex
          items-center
        "
      >

        {/* =================================================
            BACKGROUND DECORATION
        ================================================= */}

        {/* Subtle blue glow */}

        <div
          className="
            absolute
            -top-40
            -left-40
            w-137.5
            h-137.5
            rounded-full
            bg-blue-500
            blur-3xl
            opacity-20
            pointer-events-none
          "
        />

        {/* Subtle red brand glow */}

        <div
          className="
            absolute
            -bottom-40
            -right-40
            w-137.5
            h-137.5
            rounded-full
            bg-red-500
            blur-3xl
            opacity-15
            pointer-events-none
          "
        />

        {/* Very subtle center glow */}

        <div
          className="
            absolute
            top-1/2
            left-1/2
            -translate-x-1/2
            -translate-y-1/2
            w-112.5
            h-112.5
            rounded-full
            bg-blue-400
            blur-3xl
            opacity-10
            pointer-events-none
          "
        />

        {/* Decorative rings */}

        <div
          className="
            absolute
            top-24
            right-20
            w-32
            h-32
            rounded-full
            border
            border-white/10
            pointer-events-none
          "
        />

        <div
          className="
            absolute
            bottom-20
            left-20
            w-20
            h-20
            rounded-full
            border
            border-white/10
            pointer-events-none
          "
        />


        {/* =================================================
            HERO CONTENT
        ================================================= */}

        <div
          className="
            relative
            z-10
            max-w-7xl
            mx-auto
            w-full
            px-6
            py-20
            lg:py-24
            grid
            lg:grid-cols-2
            gap-14
            lg:gap-20
            items-center
          "
        >

          {/* =================================================
              LEFT SIDE
          ================================================= */}

          <div className="text-center lg:text-left">

            {/* Community Label */}

            <div
              className="
                inline-flex
                items-center
                gap-2
                mb-7
                px-4
                py-2
                rounded-full
                bg-white/10
                border
                border-white/15
                backdrop-blur-md
                text-sm
                font-medium
                text-blue-100
                shadow-lg
              "
            >

              <span
                className="
                  w-2
                  h-2
                  rounded-full
                  bg-red-400
                  animate-pulse
                "
              />

              Your Frisco Community Hub

            </div>


            {/* Main Heading */}

            <h1
              className="
                text-5xl
                sm:text-6xl
                lg:text-7xl
                font-extrabold
                leading-[1.02]
                tracking-tight
              "
            >

              Discover

              <br />

              <span className="text-red-400">
                FriscoDesi
              </span>

            </h1>


            {/* Description */}

            <p
              className="
                mt-7
                text-lg
                sm:text-xl
                text-blue-100
                max-w-xl
                mx-auto
                lg:mx-0
                leading-8
              "
            >
              Your complete community hub for residents,
              families, students, and visitors in{" "}

              <span className="font-semibold text-white">
                Frisco, Texas.
              </span>
            </p>


            {/* =================================================
                ACTION BUTTONS
            ================================================= */}

            <div
              className="
                mt-10
                flex
                flex-wrap
                justify-center
                lg:justify-start
                gap-4
              "
            >

              {/* Register / Get Started */}

              <Link
                href="/register"
                className="
                  group
                  inline-flex
                  items-center
                  justify-center
                  bg-red-500
                  text-white
                  px-8
                  py-4
                  rounded-full
                  font-semibold
                  shadow-xl
                  shadow-red-950/30
                  hover:bg-red-600
                  hover:scale-[1.03]
                  transition-all
                  duration-300
                "
              >
                Get Started

                <span
                  className="
                    ml-2
                    inline-block
                    group-hover:translate-x-1
                    transition-transform
                  "
                >
                  →
                </span>
              </Link>


              {/* Existing User Login */}

              <Link
                href="/login"
                className="
                  inline-flex
                  items-center
                  justify-center
                  px-8
                  py-4
                  rounded-full
                  font-semibold
                  border
                  border-white/30
                  bg-white/10
                  backdrop-blur-md
                  text-white
                  hover:bg-white
                  hover:text-blue-900
                  hover:border-white
                  transition-all
                  duration-300
                "
              >
                Login
              </Link>

            </div>


            {/* =================================================
                COMMUNITY TRUST
            ================================================= */}

            <div
              className="
                mt-10
                flex
                items-center
                justify-center
                lg:justify-start
                gap-3
                text-sm
                text-blue-100
              "
            >

              <div className="flex -space-x-2">

                <div
                  className="
                    w-8
                    h-8
                    rounded-full
                    bg-red-400
                    border-2
                    border-blue-950
                  "
                />

                <div
                  className="
                    w-8
                    h-8
                    rounded-full
                    bg-orange-300
                    border-2
                    border-blue-950
                  "
                />

                <div
                  className="
                    w-8
                    h-8
                    rounded-full
                    bg-white
                    border-2
                    border-blue-950
                  "
                />

              </div>

              <span>
                Built for the Frisco community
              </span>

            </div>

          </div>


          {/* =================================================
              RIGHT SIDE — WEATHER
          ================================================= */}

          <div
            className="
              flex
              justify-center
              lg:justify-end
            "
          >

            <div
              className="
                relative
                w-full
                max-w-md
              "
            >

              {/* Weather glow */}

              <div
                className="
                  absolute
                  -inset-8
                  bg-blue-400/15
                  blur-3xl
                  rounded-full
                  pointer-events-none
                "
              />


              {/* Weather glass frame */}

              <div
                className="
                  relative
                  rounded-4xl
                  border
                  border-white/20
                  bg-white/10
                  backdrop-blur-md
                  p-2
                  shadow-2xl
                "
              >

                <WeatherWidget />

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          EXPLORE FRISCO
      ===================================================== */}

      <section
      id="explore"
        className="
          bg-linear-to-b
          from-gray-50
          via-white
          to-gray-50
          py-24
          -scroll-mt-20
        "
      >

        <div className="max-w-7xl mx-auto px-6">

          {/* =================================================
              SECTION HEADER
          ================================================= */}

          <div
            className="
              text-center
              max-w-2xl
              mx-auto
              mb-14
            "
          >

            <span
              className="
                inline-block
                px-4
                py-2
                rounded-full
                bg-red-50
                text-red-600
                text-sm
                font-semibold
                mb-4
              "
            >
              Explore Frisco
            </span>


            <h2
              className="
                text-4xl
                md:text-5xl
                font-extrabold
                text-gray-900
                tracking-tight
              "
            >
              Discover what Frisco has to offer
            </h2>


            <p
              className="
                mt-5
                text-lg
                text-gray-500
                leading-7
              "
            >
              Find trusted businesses, services,
              organizations, activities, and resources
              for the Frisco community.
            </p>

          </div>


          {/* =================================================
              CATEGORY CARDS
          ================================================= */}

          {featuredCategories.length > 0 ? (

            <AnimatedCategoryGrid
              categories={
                featuredCategories
              }
            />

          ) : (

            <div
              className="
                bg-white
                rounded-3xl
                p-12
                text-center
                border
                border-gray-100
                shadow-sm
              "
            >

              <p className="text-gray-500">
                Categories are coming soon.
              </p>

            </div>

          )}

        </div>

      </section>


      {/* =====================================================
          COMMUNITY CTA
      ===================================================== */}

      <section
        className="
          relative
          overflow-hidden
          bg-white
          py-24
        "
      >

        <div className="max-w-5xl mx-auto px-6">

          <div
            className="
              relative
              overflow-hidden
              rounded-4xl
              bg-linear-to-br
              from-slate-950
              via-blue-950
              to-blue-700
              px-8
              py-16
              md:px-16
              text-center
              shadow-2xl
            "
          >

            {/* Red glow */}

            <div
              className="
                absolute
                -top-24
                -right-24
                w-72
                h-72
                rounded-full
                bg-red-500/15
                blur-3xl
                pointer-events-none
              "
            />

            {/* Blue glow */}

            <div
              className="
                absolute
                -bottom-24
                -left-24
                w-72
                h-72
                rounded-full
                bg-blue-400/15
                blur-3xl
                pointer-events-none
              "
            />


            {/* CTA Content */}

            <div className="relative z-10">

              <span
                className="
                  inline-block
                  text-red-300
                  text-sm
                  font-semibold
                  uppercase
                  tracking-wider
                  mb-4
                "
              >
                Join the Community
              </span>


              <h2
                className="
                  text-3xl
                  md:text-5xl
                  font-extrabold
                  text-white
                  tracking-tight
                "
              >
                Be part of FriscoDesi
              </h2>


              <p
                className="
                  mt-5
                  text-blue-100
                  text-lg
                  max-w-2xl
                  mx-auto
                  leading-8
                "
              >
                Discover local businesses, connect with
                your community, and find everything you
                need in Frisco, Texas.
              </p>


              {/* Register CTA */}

              <div className="mt-9">

                <Link
                  href="/register"
                  className="
                    inline-flex
                    items-center
                    gap-2
                    bg-red-500
                    text-white
                    px-8
                    py-4
                    rounded-full
                    font-semibold
                    shadow-xl
                    shadow-red-950/30
                    hover:bg-red-600
                    hover:scale-[1.03]
                    transition-all
                    duration-300
                  "
                >
                  Join FriscoDesi

                  <span>
                    →
                  </span>
                </Link>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer
        className="
          bg-gray-950
          text-gray-400
          text-center
          py-8
          text-sm
        "
      >

        <p>

          © {new Date().getFullYear()}{" "}

          <span className="text-white font-semibold">
            Frisco
          </span>

          <span className="text-red-500 font-semibold">
            Desi
          </span>

          . Built for the community ❤️

        </p>

      </footer>

    </main>
  );
}