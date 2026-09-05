"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Heart,
  MessageSquare,
  MapPin,
  Search,
  Mail,
  Settings,
  LogOut,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface UserSidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function UserSidebar({
  open,
  onClose,
}: UserSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const menuItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Favorites",
      href: "/dashboard/favorites",
      icon: Heart,
    },
    {
      name: "Messages",
      href: "/dashboard/messages",
      icon: MessageSquare,
    },
    {
      name: "My Listings",
      href: "/dashboard/listings",
      icon: MapPin,
    },
    {
      name: "Explore",
      href: "/",
      icon: Search,
    },
    {
      name: "Contact Us",
      href: "/contact",
      icon: Mail,
    },
    {
      name: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
    },
  ];

  function handleLogout() {
    document.cookie =
      "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

    document.cookie =
      "userToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

    document.cookie =
      "role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

    onClose();

    router.push("/login");
  }

  return (
    <>
      {/* =====================================
          Mobile Overlay
      ===================================== */}

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="
              fixed
              inset-0
              bg-black/40
              z-40
              md:hidden
            "
          />
        )}
      </AnimatePresence>

      {/* =====================================
          Sidebar
      ===================================== */}

      <motion.aside
        initial={false}
        animate={{
          x: open ? 0 : "-100%",
        }}
        transition={{
          duration: 0.25,
          ease: "easeInOut",
        }}
        className="
          fixed
          left-0
          top-0
          bottom-0
          z-50
          w-64
          bg-white
          border-r
          border-gray-200
          shadow-xl
          flex
          flex-col

        "
      >
        {/* =====================================
            Logo Header
        ===================================== */}

        <div
          className="
            h-17.5
            px-5
            border-b
            border-gray-200
            flex
            items-center
            justify-between
            shrink-0
          "
        >
          <Link
            href="/dashboard"
            onClick={onClose}
            className="
              text-2xl
              font-bold
              tracking-tight
            "
          >
            <span className="text-blue-600">
              Frisco
            </span>

            <span className="text-red-500">
              Desi
            </span>
          </Link>

          {/* Mobile Close */}

          <button
            type="button"
            onClick={onClose}
            className="
             
              w-9
              h-9
              rounded-lg
              flex
              items-center
              justify-center
              text-gray-500
              hover:text-gray-900
              hover:bg-gray-100
              transition
            "
            aria-label="Close menu"
          >
            <X size={21} />
          </button>
        </div>

        {/* =====================================
            Navigation
        ===================================== */}

        <nav
          className="
            flex-1
            px-3
            py-5
            overflow-y-auto
          "
        >
          <p
            className="
              px-3
              mb-3
              text-[11px]
              font-semibold
              uppercase
              tracking-wider
              text-gray-400
            "
          >
            Menu
          </p>

          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;

              const active =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname === item.href ||
                    pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className={`
                    group
                    flex
                    items-center
                    gap-3
                    px-3
                    py-3
                    rounded-xl
                    text-sm
                    font-medium
                    transition-all
                    duration-200

                    ${
                      active
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-600 hover:bg-gray-50 hover:text-blue-600"
                    }
                  `}
                >
                  <Icon
                    size={19}
                    strokeWidth={active ? 2.3 : 2}
                    className="
                      shrink-0
                      transition-transform
                      group-hover:scale-105
                    "
                  />

                  <span>
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* =====================================
            Bottom Section
        ===================================== */}

        <div
          className="
            p-3
            border-t
            border-gray-200
            shrink-0
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
              px-3
              py-3
              rounded-xl
              text-sm
              font-medium
              text-red-500
              hover:bg-red-50
              transition
              duration-200
            "
          >
            <LogOut size={19} />

            <span>
              Logout
            </span>
          </button>
        </div>
      </motion.aside>
    </>
  );
}