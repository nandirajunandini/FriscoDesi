"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface NavbarProps {
  isUserLoggedIn: boolean;
  isAdminLoggedIn: boolean;
}

export default function Navbar({
  isUserLoggedIn,
  isAdminLoggedIn,
}: NavbarProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  /* ================= USER LOGOUT ================= */
  const handleUserLogout = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
    });

    router.push("/");
    router.refresh();
  };

  /* ================= ADMIN LOGOUT ================= */
  const handleAdminLogout = async () => {
    await fetch("/api/admin/logout", {
      method: "POST",
    });

    router.push("/");
    router.refresh();
  };

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

          {/* Logo */}
          <Link href="/" className="text-xl font-bold text-indigo-600">
            FriscoDesi
          </Link>

          {/* Desktop Menu */}
          <nav className="hidden md:flex gap-6 items-center">

            {/* USER */}
            {isUserLoggedIn && (
              <>
                <Link href="/dashboard">Dashboard</Link>
                <Link href="/events">Events</Link>

                <button
                  onClick={handleUserLogout}
                  className="text-red-500 hover:text-red-600"
                >
                  Logout
                </button>
              </>
            )}

            {/* ADMIN */}
            {isAdminLoggedIn && (
              <>
                <Link href="/admin/messages">Admin Panel</Link>

                <button
                  onClick={handleAdminLogout}
                  className="text-red-500 hover:text-red-600"
                >
                  Logout
                </button>
              </>
            )}

            {/* PUBLIC */}
            {!isUserLoggedIn && !isAdminLoggedIn && (
              <>
                <Link href="/login">Login</Link>
                <Link
                  href="/register"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md"
                >
                  Register
                </Link>
              </>
            )}
          </nav>

          {/* Mobile Button */}
          <button
            className="md:hidden"
            onClick={() => setOpen(!open)}
          >
            ☰
          </button>
        </div>

        {/* Mobile Menu */}
        {open && (
          <div className="md:hidden bg-white border-t px-6 py-4 flex flex-col gap-4">

            {isUserLoggedIn && (
              <>
                <Link href="/dashboard">Dashboard</Link>
                <Link href="/events">Events</Link>
                <button
                  onClick={handleUserLogout}
                  className="text-red-500"
                >
                  Logout
                </button>
              </>
            )}

            {isAdminLoggedIn && (
              <>
                <Link href="/admin/messages">Admin Panel</Link>
                <button
                  onClick={handleAdminLogout}
                  className="text-red-500"
                >
                  Logout
                </button>
              </>
            )}

            {!isUserLoggedIn && !isAdminLoggedIn && (
              <>
                <Link href="/login">Login</Link>
                <Link href="/register">Register</Link>
              </>
            )}
          </div>
        )}
      </header>

      <div className="h-20"></div>
    </>
  );
}