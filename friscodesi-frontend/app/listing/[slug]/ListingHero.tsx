"use client";

import Link from "next/link";
import type { Listing } from "./page";
import FavoriteButton from "./FavoriteButton";

interface Props {
  listing: Listing;
}

export default function ListingHero({
  listing,
}: Props) {
  const section = listing.category?.section;

  return (
    <section className="px-6 pt-10 pb-12">
      <div className="max-w-6xl mx-auto">

        {/* ================= Breadcrumb ================= */}

        <div className="flex flex-wrap items-center text-sm text-gray-500 mb-8">

          <Link
            href="/"
            className="hover:text-red-600 transition"
          >
            Home
          </Link>

          <span className="mx-2">/</span>

          {section ? (
            <>
              <Link
                href={`/section/${section.slug}`}
                className="hover:text-red-600 transition"
              >
                {section.name}
              </Link>

              <span className="mx-2">/</span>
            </>
          ) : null}

          <Link
            href={`/category/${listing.category.slug}`}
            className="hover:text-red-600 transition"
          >
            {listing.category.name}
          </Link>

          <span className="mx-2">/</span>

          <span className="font-semibold text-gray-900">
            {listing.name}
          </span>

        </div>

        {/* ================= Hero Image ================= */}

        {listing.image ? (
          <img
            src={listing.image}
            alt={listing.name}
            className="w-full h-105 rounded-3xl object-cover shadow-xl mb-10"
          />
        ) : (
          <div className="w-full h-105 rounded-3xl bg-linear-to-r from-yellow-200 to-amber-100 flex items-center justify-center shadow-xl mb-10">
            <span className="text-7xl">
              🏢
            </span>
          </div>
        )}

        {/* ================= Hero Card ================= */}

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-10">

          <span className="inline-block bg-yellow-100 text-red-600 px-4 py-2 rounded-full font-semibold text-sm">
            {listing.category.name}
          </span>

          <h1 className="text-5xl font-bold text-gray-900 mt-6">
            {listing.name}
          </h1>

          <p className="mt-6 text-lg text-gray-600 flex items-center gap-2">
            📍 {listing.address}
          </p>

          <div className="mt-6">
            <span className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-700 px-5 py-3 rounded-full font-semibold">
              ⭐ {listing.rating} / 5
            </span>
          </div>

          {/* ================= Action Buttons ================= */}

          <div className="flex flex-wrap gap-4 mt-10">

            {/* Call */}

            {listing.phone && (
              <a
                href={`tel:${listing.phone}`}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition"
              >
                📞 Call
              </a>
            )}

            {/* Website */}

            {listing.website && (
              <a
                href={listing.website}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition"
              >
                🌐 Website
              </a>
            )}

            {/* Directions */}

            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                listing.address
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold transition"
            >
              📍 Directions
            </a>

            {/* ================= Favorite ================= */}

            <FavoriteButton
              listingId={listing.id}
            />

          </div>

        </div>

      </div>
    </section>
  );
}