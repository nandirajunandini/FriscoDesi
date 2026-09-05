"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Lottie from "lottie-react";
import { Icon } from "@iconify/react";

import homeAnim from "./animations/home.json";

interface Section {
  id: number;
  name: string;
  slug: string;
}

/* ================= SECTION ICONS ================= */

const sectionIcons: Record<string, string> = {
  residents: "mdi:home-city-outline",
  services: "mdi:briefcase-outline",
  sports: "mdi:trophy-outline",
  culture: "mdi:palette-outline",
  entertainment: "mdi:movie-open-outline",
  "students-education": "mdi:school-outline",
  travelers: "mdi:airplane",
  "community-impact": "mdi:leaf",
};

/* ================= CATEGORY ICONS ================= */

const categoryIcons: Record<string, string> = {
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
  mechanics: "mdi:wrench",
  financial: "mdi:bank",

  // Students & Education
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
  cricket: "mdi:cricket",
  soccer: "mdi:soccer",
  swimming: "mdi:swim",
  tennis: "mdi:tennis-ball",

  // Culture
  art: "mdi:palette",
  dance: "mdi:dance-ballroom",
  music: "mdi:music",
  events: "mdi:calendar-star",
  festivals: "mdi:party-popper",

  // Community Impact
  "animal-services": "mdi:paw",
  organizations: "mdi:account-group",
  "frisco-city-and-governance": "mdi:city",
  "senators-and-representatives": "mdi:gavel",
  volunteering: "mdi:hand-heart",
  voting: "mdi:vote",

  default: "mdi:apps",
};

export default function AnimatedSections({
  sections,
}: {
  sections: Section[];
}) {
  return (
    <div className="relative">

      {/* Floating Background */}

      <motion.div
        animate={{ x: [0, 80, 0], y: [0, -80, 0] }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -top-40 -left-40 w-125 h-125 bg-amber-100 rounded-full blur-3xl opacity-30"
      />

      <motion.div
        animate={{ x: [0, -80, 0], y: [0, 80, 0] }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -bottom-40 -right-40 w-125 h-125 bg-amber-100 rounded-full blur-3xl opacity-30"
      />

      <motion.div
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: {
            transition: {
              staggerChildren: 0.12,
            },
          },
        }}
        className="grid gap-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 relative z-10"
      >
                {sections.map((section) => {
          const icon =
            sectionIcons[section.slug] ||
            categoryIcons[section.slug] ||
            categoryIcons.default;

          return (
            <motion.div
              key={section.id}
              variants={{
                hidden: {
                  opacity: 0,
                  y: 80,
                  scale: 0.9,
                },
                show: {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                },
              }}
              transition={{
                type: "spring",
                stiffness: 120,
              }}
              whileHover={{
                y: -12,
                scale: 1.06,
              }}
              whileTap={{
                scale: 0.96,
              }}
            >
              <Link
                href={`/section/${section.slug}`}
                className="group relative block bg-linear-to-b from-white to-amber-50 rounded-3xl p-10 text-center border border-amber-100 shadow-md hover:shadow-2xl transition duration-300 overflow-hidden"
              >
                {/* Sweep Light */}
                <span
                  className="
                    absolute inset-0
                    bg-linear-to-r
                    from-transparent
                    via-white/40
                    to-transparent
                    opacity-0
                    group-hover:opacity-100
                    transition
                    duration-700
                    -translate-x-full
                    group-hover:translate-x-full
                  "
                />

                {/* Hover Glow */}
                <motion.div
                  animate={{
                    scale: [1, 1.15, 1],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                  }}
                  className="absolute inset-0 bg-amber-100 opacity-0 group-hover:opacity-40 transition"
                />

                {/* Icon */}
                <div
                  className="
                    w-20
                    h-20
                    mx-auto
                    mb-6
                    rounded-full
                    bg-amber-100
                    flex
                    items-center
                    justify-center
                    shadow-md
                    group-hover:bg-amber-200
                    transition
                    duration-300
                  "
                >
                  {section.slug === "residents" ? (
                    <Lottie
                      animationData={homeAnim}
                      loop
                      className="w-12 h-12"
                    />
                  ) : (
                    <Icon
                      icon={icon}
                      width={36}
                      className="text-red-600 group-hover:text-red-700 transition"
                    />
                  )}
                </div>

                {/* Title */}
                <h3 className="text-xl font-semibold text-gray-900 group-hover:text-red-600 transition">
                  {section.name}
                </h3>

                {/* Subtitle */}
                <p className="mt-3 text-sm text-gray-500 group-hover:text-red-600 transition">
                  Explore →
                </p>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}