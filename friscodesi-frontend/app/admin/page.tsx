"use client";

import Link from "next/link";
import {
  Mail,
  Upload,
  FolderOpen,
  ArrowRight,
  LayoutDashboard,
} from "lucide-react";
import AdminSidebar from "@/components/AdminSidebar";

export default function AdminDashboard() {
  return (
    <div className="flex min-h-screen bg-linear-to-br from-blue-50 to-purple-100">

      {/* =========================
          SIDEBAR
      ========================= */}

      <AdminSidebar />

      {/* =========================
          MAIN CONTENT
      ========================= */}

      <main className="flex-1 p-8 md:p-10">

        <div className="max-w-7xl mx-auto">

          {/* Header */}

          <div className="mb-10">

            <div className="flex items-center gap-3">

              <div className="bg-blue-600 text-white p-3 rounded-xl shadow">
                <LayoutDashboard size={26} />
              </div>

              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                  Admin Dashboard 👑
                </h1>

                <p className="text-gray-500 mt-1">
                  Manage your FriscoDesi community platform.
                </p>
              </div>

            </div>

          </div>


          {/* =========================
              STATISTICS
          ========================= */}

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">

            {/* Messages */}

            <Link
              href="/admin/messages"
              className="group bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100"
            >

              <div className="flex items-center justify-between">

                <div className="bg-blue-100 text-blue-600 p-4 rounded-xl">
                  <Mail size={26} />
                </div>

                <ArrowRight
                  className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition"
                  size={20}
                />

              </div>

              <h2 className="text-lg font-semibold text-gray-900 mt-5">
                Messages
              </h2>

              <p className="text-gray-500 text-sm mt-1">
                View and respond to community messages.
              </p>

            </Link>


            {/* Businesses */}

            <Link
              href="/admin/import"
              className="group bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100"
            >

              <div className="flex items-center justify-between">

                <div className="bg-green-100 text-green-600 p-4 rounded-xl">
                  <Upload size={26} />
                </div>

                <ArrowRight
                  className="text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition"
                  size={20}
                />

              </div>

              <h2 className="text-lg font-semibold text-gray-900 mt-5">
                Import Businesses
              </h2>

              <p className="text-gray-500 text-sm mt-1">
                Search and import businesses from Google.
              </p>

            </Link>


            {/* Categories */}

            <Link
              href="/"
              className="group bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100"
            >

              <div className="flex items-center justify-between">

                <div className="bg-purple-100 text-purple-600 p-4 rounded-xl">
                  <FolderOpen size={26} />
                </div>

                <ArrowRight
                  className="text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition"
                  size={20}
                />

              </div>

              <h2 className="text-lg font-semibold text-gray-900 mt-5">
                Categories
              </h2>

              <p className="text-gray-500 text-sm mt-1">
                Explore the categories available on FriscoDesi.
              </p>

            </Link>

          </div>


          {/* =========================
              QUICK ACTIONS
          ========================= */}

          <div className="bg-white rounded-2xl shadow-md p-8">

            <h2 className="text-2xl font-bold text-gray-900">
              Quick Actions
            </h2>

            <p className="text-gray-500 mt-1 mb-6">
              Quickly access the most commonly used admin features.
            </p>


            <div className="grid md:grid-cols-2 gap-4">

              <Link
                href="/admin/messages"
                className="flex items-center justify-between border border-gray-200 rounded-xl p-5 hover:border-blue-400 hover:bg-blue-50 transition"
              >

                <div className="flex items-center gap-4">

                  <div className="bg-blue-100 text-blue-600 p-3 rounded-lg">
                    <Mail size={22} />
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Manage Messages
                    </h3>

                    <p className="text-sm text-gray-500">
                      View, reply and manage messages.
                    </p>
                  </div>

                </div>

                <ArrowRight
                  size={20}
                  className="text-gray-400"
                />

              </Link>


              <Link
                href="/admin/import"
                className="flex items-center justify-between border border-gray-200 rounded-xl p-5 hover:border-green-400 hover:bg-green-50 transition"
              >

                <div className="flex items-center gap-4">

                  <div className="bg-green-100 text-green-600 p-3 rounded-lg">
                    <Upload size={22} />
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Import Business
                    </h3>

                    <p className="text-sm text-gray-500">
                      Add businesses to FriscoDesi.
                    </p>
                  </div>

                </div>

                <ArrowRight
                  size={20}
                  className="text-gray-400"
                />

              </Link>

            </div>

          </div>

        </div>

      </main>

    </div>
  );
}