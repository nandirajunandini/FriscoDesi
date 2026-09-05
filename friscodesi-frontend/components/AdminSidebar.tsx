"use client";

import { motion } from "framer-motion";
import {
  Mail,
  LayoutDashboard,
  Settings,
  Upload,
} from "lucide-react";
import Link from "next/link";

export default function AdminSidebar() {
  return (
    <motion.div
      initial={{ x: -200 }}
      animate={{ x: 0 }}
      className="h-screen w-64 bg-white shadow-xl p-6 flex flex-col gap-6"
    >
      {/* Logo */}

      <Link
        href="/admin"
        className="text-2xl font-bold text-blue-600"
      >
        FriscoDesi
      </Link>

      {/* Navigation */}

      <nav className="flex flex-col gap-4">

        {/* Dashboard */}

        <Link
          href="/admin"
          className="flex items-center gap-3 hover:text-blue-600 transition"
        >
          <LayoutDashboard size={20} />
          Dashboard
        </Link>

        {/* Messages */}

        <Link
          href="/admin/messages"
          className="flex items-center gap-3 hover:text-blue-600 transition"
        >
          <Mail size={20} />
          Messages
        </Link>

        {/* Import Businesses */}

        <Link
          href="/admin/import"
          className="flex items-center gap-3 hover:text-blue-600 transition"
        >
          <Upload size={20} />
          Import Businesses
        </Link>

        {/* Settings */}

        <Link
          href="/admin/settings"
          className="flex items-center gap-3 hover:text-blue-600 transition"
        >
          <Settings size={20} />
          Settings
        </Link>

      </nav>
    </motion.div>
  );
}