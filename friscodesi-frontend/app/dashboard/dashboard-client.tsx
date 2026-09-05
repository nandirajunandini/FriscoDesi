"use client";

import { useEffect, useRef, useState } from "react";
import {
  Menu,
  Bell,
  Search,
  ChevronDown,
  User,
  Settings,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import UserSidebar from "@/components/UserSidebar";

interface Section {
  id: number;
  name: string;
  slug: string;
}

interface Listing {
  id: number;
  name: string;
  slug: string;
  address: string;
}

interface DashboardUser {
  id: number;
  username: string;
  email: string;
  role?: {
    name: string;
  };
}

interface DashboardClientProps {
  sections: Section[];
  featured: Listing[];
  isLoggedIn: boolean;
  user: DashboardUser | null;
  children: React.ReactNode;
}

export default function DashboardClient({
  sections,
  featured,
  isLoggedIn,
  user,
  children,
}: DashboardClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [profileOpen, setProfileOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);

  const router = useRouter();

  /* =====================================
     Close Profile Dropdown
     When clicking outside
  ===================================== */

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  /* =====================================
     User Information
  ===================================== */

  const displayName =
    user?.username?.trim() || "User";

  const displayEmail =
    user?.email || "Account";

  const userInitial =
    displayName.charAt(0).toUpperCase() || "U";

  /* =====================================
     Logout
  ===================================== */

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setProfileOpen(false);

      router.push("/login");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* =====================================
          Sidebar
      ===================================== */}

      <UserSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* =====================================
          Main Application
      ===================================== */}

      <div className="min-h-screen">

        {/* =====================================
            Top Header
        ===================================== */}

        <header
          className="
            h-17.5
            bg-white
            border-b
            border-gray-200
            sticky
            top-0
            z-30
            px-4
            sm:px-6
            lg:px-8
            flex
            items-center
          "
        >

          {/* =====================================
              Hamburger
          ===================================== */}

          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="
              w-10
              h-10
              rounded-lg
              flex
              items-center
              justify-center
              text-gray-600
              hover:bg-gray-100
              transition
              mr-3
            "
            aria-label="Open menu"
          >
            <Menu size={23} />
          </button>

          {/* =====================================
              Page Identity
          ===================================== */}

          <div className="min-w-0">

            <h1
              className="
                text-base
                sm:text-lg
                font-semibold
                text-gray-900
                leading-tight
              "
            >
              User Dashboard
            </h1>

            <p
              className="
                hidden
                sm:block
                text-xs
                text-gray-500
                mt-0.5
              "
            >
              Your FriscoDesi community
            </p>

          </div>

          {/* =====================================
              Right Header
          ===================================== */}

          <div
            className="
              ml-auto
              flex
              items-center
              gap-2
              sm:gap-4
            "
          >

            {/* =====================================
                Search
            ===================================== */}

            <div
              className="
                hidden
                lg:flex
                items-center
                w-56
                h-10
                rounded-xl
                bg-gray-50
                border
                border-gray-200
                px-3
                gap-2
              "
            >
              <Search
                size={17}
                className="text-gray-400"
              />

              <input
                type="text"
                placeholder="Search FriscoDesi..."
                className="
                  w-full
                  bg-transparent
                  outline-none
                  text-sm
                  text-gray-700
                  placeholder:text-gray-400
                "
              />
            </div>

            {/* =====================================
                Explore
            ===================================== */}

            <Link
              href="/"
              className="
                hidden
                sm:block
                text-sm
                font-medium
                text-gray-600
                hover:text-blue-600
                transition
              "
            >
              Explore
            </Link>

            {/* =====================================
                Notifications
            ===================================== */}

            {isLoggedIn && (
              <button
                type="button"
                className="
                  relative
                  w-10
                  h-10
                  rounded-lg
                  flex
                  items-center
                  justify-center
                  text-gray-500
                  hover:bg-gray-100
                  transition
                "
                aria-label="Notifications"
              >
                <Bell size={20} />

                {/* Notification Indicator */}

                <span
                  className="
                    absolute
                    top-2
                    right-2
                    w-2
                    h-2
                    rounded-full
                    bg-red-500
                    border-2
                    border-white
                  "
                />
              </button>
            )}

            {/* =====================================
                Divider
            ===================================== */}

            <div
              className="
                hidden
                sm:block
                h-8
                w-px
                bg-gray-200
              "
            />

            {/* =====================================
                User Profile
            ===================================== */}

            {isLoggedIn && (
              <div
                ref={profileRef}
                className="relative"
              >

                <button
                  type="button"
                  onClick={() =>
                    setProfileOpen((value) => !value)
                  }
                  className="
                    flex
                    items-center
                    gap-2
                    rounded-xl
                    px-1
                    py-1
                    hover:bg-gray-50
                    transition
                  "
                  aria-expanded={profileOpen}
                  aria-label="Open account menu"
                >

                  {/* Avatar */}

                  <div
                    className="
                      w-9
                      h-9
                      rounded-full
                      bg-blue-600
                      text-white
                      flex
                      items-center
                      justify-center
                      text-sm
                      font-semibold
                      shrink-0
                    "
                  >
                    {userInitial}
                  </div>

                  {/* User Name */}

                  <div
                    className="
                      hidden
                      xl:block
                      text-left
                      max-w-32.5
                    "
                  >

                    <p
                      className="
                        text-xs
                        font-semibold
                        text-gray-900
                        truncate
                      "
                    >
                      {displayName}
                    </p>

                    <p
                      className="
                        text-[11px]
                        text-gray-500
                        truncate
                      "
                    >
                      {displayEmail}
                    </p>

                  </div>

                  {/* Dropdown Arrow */}

                  <ChevronDown
                    size={15}
                    className={`
                      hidden
                      xl:block
                      text-gray-400
                      transition-transform
                      duration-200
                      ${
                        profileOpen
                          ? "rotate-180"
                          : ""
                      }
                    `}
                  />

                </button>

                {/* =====================================
                    Account Dropdown
                ===================================== */}

                {profileOpen && (
                  <div
                    className="
                      absolute
                      right-0
                      top-full
                      mt-2
                      w-64
                      overflow-hidden
                      rounded-2xl
                      border
                      border-gray-200
                      bg-white
                      shadow-xl
                      z-50
                    "
                  >

                    {/* =====================================
                        User Info
                    ===================================== */}

                    <div
                      className="
                        border-b
                        border-gray-100
                        px-4
                        py-4
                      "
                    >

                      <div className="flex items-center gap-3">

                        {/* Avatar */}

                        <div
                          className="
                            w-11
                            h-11
                            rounded-full
                            bg-blue-600
                            text-white
                            flex
                            items-center
                            justify-center
                            font-semibold
                            shrink-0
                          "
                        >
                          {userInitial}
                        </div>

                        {/* User Details */}

                        <div className="min-w-0">

                          <p
                            className="
                              font-semibold
                              text-gray-900
                              truncate
                            "
                          >
                            {displayName}
                          </p>

                          <p
                            className="
                              mt-0.5
                              text-xs
                              text-gray-500
                              truncate
                            "
                          >
                            {displayEmail}
                          </p>

                        </div>

                      </div>

                    </div>

                    {/* =====================================
                        Account Menu
                    ===================================== */}

                    <div className="p-2">

                      {/* My Profile */}

                      <Link
                        href="/dashboard/profile"
                        onClick={() =>
                          setProfileOpen(false)
                        }
                        className="
                          flex
                          items-center
                          gap-3
                          rounded-xl
                          px-3
                          py-2.5
                          text-sm
                          text-gray-700
                          hover:bg-gray-50
                          transition
                        "
                      >
                        <User
                          size={17}
                          className="text-gray-500"
                        />

                        <span>
                          My Profile
                        </span>
                      </Link>

                      {/* Settings */}

                      <Link
                        href="/dashboard/settings"
                        onClick={() =>
                          setProfileOpen(false)
                        }
                        className="
                          flex
                          items-center
                          gap-3
                          rounded-xl
                          px-3
                          py-2.5
                          text-sm
                          text-gray-700
                          hover:bg-gray-50
                          transition
                        "
                      >
                        <Settings
                          size={17}
                          className="text-gray-500"
                        />

                        <span>
                          Settings
                        </span>
                      </Link>

                    </div>

                    {/* =====================================
                        Logout
                    ===================================== */}

                    <div
                      className="
                        border-t
                        border-gray-100
                        p-2
                      "
                    >

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="
                          w-full
                          flex
                          items-center
                          gap-3
                          rounded-xl
                          px-3
                          py-2.5
                          text-sm
                          text-red-600
                          hover:bg-red-50
                          transition
                        "
                      >
                        <LogOut size={17} />

                        <span>
                          Logout
                        </span>
                      </button>

                    </div>

                  </div>
                )}

              </div>
            )}

          </div>

        </header>

        {/* =====================================
            Page Content
        ===================================== */}

        <main>
          {children}
        </main>

      </div>

    </div>
  );
}