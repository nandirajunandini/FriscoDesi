"use client";

import { motion } from "framer-motion";
import { Mail, LayoutDashboard, Settings } from "lucide-react";

export default function AdminSidebar() {
return (
<motion.div
initial={{ x: -200 }}
animate={{ x: 0 }}
className="h-screen w-64 bg-white shadow-xl p-6 flex flex-col gap-6"
>
<h1 className="text-2xl font-bold text-blue-600">
FriscoDesi
</h1>

  <nav className="flex flex-col gap-4">

    <a className="flex items-center gap-3 hover:text-blue-600 transition">
      <LayoutDashboard size={20}/>
      Dashboard
    </a>

    <a className="flex items-center gap-3 hover:text-blue-600 transition">
      <Mail size={20}/>
      Messages
    </a>

    <a className="flex items-center gap-3 hover:text-blue-600 transition">
      <Settings size={20}/>
      Settings
    </a>

  </nav>

</motion.div>

);
}