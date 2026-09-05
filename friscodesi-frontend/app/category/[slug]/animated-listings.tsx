"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";

import {
  MapPin,
  Star,
  Store,
  Utensils,
  Scissors,
  Wrench,
  Scale,
  DollarSign,
  HeartPulse,
  Home,
  Sparkles,
  Baby,
  CookingPot,
} from "lucide-react";

interface Listing {
  id: number;
  name: string;
  slug: string;
  address: string;
  rating: number;
  foodType?: string | null;
}

/* ============================= */
/* Slug → Icon Mapping           */
/* ============================= */

const iconMap: Record<string, any> = {
  food: Utensils,
  restaurant: Utensils,
  salon: Scissors,
  mechanics: Wrench,
  legal: Scale,
  financial: DollarSign,
  medical: HeartPulse,
  "real-estate": Home,
  spirituality: Sparkles,
  nanny: Baby,
  cooks: CookingPot,
  default: Store,
};

/* ============================= */
/* Auto Detect Icon              */
/* ============================= */

function getIcon(slug: string) {
  const lower = (slug || "").toLowerCase();

  for (const key in iconMap) {
    if (lower.includes(key)) {
      return iconMap[key];
    }
  }

  return iconMap.default;
}

/* ============================= */
/* Component                     */
/* ============================= */

export default function AnimatedListingGrid({
  listings,
  categorySlug,
}: {
  listings: Listing[];
  categorySlug: string;
}) {
  /*
    Food category only
  */

  const isFoodCategory =
    categorySlug.toLowerCase() === "food";

  /*
    Food Type filter
  */

  const [foodType, setFoodType] = useState("");

  /*
    Filter listings
  */

  const filteredListings = useMemo(() => {
    // For non-food categories,
    // show all listings
    if (!isFoodCategory || !foodType) {
      return listings;
    }

    const selectedFoodType =
      foodType.trim().toLowerCase();

    return listings.filter((listing) => {
      const listingFoodType =
        (listing.foodType || "")
          .trim()
          .toLowerCase();

      return listingFoodType === selectedFoodType;
    });
  }, [
    listings,
    foodType,
    isFoodCategory,
  ]);

  /*
    Icon
  */

  const Icon = getIcon(categorySlug);

  return (
    <>
      {/* =================================
          FOOD TYPE FILTER
      ================================= */}

      {isFoodCategory && (
        <div className="mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">

            <label className="font-medium text-gray-700">
              Filter by Food Type:
            </label>

            <select
              value={foodType}
              onChange={(e) =>
                setFoodType(e.target.value)
              }
              className="
                border border-gray-300
                rounded-xl
                px-4 py-3
                bg-white
                shadow-sm
                focus:outline-none
                focus:ring-2
                focus:ring-indigo-500
              "
            >
              <option value="">
                All
              </option>

              <option value="Pure Veg">
                Pure Veg
              </option>

              <option value="Non Veg">
                Non Veg
              </option>

              <option value="Veg & Non Veg">
                Veg & Non Veg
              </option>
            </select>

          </div>
        </div>
      )}

      {/* =================================
          NO LISTINGS AT ALL
      ================================= */}

      {listings.length === 0 && (
        <div className="
          bg-white
          p-12
          rounded-3xl
          shadow-md
          text-center
          border border-gray-200
        ">
          <p className="text-gray-500 text-lg">
            No listings available yet.
          </p>
        </div>
      )}

      {/* =================================
          NO RESULTS AFTER FILTER
      ================================= */}

      {listings.length > 0 &&
        filteredListings.length === 0 && (
          <div className="
            bg-white
            p-12
            rounded-3xl
            shadow-md
            text-center
            border border-gray-200
          ">
            <p className="text-gray-500 text-lg">
              No listings found for{" "}
              <span className="font-semibold">
                {foodType}
              </span>
              .
            </p>

            <button
              onClick={() => setFoodType("")}
              className="
                mt-4
                text-indigo-600
                font-medium
                hover:underline
              "
            >
              Clear filter
            </button>
          </div>
        )}

      {/* =================================
          LISTINGS
      ================================= */}

      {filteredListings.length > 0 && (
        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},

            show: {
              transition: {
                staggerChildren: 0.15,
              },
            },
          }}
          className="
            grid
            gap-8
            sm:grid-cols-2
            lg:grid-cols-3
          "
        >
          {filteredListings.map((listing) => (
            <motion.div
              key={listing.id}
              variants={{
                hidden: {
                  opacity: 0,
                  y: 60,
                },

                show: {
                  opacity: 1,
                  y: 0,
                },
              }}
              whileHover={{
                scale: 1.05,
              }}
              transition={{
                type: "spring",
                stiffness: 160,
              }}
            >
              <div className="group">

                <div
                  className="
                    relative
                    bg-white
                    rounded-3xl
                    p-7
                    border
                    border-gray-200
                    shadow-sm
                    hover:shadow-2xl
                    hover:-translate-y-2
                    transition
                    duration-300
                    overflow-hidden
                  "
                >

                  {/* Background animation */}

                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                    }}
                    className="
                      absolute
                      inset-0
                      bg-indigo-50
                      opacity-0
                      group-hover:opacity-100
                      transition
                    "
                  />

                  <div className="relative z-10">

                    {/* Icon */}

                    <motion.div
                      animate={{
                        y: [0, -8, 0],
                        rotate: [0, 3, -3, 0],
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                      }}
                      className="
                        w-14
                        h-14
                        mb-4
                        rounded-full
                        bg-indigo-100
                        flex
                        items-center
                        justify-center
                      "
                    >
                      <Icon
                        size={22}
                        className="text-indigo-600"
                      />
                    </motion.div>

                    {/* Name */}

                    <h3
                      className="
                        text-xl
                        font-semibold
                        text-gray-900
                        group-hover:text-indigo-600
                        transition
                      "
                    >
                      {listing.name}
                    </h3>

                    {/* Address */}

                    <div
                      className="
                        flex
                        items-center
                        gap-2
                        text-gray-500
                        mt-2
                        text-sm
                      "
                    >
                      <MapPin size={16} />

                      {listing.address}
                    </div>

                    {/* Rating */}

                    <motion.div
                      animate={{
                        y: [0, -4, 0],
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                      }}
                      className="
                        mt-5
                        inline-flex
                        items-center
                        gap-1
                        bg-yellow-100
                        text-yellow-700
                        px-3
                        py-1
                        rounded-full
                        text-sm
                        font-medium
                      "
                    >
                      <Star size={14} />

                      {listing.rating}
                    </motion.div>

                    {/* Food Type */}

                    {isFoodCategory &&
                      listing.foodType &&
                      listing.foodType !==
                        "Not Applicable" && (
                        <div className="mt-3">
                          <span
                            className="
                              inline-block
                              bg-green-100
                              text-green-700
                              px-3
                              py-1
                              rounded-full
                              text-xs
                              font-medium
                            "
                          >
                            {listing.foodType}
                          </span>
                        </div>
                      )}

                    {/* Details */}

                    <Link
                      href={`/listing/${listing.slug}`}
                      className="
                        mt-6
                        inline-block
                        text-indigo-600
                        text-sm
                        font-medium
                        hover:underline
                      "
                    >
                      View Details →
                    </Link>

                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </>
  );
}