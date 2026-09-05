"use client";

import Link from "next/link";
import { useState } from "react";

interface NavbarProps {
  isUserLoggedIn: boolean;
  isAdminLoggedIn: boolean;
}

export default function Navbar({
  isUserLoggedIn,
  isAdminLoggedIn,
}: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  // =========================
  // EXPLORE SCROLL
  // =========================

  const handleExploreClick = () => {
    const exploreSection = document.getElementById("explore");

    if (exploreSection) {
      exploreSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-6">
        <div className="h-20 flex items-center justify-between">

          {/* =========================
              LOGO
          ========================= */}

          <Link
            href="/"
            className="text-2xl font-extrabold tracking-tight"
            onClick={() => setMenuOpen(false)}
          >
            <span className="text-gray-900">
              Frisco
            </span>

            <span className="text-red-500">
              Desi
            </span>
          </Link>


          {/* =========================
              DESKTOP NAVIGATION
          ========================= */}

          <nav className="hidden md:flex items-center gap-8">

            {/* EXPLORE */}

            <button
              type="button"
              onClick={handleExploreClick}
              className="
                text-gray-600
                font-medium
                hover:text-red-500
                transition-colors
              "
            >
              Explore
            </button>


            {/* ABOUT */}

            <Link
              href="/about"
              className="
                text-gray-600
                font-medium
                hover:text-red-500
                transition-colors
              "
            >
              About
            </Link>


            {/* CONTACT */}

            <Link
              href="/contact"
              className="
                text-gray-600
                font-medium
                hover:text-red-500
                transition-colors
              "
            >
              Contact Us
            </Link>

          </nav>


          {/* =========================
              DESKTOP ACTIONS
          ========================= */}

          <div className="hidden md:flex items-center gap-5">

            {/* ADMIN LOGGED IN */}

            {isAdminLoggedIn ? (

              <Link
                href="/admin/messages"
                className="
                  text-gray-700
                  font-semibold
                  hover:text-red-500
                  transition-colors
                "
              >
                Admin Panel
              </Link>

            ) : isUserLoggedIn ? (

              /* NORMAL USER LOGGED IN */

              <Link
                href="/dashboard"
                className="
                  inline-flex
                  items-center
                  justify-center
                  px-6
                  py-2.5
                  rounded-full
                  bg-red-500
                  text-white
                  font-semibold
                  shadow-md
                  shadow-red-500/20
                  hover:bg-red-600
                  hover:shadow-lg
                  hover:-translate-y-0.5
                  transition-all
                "
              >
                Dashboard
              </Link>

            ) : (

              /* NOT LOGGED IN */

              <>
                <Link
                  href="/login"
                  className="
                    text-gray-700
                    font-semibold
                    hover:text-red-500
                    transition-colors
                  "
                >
                  Sign In
                </Link>

                <Link
                  href="/register"
                  className="
                    inline-flex
                    items-center
                    justify-center
                    px-5
                    py-2.5
                    rounded-full
                    bg-red-500
                    text-white
                    font-semibold
                    shadow-md
                    shadow-red-500/20
                    hover:bg-red-600
                    hover:shadow-lg
                    hover:-translate-y-0.5
                    transition-all
                  "
                >
                  Join FriscoDesi
                </Link>
              </>
            )}

          </div>


          {/* =========================
              MOBILE MENU BUTTON
          ========================= */}

          <button
            type="button"
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
            className="
              md:hidden
              p-2
              rounded-lg
              text-gray-700
              hover:bg-gray-100
              transition
            "
          >
            {menuOpen ? (

              /* X ICON */

              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 6l12 12M18 6L6 18"
                />
              </svg>

            ) : (

              /* HAMBURGER */

              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>

            )}
          </button>

        </div>


        {/* =========================
            MOBILE NAVIGATION
        ========================= */}

        {menuOpen && (

          <div className="md:hidden border-t border-gray-100 py-5">

            <nav className="flex flex-col gap-2">

              {/* MOBILE EXPLORE */}

              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);

                  // Wait for menu to close before scrolling
                  setTimeout(() => {
                    handleExploreClick();
                  }, 100);
                }}
                className="
                  w-full
                  text-left
                  px-4
                  py-3
                  rounded-lg
                  text-gray-700
                  font-medium
                  hover:bg-red-50
                  hover:text-red-500
                  transition
                "
              >
                Explore
              </button>


              {/* ABOUT */}

              <Link
                href="/about"
                onClick={() => setMenuOpen(false)}
                className="
                  px-4
                  py-3
                  rounded-lg
                  text-gray-700
                  font-medium
                  hover:bg-red-50
                  hover:text-red-500
                  transition
                "
              >
                About
              </Link>


              {/* CONTACT */}

              <Link
                href="/contact"
                onClick={() => setMenuOpen(false)}
                className="
                  px-4
                  py-3
                  rounded-lg
                  text-gray-700
                  font-medium
                  hover:bg-red-50
                  hover:text-red-500
                  transition
                "
              >
                Contact Us
              </Link>


              {/* =========================
                  MOBILE AUTH
              ========================= */}

              <div className="border-t border-gray-100 mt-3 pt-4 flex flex-col gap-3">

                {isAdminLoggedIn ? (

                  <Link
                    href="/admin/messages"
                    onClick={() => setMenuOpen(false)}
                    className="
                      px-4
                      py-3
                      text-center
                      rounded-full
                      bg-red-500
                      text-white
                      font-semibold
                      hover:bg-red-600
                      transition
                    "
                  >
                    Admin Panel
                  </Link>

                ) : isUserLoggedIn ? (

                  <Link
                    href="/dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="
                      px-4
                      py-3
                      text-center
                      rounded-full
                      bg-red-500
                      text-white
                      font-semibold
                      hover:bg-red-600
                      transition
                    "
                  >
                    Dashboard
                  </Link>

                ) : (

                  <>

                    <Link
                      href="/login"
                      onClick={() => setMenuOpen(false)}
                      className="
                        px-4
                        py-3
                        text-center
                        rounded-full
                        border
                        border-gray-200
                        text-gray-700
                        font-semibold
                        hover:border-red-300
                        hover:text-red-500
                        transition
                      "
                    >
                      Sign In
                    </Link>


                    <Link
                      href="/register"
                      onClick={() => setMenuOpen(false)}
                      className="
                        px-4
                        py-3
                        text-center
                        rounded-full
                        bg-red-500
                        text-white
                        font-semibold
                        hover:bg-red-600
                        transition
                      "
                    >
                      Join FriscoDesi
                    </Link>

                  </>

                )}

              </div>

            </nav>

          </div>

        )}

      </div>
    </header>
  );
}