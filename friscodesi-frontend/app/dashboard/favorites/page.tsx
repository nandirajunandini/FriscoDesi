"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Heart,
  MapPin,
  Trash2,
  ArrowRight,
} from "lucide-react";

/* =========================================================
   Interfaces
========================================================= */

interface Listing {
  id: number;
  documentId?: string;
  name: string;
  slug: string;
  address?: string;
  description?: string;
  rating?: number;
}

interface Favorite {
  id: number;
  documentId?: string;
  listing?: Listing;
}

/* =========================================================
   Favorites Page
========================================================= */

export default function FavoritesPage() {
  const [favorites, setFavorites] =
    useState<Favorite[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [removingId, setRemovingId] =
    useState<number | null>(null);

  /* =======================================================
     Fetch Favorites
  ======================================================= */

  async function fetchFavorites() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/favorites",
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        setError(
          data.error ||
            "Failed to load favorites"
        );

        return;
      }

      setFavorites(
        data.data || []
      );
    } catch (error) {
      console.error(
        "Error fetching favorites:",
        error
      );

      setError(
        "Unable to load favorites"
      );
    } finally {
      setLoading(false);
    }
  }

  /* =======================================================
     Load favorites when page opens
  ======================================================= */

  useEffect(() => {
    fetchFavorites();
  }, []);

  /* =======================================================
     Listen for favorite changes
     
     This allows the Favorites page to
     refresh if another component changes
     a favorite.
  ======================================================= */

  useEffect(() => {
    const handleFavoritesUpdated = () => {
      fetchFavorites();
    };

    window.addEventListener(
      "favoritesUpdated",
      handleFavoritesUpdated
    );

    return () => {
      window.removeEventListener(
        "favoritesUpdated",
        handleFavoritesUpdated
      );
    };
  }, []);

  /* =======================================================
     Remove Favorite
  ======================================================= */

  async function removeFavorite(
    listingId: number
  ) {
    try {
      setRemovingId(listingId);

      console.log(
        "Removing listing:",
        listingId
      );

      const response =
        await fetch(
          "/api/favorites",
          {
            method: "DELETE",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              listingId,
            }),
          }
        );

      /*
        DELETE normally returns JSON from
        our Next.js API.

        But safely handle an empty response
        as well.
      */

      let data: any = {};

      try {
        data =
          await response.json();
      } catch {
        // Empty response
      }

      if (!response.ok) {
        console.error(
          "Remove favorite error:",
          data
        );

        alert(
          data.error ||
            "Failed to remove favorite"
        );

        return;
      }

      console.log(
        "Favorite removed:",
        listingId
      );

      /*
        Remove the item immediately
        from the screen.
      */

      setFavorites(
        (currentFavorites) =>
          currentFavorites.filter(
            (favorite) =>
              favorite.listing?.id !==
              listingId
          )
      );

      /*
        Notify other components,
        including FavoriteButton.
      */

      window.dispatchEvent(
        new Event("favoritesUpdated")
      );

    } catch (error) {
      console.error(
        "Remove favorite error:",
        error
      );

      alert(
        "Failed to remove favorite"
      );
    } finally {
      setRemovingId(null);
    }
  }

  /* =======================================================
     Loading
  ======================================================= */

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">

        <div className="max-w-7xl mx-auto px-6 py-10">

          <div className="mb-8">

            <div className="
              h-8
              w-48
              bg-gray-200
              rounded
              animate-pulse
            " />

            <div className="
              h-4
              w-72
              bg-gray-200
              rounded
              mt-3
              animate-pulse
            " />

          </div>

          <div className="
            grid
            gap-6
            sm:grid-cols-2
            lg:grid-cols-3
          ">

            {[1, 2, 3].map(
              (item) => (
                <div
                  key={item}
                  className="
                    bg-white
                    rounded-2xl
                    border
                    p-6
                    shadow-sm
                  "
                >

                  <div className="
                    w-12
                    h-12
                    bg-gray-200
                    rounded-xl
                    animate-pulse
                    mb-5
                  " />

                  <div className="
                    h-5
                    w-40
                    bg-gray-200
                    rounded
                    animate-pulse
                  " />

                  <div className="
                    h-4
                    w-52
                    bg-gray-200
                    rounded
                    mt-4
                    animate-pulse
                  " />

                  <div className="
                    h-4
                    w-32
                    bg-gray-200
                    rounded
                    mt-6
                    animate-pulse
                  " />

                </div>
              )
            )}

          </div>

        </div>

      </main>
    );
  }

  /* =======================================================
     Error
  ======================================================= */

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50">

        <div className="
          max-w-2xl
          mx-auto
          px-6
          py-16
        ">

          <div className="
            bg-white
            border
            border-red-100
            rounded-2xl
            p-8
            text-center
            shadow-sm
          ">

            <div className="
              w-14
              h-14
              mx-auto
              rounded-full
              bg-red-50
              text-red-500
              flex
              items-center
              justify-center
              mb-5
            ">
              <Heart size={26} />
            </div>

            <h1 className="
              text-xl
              font-semibold
              text-gray-900
            ">
              Unable to load favorites
            </h1>

            <p className="
              text-gray-500
              mt-2
            ">
              {error}
            </p>

            <button
              onClick={fetchFavorites}
              className="
                mt-6
                bg-blue-600
                hover:bg-blue-700
                text-white
                px-5
                py-2.5
                rounded-xl
                font-medium
                transition
              "
            >
              Try Again
            </button>

          </div>

        </div>

      </main>
    );
  }

  /* =======================================================
     Empty Favorites
  ======================================================= */

  if (favorites.length === 0) {
    return (
      <main className="
        min-h-screen
        bg-linear-to-b
        from-gray-50
        via-white
        to-blue-50
      ">

        <div className="
          max-w-7xl
          mx-auto
          px-6
          py-10
        ">

          <div className="mb-10">

            <div className="
              flex
              items-center
              gap-3
            ">

              <div className="
                w-12
                h-12
                rounded-xl
                bg-red-50
                text-red-500
                flex
                items-center
                justify-center
              ">
                <Heart size={24} />
              </div>

              <div>

                <h1 className="
                  text-3xl
                  font-bold
                  text-gray-900
                ">
                  Favorites
                </h1>

                <p className="
                  text-gray-500
                  mt-1
                ">
                  Places you have saved for later.
                </p>

              </div>

            </div>

          </div>

          <div className="
            bg-white
            border
            rounded-2xl
            p-12
            text-center
            shadow-sm
          ">

            <div className="
              w-16
              h-16
              mx-auto
              rounded-full
              bg-red-50
              text-red-500
              flex
              items-center
              justify-center
              mb-5
            ">
              <Heart size={30} />
            </div>

            <h2 className="
              text-xl
              font-semibold
              text-gray-900
            ">
              No favorites yet
            </h2>

            <p className="
              text-gray-500
              mt-2
              max-w-md
              mx-auto
            ">
              When you find a place you love,
              add it to your favorites and
              it will appear here.
            </p>

            <Link
              href="/"
              className="
                inline-flex
                items-center
                gap-2
                mt-6
                bg-blue-600
                hover:bg-blue-700
                text-white
                px-5
                py-2.5
                rounded-xl
                font-medium
                transition
              "
            >
              Explore Places

              <ArrowRight size={18} />

            </Link>

          </div>

        </div>

      </main>
    );
  }

  /* =======================================================
     Favorites List
  ======================================================= */

  return (
    <main className="
      min-h-screen
      bg-linear-to-b
      from-gray-50
      via-white
      to-blue-50
    ">

      <div className="
        max-w-7xl
        mx-auto
        px-6
        py-10
      ">

        {/* =================================================
            Header
        ================================================= */}

        <div className="mb-10">

          <div className="
            flex
            items-center
            gap-3
          ">

            <div className="
              w-12
              h-12
              rounded-xl
              bg-red-50
              text-red-500
              flex
              items-center
              justify-center
            ">
              <Heart size={24} />
            </div>

            <div>

              <h1 className="
                text-3xl
                font-bold
                text-gray-900
              ">
                Favorites
              </h1>

              <p className="
                text-gray-500
                mt-1
              ">
                {favorites.length}{" "}
                {favorites.length === 1
                  ? "place"
                  : "places"}{" "}
                saved by you.
              </p>

            </div>

          </div>

        </div>

        {/* =================================================
            Cards
        ================================================= */}

        <div className="
          grid
          gap-6
          sm:grid-cols-2
          lg:grid-cols-3
        ">

          {favorites.map(
            (favorite) => {

              const listing =
                favorite.listing;

              /*
                In case a favorite has no
                listing attached.
              */

              if (!listing) {
                return null;
              }

              /*
                IMPORTANT:

                Always use the numeric
                listing ID.

                Do NOT use:
                listing.documentId
              */

              const listingIdentifier =
                listing.id;

              const isRemoving =
                removingId ===
                listingIdentifier;

              return (
                <div
                  key={
                    favorite.documentId ||
                    favorite.id
                  }
                  className="
                    group
                    bg-white
                    rounded-2xl
                    border
                    border-gray-100
                    shadow-sm
                    hover:shadow-xl
                    transition
                    duration-300
                    overflow-hidden
                  "
                >

                  {/* =================================================
                      Card Top
                  ================================================= */}

                  <div className="p-6">

                    <div className="
                      flex
                      items-start
                      justify-between
                      gap-4
                    ">

                      <div className="
                        w-12
                        h-12
                        rounded-xl
                        bg-red-50
                        text-red-500
                        flex
                        items-center
                        justify-center
                        shrink-0
                      ">
                        <Heart
                          size={23}
                          fill="currentColor"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          removeFavorite(
                            listingIdentifier
                          )
                        }
                        disabled={
                          isRemoving
                        }
                        aria-label={
                          `Remove ${listing.name} from favorites`
                        }
                        className="
                          p-2
                          rounded-lg
                          text-gray-400
                          hover:text-red-500
                          hover:bg-red-50
                          transition
                          disabled:opacity-50
                        "
                      >

                        <Trash2
                          size={18}
                        />

                      </button>

                    </div>

                    {/* =================================================
                        Listing Name
                    ================================================= */}

                    <h2 className="
                      mt-5
                      text-xl
                      font-semibold
                      text-gray-900
                      group-hover:text-blue-600
                      transition
                    ">
                      {listing.name}
                    </h2>

                    {/* =================================================
                        Address
                    ================================================= */}

                    {listing.address && (
                      <div className="
                        flex
                        items-start
                        gap-2
                        mt-3
                        text-sm
                        text-gray-500
                      ">

                        <MapPin
                          size={17}
                          className="
                            mt-0.5
                            shrink-0
                            text-red-400
                          "
                        />

                        <span className="
                          line-clamp-2
                        ">
                          {listing.address}
                        </span>

                      </div>
                    )}

                    {/* =================================================
                        Rating
                    ================================================= */}

                    {listing.rating !==
                      undefined && (
                      <div className="
                        mt-4
                        text-sm
                        text-gray-600
                      ">
                        ⭐{" "}
                        {listing.rating}
                      </div>
                    )}

                    {/* =================================================
                        View Details
                    ================================================= */}

                    <Link
                      href={`/listing/${listing.slug}`}
                      className="
                        mt-6
                        flex
                        items-center
                        justify-between
                        w-full
                        border-t
                        pt-4
                        text-sm
                        text-blue-600
                        font-medium
                        hover:text-blue-700
                      "
                    >

                      <span>
                        View Details
                      </span>

                      <ArrowRight
                        size={18}
                        className="
                          group-hover:translate-x-1
                          transition
                        "
                      />

                    </Link>

                  </div>

                </div>
              );
            }
          )}

        </div>

      </div>

    </main>
  );
}