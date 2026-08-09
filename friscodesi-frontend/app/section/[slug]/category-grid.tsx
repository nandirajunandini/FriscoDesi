"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Icon } from "@iconify/react";

interface Category {
  id: number;
  name: string;
  slug: string;
}

const iconMap: Record<string, string> = {
  // Residents
  food: "mdi:food",
  "house-stuff": "mdi:home-outline",
  "indian-stores": "mdi:shopping",
  medical: "mdi:hospital-box",
  "real-estate": "mdi:office-building",
  spirituality: "mdi:hands-pray",

  // Services
  maids: "mdi:broom",
  nanny: "mdi:baby-face-outline",
  cooks: "mdi:chef-hat",
  legal: "mdi:scale-balance",
  salon: "mdi:content-cut",
  mechanics: "mdi:car-wrench",
  financial: "mdi:bank",

  // Education
  colleges: "mdi:school",
  "education-in-us": "mdi:book-open-page-variant",
  "elementary-schools": "mdi:human-male-board",
  "middle-schools": "mdi:human-male-board",
  "high-schools": "mdi:human-male-board",
  fisd: "mdi:school-outline",
  "jobs-and-internships": "mdi:briefcase",
  "extracurricular-activities": "mdi:account-group",

  // Sports
  badminton: "game-icons:shuttlecock",
  basketball: "mdi:basketball",
  cricket: "game-icons:cricket-bat",
  soccer: "mdi:soccer",
  swimming: "mdi:swim",
  tennis: "mdi:tennis-ball",

  // Culture
  art: "mdi:palette",
  dance: "mdi:dance-ballroom",
  events: "mdi:calendar-star",
  festivals: "mdi:party-popper",
  music: "mdi:music",

  // Community Impact
  "animal-services": "mdi:paw",
  "frisco-city-and-governance": "mdi:city",
  organizations: "mdi:account-group",
  "senators-and-representatives": "mdi:gavel",
  volunteering: "mdi:hand-heart",
  voting: "mdi:vote",

  default: "mdi:apps",
};

export default function AnimatedCategoryGrid({
  categories,
}: {
  categories: Category[];
}) {
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
      className="grid gap-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
    >
      {categories.map((category) => {
        const icon = iconMap[category.slug] || iconMap.default;

        return (
          <motion.div
            key={category.id}
            variants={{
              hidden: {
                opacity: 0,
                y: 50,
              },
              show: {
                opacity: 1,
                y: 0,
              },
            }}
            whileHover={{
              scale: 1.06,
              y: -8,
            }}
            transition={{
              type: "spring",
              stiffness: 180,
            }}
          >
            <Link
              href={`/category/${category.slug}`}
              className="group relative bg-white rounded-3xl p-10 text-center border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
            >
              {/* Background Glow */}
              <motion.div
                animate={{
                  scale: [1, 1.08, 1],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                }}
                className="absolute inset-0 bg-red-100 opacity-0 group-hover:opacity-20 transition"
              />
              {/* Icon */}
              <div className="relative z-10 flex justify-center mb-6">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#FDE68A] shadow-md transition-all duration-300 group-hover:bg-[#FACC15] group-hover:scale-110">
                  <Icon
                    icon={icon}
                    width={42}
                    className="text-[#DC2626] transition-all duration-300 group-hover:scale-110"
                  />
                </div>
              </div>

              {/* Category Name */}
              <h3 className="relative z-10 text-xl font-bold text-gray-900 mb-3">
                {category.name}
              </h3>

              {/* Description */}
              <p className="relative z-10 text-gray-500 text-sm leading-6">
                Explore trusted businesses and services in this category.
              </p>

              {/* Explore Link */}
              <div className="relative z-10 mt-6">
                <span className="inline-flex items-center font-semibold text-[#DC2626] group-hover:translate-x-1 transition-transform duration-300">
                  Explore
                  <svg
                    className="ml-2 h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </span>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </motion.div>
  );
}