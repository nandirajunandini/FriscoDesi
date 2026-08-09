"use client";

import Link from "next/link";
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

  if (listings.length === 0) {
    return (
      <div className="bg-white p-12 rounded-3xl shadow-md text-center border border-gray-200">
        <p className="text-gray-500 text-lg">
          No listings available yet.
        </p>
      </div>
    );
  }


  return (
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
      className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
    >

      {listings.map((listing) => {

        const Icon = getIcon(categorySlug);


        return (
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
                className="relative bg-white rounded-3xl p-7 border border-gray-200
                shadow-sm hover:shadow-2xl hover:-translate-y-2
                transition duration-300 overflow-hidden"
              >

                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                  }}
                  className="absolute inset-0 bg-indigo-50 opacity-0 group-hover:opacity-100 transition"
                />


                <div className="relative z-10">

                  <motion.div
                    animate={{
                      y: [0, -8, 0],
                      rotate: [0, 3, -3, 0],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                    }}
                    className="w-14 h-14 mb-4 rounded-full bg-indigo-100 flex items-center justify-center"
                  >
                    <Icon size={22} className="text-indigo-600" />
                  </motion.div>


                  <h3 className="text-xl font-semibold text-gray-900 group-hover:text-indigo-600 transition">
                    {listing.name}
                  </h3>


                  <div className="flex items-center gap-2 text-gray-500 mt-2 text-sm">
                    <MapPin size={16} />
                    {listing.address}
                  </div>


                  <motion.div
                    animate={{
                      y: [0, -4, 0],
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                    }}
                    className="mt-5 inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    <Star size={14} />
                    {listing.rating}
                  </motion.div>


                  <Link
                    href={`/listing/${listing.slug}`}
                    className="mt-6 inline-block text-indigo-600 text-sm font-medium hover:underline"
                  >
                    View Details →
                  </Link>

                </div>

              </div>

            </div>

          </motion.div>
        );
      })}

    </motion.div>
  );
}