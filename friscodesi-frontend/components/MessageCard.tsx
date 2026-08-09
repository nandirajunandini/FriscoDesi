"use client";

import { motion } from "framer-motion";

type Message = {
name: string;
email: string;
message: string;
};

type Props = {
message: Message;
index: number;
};

export default function MessageCard({ message, index }: Props) {

return (
<motion.div
initial={{ opacity: 0, y: 80 }}
animate={{ opacity: 1, y: 0 }}
transition={{
duration: 0.6,
delay: index * 0.2
}}
whileHover={{
scale: 1.08,
rotate: 1
}}
className="bg-white p-6 rounded-xl shadow-lg border cursor-pointer"
>

  <div className="flex justify-between">

    <div>
      <h2 className="text-lg font-semibold">
        {message.name}
      </h2>

      <p className="text-sm text-gray-500">
        {message.email}
      </p>
    </div>

    <span className="bg-yellow-300 text-yellow-900 px-3 py-1 rounded-full text-xs">
      NEW
    </span>

  </div>

  <p className="mt-4 text-gray-700">
    {message.message}
  </p>

  <button className="mt-4 text-blue-600 font-medium hover:underline">
    View & Reply →
  </button>

</motion.div>

);
}