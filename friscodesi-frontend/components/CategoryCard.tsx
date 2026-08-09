"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

type Props = {
icon: ReactNode;
title: string;
link: string;
};

export default function CategoryCard({ icon, title, link }: Props) {

return (

<motion.div
  initial={{ opacity: 0, y: 40 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
  whileHover={{
    y: -10,
    scale: 1.05
  }}
  className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center justify-center cursor-pointer hover:shadow-xl transition"
>

  <motion.div
    animate={{ y: [0, -5, 0] }}
    transition={{
      repeat: Infinity,
      duration: 2
    }}
    whileHover={{
      scale: 1.2
    }}
    className="bg-blue-100 p-4 rounded-full mb-3"
  >
    {icon}
  </motion.div>

  <h3 className="font-semibold text-gray-800">{title}</h3>

  <p className="text-sm text-gray-500 mt-1">
    Explore →
  </p>

</motion.div>

);
}