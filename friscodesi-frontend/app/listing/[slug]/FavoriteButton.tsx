"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

interface FavoriteButtonProps {
  listingId: number;
}

interface Favorite {
  id?: number;
  documentId?: string;

  listing?: {
    id?: number;
    documentId?: string;
  };

  listingData?: {
    id?: number;
    documentId?: string;
  };
}

export default function FavoriteButton({
  listingId,
}: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  /* =====================================================
     CHECK FAVORITE STATUS
  ===================================================== */

  const checkFavorite =
    useCallback(async () => {
      try {
        /*
          Check the specific listing
          instead of downloading all
          favorites.
        */

        const response =
          await fetch(
            `/api/favorites?listingId=${listingId}&_=${Date.now()}`,
            {
              method: "GET",
              cache: "no-store",
            }
          );

        if (!response.ok) {
          setIsFavorite(false);
          return;
        }

        const result =
          await response.json();

        setIsFavorite(
          result.isFavorite === true
        );

      } catch (error) {
        console.error(
          "Check favorite error:",
          error
        );

        setIsFavorite(false);
      }
    }, [listingId]);

  /* =====================================================
     INITIAL CHECK
  ===================================================== */

  useEffect(() => {
    const loadFavoriteStatus =
      async () => {
        setLoading(true);

        await checkFavorite();

        setLoading(false);
      };

    loadFavoriteStatus();
  }, [checkFavorite]);

  /* =====================================================
     RECHECK WHEN PAGE BECOMES VISIBLE
  ===================================================== */

  useEffect(() => {
    const handleVisibilityChange =
      () => {
        if (
          document.visibilityState ===
          "visible"
        ) {
          checkFavorite();
        }
      };

    const handlePageShow =
      () => {
        checkFavorite();
      };

    const handleWindowFocus =
      () => {
        checkFavorite();
      };

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    window.addEventListener(
      "pageshow",
      handlePageShow
    );

    window.addEventListener(
      "focus",
      handleWindowFocus
    );

    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );

      window.removeEventListener(
        "pageshow",
        handlePageShow
      );

      window.removeEventListener(
        "focus",
        handleWindowFocus
      );
    };
  }, [checkFavorite]);

  /* =====================================================
     ADD / REMOVE FAVORITE
  ===================================================== */

  const handleFavorite =
    async () => {
      if (saving) {
        return;
      }

      setSaving(true);

      try {
        /* =================================================
           REMOVE FAVORITE
        ================================================= */

        if (isFavorite) {
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
            Our API normally returns JSON.

            Safely handle an empty
            response as well.
          */

          let result: any = {};

          try {
            result =
              await response.json();
          } catch {
            // Empty response
          }

          if (!response.ok) {
            console.error(
              "Remove favorite error:",
              result
            );

            alert(
              result.error ||
                "Unable to remove favorite"
            );

            return;
          }

          /*
            Update UI immediately.
          */

          setIsFavorite(false);

          /*
            Notify other components.
          */

          window.dispatchEvent(
            new Event(
              "favoritesUpdated"
            )
          );

          return;
        }

        /* =================================================
           ADD FAVORITE
        ================================================= */

        const response =
          await fetch(
            "/api/favorites",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                listingId,
              }),
            }
          );

        const result =
          await response.json();

        if (!response.ok) {
          console.error(
            "Add favorite error:",
            result
          );

          if (
            response.status ===
            401
          ) {
            alert(
              "Please login to add favorites."
            );
          } else {
            alert(
              result.error ||
                "Unable to add favorite"
            );
          }

          return;
        }

        /*
          Update UI immediately.
        */

        setIsFavorite(true);

        /*
          Notify other components.
        */

        window.dispatchEvent(
          new Event(
            "favoritesUpdated"
          )
        );

      } catch (error) {
        console.error(
          "Favorite error:",
          error
        );

        alert(
          "Something went wrong. Please try again."
        );
      } finally {
        setSaving(false);
      }
    };

  /* =====================================================
     LISTEN FOR FAVORITE CHANGES
  ===================================================== */

  useEffect(() => {
    const handleFavoritesUpdated =
      () => {
        checkFavorite();
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
  }, [checkFavorite]);

  /* =====================================================
     LOADING STATE
  ===================================================== */

  if (loading) {
    return (
      <button
        type="button"
        disabled
        className="
          flex
          h-12
          w-12
          items-center
          justify-center
          rounded-full
          bg-white
          shadow-lg
          opacity-70
        "
        aria-label="Loading favorite"
      >
        <span className="text-xl">
          ♡
        </span>
      </button>
    );
  }

  /* =====================================================
     FAVORITE BUTTON
  ===================================================== */

  return (
    <button
      type="button"
      onClick={handleFavorite}
      disabled={saving}
      aria-label={
        isFavorite
          ? "Remove from favorites"
          : "Add to favorites"
      }
      title={
        isFavorite
          ? "Remove from favorites"
          : "Add to favorites"
      }
      className="
        flex
        h-12
        w-12
        items-center
        justify-center
        rounded-full
        bg-white
        shadow-lg
        transition-all
        duration-200
        hover:scale-110
        hover:shadow-xl
        disabled:cursor-not-allowed
        disabled:opacity-60
      "
    >
      <span
        className={`
          text-2xl
          transition-colors
          duration-200
          ${
            isFavorite
              ? "text-red-500"
              : "text-gray-600"
          }
        `}
      >
        {isFavorite
          ? "♥"
          : "♡"}
      </span>
    </button>
  );
}