"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ReactNode } from "react";

type Props = {
  icon: ReactNode;
  title: string;
  link: string;
};

export default function CategoryCard({
  icon,
  title,
  link,
}: Props) {
  return (
    <Link href={link} className="block">
      <motion.div
        initial={{
          opacity: 0,
          y: 30,
        }}
        whileInView={{
          opacity: 1,
          y: 0,
        }}
        viewport={{
          once: true,
        }}
        transition={{
          duration: 0.5,
        }}
        whileHover={{
          y: -8,
          scale: 1.03,
        }}
        className="
          group
          bg-white
          rounded-2xl
          border
          border-gray-100
          shadow-sm
          p-6
          flex
          flex-col
          items-center
          justify-center
          text-center
          cursor-pointer
          hover:shadow-xl
          hover:border-red-100
          transition-all
          duration-300
        "
      >
        {/* Icon */}

        <motion.div
          animate={{
            y: [0, -4, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 3,
            ease: "easeInOut",
          }}
          className="
            bg-blue-50
            group-hover:bg-red-50
            p-4
            rounded-full
            mb-4
            transition-colors
            duration-300
          "
        >
          <div className="text-blue-600 group-hover:text-red-500 transition-colors duration-300">
            {icon}
          </div>
        </motion.div>

        {/* Title */}

        <h3
          className="
            font-semibold
            text-gray-900
            group-hover:text-red-600
            transition-colors
            duration-300
          "
        >
          {title}
        </h3>

        {/* Explore */}

        <p
          className="
            text-sm
            text-gray-500
            mt-2
            group-hover:text-red-500
            transition-colors
            duration-300
          "
        >
          Explore →
        </p>
      </motion.div>
    </Link>
  );
}