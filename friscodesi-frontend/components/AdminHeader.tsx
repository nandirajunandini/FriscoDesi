"use client";

import { motion } from "framer-motion";
import { LogOut } from "lucide-react";

export default function AdminHeader() {
  const logout = () => {
    // Clear admin authentication
    document.cookie =
      "adminToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

    // Clear normal user authentication as well
    document.cookie =
      "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

    document.cookie =
      "userToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

    document.cookie =
      "role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

    // Go back to the public site
    window.location.href = "/";
  };

  return (
    <motion.div
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="flex justify-between items-center mb-8"
    >
      <h1 className="text-3xl font-bold">
        Admin Messages 👑
      </h1>

      <button
        onClick={logout}
        className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
      >
        <LogOut size={18} />
        Logout
      </button>
    </motion.div>
  );
}