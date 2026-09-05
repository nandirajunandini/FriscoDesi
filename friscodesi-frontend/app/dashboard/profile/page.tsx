"use client";

import { useEffect, useState } from "react";
import {
  User,
  Mail,
  Shield,
  ArrowLeft,
  Save,
} from "lucide-react";
import Link from "next/link";

interface UserData {
  id: number;
  username: string;
  email: string;
  role?: {
    name: string;
  };
}

export default function ProfilePage() {
  const [user, setUser] =
    useState<UserData | null>(null);

  const [username, setUsername] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  /* =========================================================
     Fetch User
  ========================================================= */

  async function fetchUser() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/user",
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        setError(
          data.error ||
            "Unable to load profile"
        );

        return;
      }

      setUser(data.user);

      setUsername(
        data.user?.username || ""
      );

      setEmail(
        data.user?.email || ""
      );
    } catch (error) {
      console.error(
        "Profile error:",
        error
      );

      setError(
        "Unable to load profile"
      );
    } finally {
      setLoading(false);
    }
  }

  /* =========================================================
     Load User When Page Opens
  ========================================================= */

  useEffect(() => {
    fetchUser();
  }, []);

  /* =========================================================
     Save Profile
  ========================================================= */

  async function handleSave(
    event: React.FormEvent
  ) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        "/api/user",
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            username,
            email,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        setError(
          data.error ||
            "Unable to update profile"
        );

        return;
      }

      /*
        Update the displayed user
        immediately.
      */

      setUser(data.user);

      setUsername(
        data.user?.username ||
          username
      );

      setEmail(
        data.user?.email ||
          email
      );

      setSuccess(
        "Profile updated successfully."
      );
    } catch (error) {
      console.error(
        "Update profile error:",
        error
      );

      setError(
        "Unable to update profile"
      );
    } finally {
      setSaving(false);
    }
  }

  /* =========================================================
     Loading
  ========================================================= */

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">

        <div className="
          mx-auto
          max-w-4xl
          px-6
          py-10
        ">

          <div className="
            h-8
            w-40
            rounded
            bg-gray-200
            animate-pulse
          " />

          <div className="
            mt-8
            h-64
            rounded-2xl
            bg-white
            border
            border-gray-200
            animate-pulse
          " />

        </div>

      </main>
    );
  }

  /* =========================================================
     Error Loading Profile
  ========================================================= */

  if (error && !user) {
    return (
      <main className="min-h-screen bg-gray-50">

        <div className="
          mx-auto
          max-w-2xl
          px-6
          py-16
        ">

          <div className="
            rounded-2xl
            border
            border-red-100
            bg-white
            p-8
            text-center
          ">

            <h1 className="
              text-xl
              font-semibold
              text-gray-900
            ">
              Unable to load profile
            </h1>

            <p className="
              mt-2
              text-gray-500
            ">
              {error}
            </p>

            <button
              type="button"
              onClick={fetchUser}
              className="
                mt-6
                rounded-xl
                bg-blue-600
                px-5
                py-2.5
                font-medium
                text-white
                transition
                hover:bg-blue-700
              "
            >
              Try Again
            </button>

          </div>

        </div>

      </main>
    );
  }

  /* =========================================================
     User Display
  ========================================================= */

  const displayName =
    username.trim() || "User";

  const initial =
    displayName
      .charAt(0)
      .toUpperCase() || "U";

  return (
    <main className="
      min-h-screen
      bg-linear-to-b
      from-gray-50
      via-white
      to-blue-50
    ">

      <div className="
        mx-auto
        max-w-4xl
        px-6
        py-10
      ">

        {/* =================================================
            Header
        ================================================= */}

        <div className="mb-8">

          <Link
            href="/dashboard"
            className="
              inline-flex
              items-center
              gap-2
              text-sm
              text-gray-500
              transition
              hover:text-blue-600
            "
          >
            <ArrowLeft size={16} />

            Back to Dashboard
          </Link>

          <div className="
            mt-6
            flex
            items-center
            gap-4
          ">

            <div className="
              flex
              h-14
              w-14
              items-center
              justify-center
              rounded-2xl
              bg-blue-600
              text-xl
              font-semibold
              text-white
            ">
              {initial}
            </div>

            <div>

              <h1 className="
                text-3xl
                font-bold
                text-gray-900
              ">
                My Profile
              </h1>

              <p className="
                mt-1
                text-gray-500
              ">
                Manage your FriscoDesi account information.
              </p>

            </div>

          </div>

        </div>

        {/* =================================================
            Profile Card
        ================================================= */}

        <form
          onSubmit={handleSave}
          className="
            overflow-hidden
            rounded-2xl
            border
            border-gray-200
            bg-white
            shadow-sm
          "
        >

          {/* =================================================
              Card Header
          ================================================= */}

          <div className="
            border-b
            border-gray-100
            px-6
            py-5
          ">

            <h2 className="
              text-lg
              font-semibold
              text-gray-900
            ">
              Account Information
            </h2>

            <p className="
              mt-1
              text-sm
              text-gray-500
            ">
              Update your username and email address.
            </p>

          </div>

          {/* =================================================
              Details
          ================================================= */}

          <div className="
            divide-y
            divide-gray-100
          ">

            {/* =================================================
                Username
            ================================================= */}

            <div className="
              flex
              items-start
              gap-4
              px-6
              py-5
            ">

              <div className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-blue-50
                text-blue-600
              ">
                <User size={19} />
              </div>

              <div className="w-full">

                <label
                  htmlFor="username"
                  className="
                    text-xs
                    font-medium
                    text-gray-500
                  "
                >
                  Username
                </label>

                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(event) =>
                    setUsername(
                      event.target.value
                    )
                  }
                  required
                  minLength={3}
                  className="
                    mt-1.5
                    w-full
                    rounded-xl
                    border
                    border-gray-200
                    bg-white
                    px-3
                    py-2.5
                    text-sm
                    text-gray-900
                    outline-none
                    transition
                    focus:border-blue-500
                    focus:ring-2
                    focus:ring-blue-100
                  "
                />

              </div>

            </div>

            {/* =================================================
                Email
            ================================================= */}

            <div className="
              flex
              items-start
              gap-4
              px-6
              py-5
            ">

              <div className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-blue-50
                text-blue-600
              ">
                <Mail size={19} />
              </div>

              <div className="w-full">

                <label
                  htmlFor="email"
                  className="
                    text-xs
                    font-medium
                    text-gray-500
                  "
                >
                  Email
                </label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(
                      event.target.value
                    )
                  }
                  required
                  className="
                    mt-1.5
                    w-full
                    rounded-xl
                    border
                    border-gray-200
                    bg-white
                    px-3
                    py-2.5
                    text-sm
                    text-gray-900
                    outline-none
                    transition
                    focus:border-blue-500
                    focus:ring-2
                    focus:ring-blue-100
                  "
                />

              </div>

            </div>

            {/* =================================================
                Role
            ================================================= */}

            <div className="
              flex
              items-center
              gap-4
              px-6
              py-5
            ">

              <div className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-purple-50
                text-purple-600
              ">
                <Shield size={19} />
              </div>

              <div>

                <p className="
                  text-xs
                  font-medium
                  text-gray-500
                ">
                  Role
                </p>

                <p className="
                  mt-1
                  font-medium
                  text-gray-900
                ">
                  {user?.role?.name || "User"}
                </p>

              </div>

            </div>

          </div>

          {/* =================================================
              Messages
          ================================================= */}

          {(error || success) && (
            <div className="
              border-t
              border-gray-100
              px-6
              py-4
            ">

              {error && (
                <p className="
                  rounded-xl
                  bg-red-50
                  px-4
                  py-3
                  text-sm
                  text-red-600
                ">
                  {error}
                </p>
              )}

              {success && (
                <p className="
                  rounded-xl
                  bg-green-50
                  px-4
                  py-3
                  text-sm
                  text-green-600
                ">
                  {success}
                </p>
              )}

            </div>
          )}

          {/* =================================================
              Save Button
          ================================================= */}

          <div className="
            flex
            justify-end
            border-t
            border-gray-100
            bg-gray-50/50
            px-6
            py-4
          ">

            <button
              type="submit"
              disabled={saving}
              className="
                inline-flex
                items-center
                gap-2
                rounded-xl
                bg-blue-600
                px-5
                py-2.5
                text-sm
                font-medium
                text-white
                transition
                hover:bg-blue-700
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >

              <Save size={17} />

              {saving
                ? "Saving..."
                : "Save Changes"}

            </button>

          </div>

        </form>

      </div>

    </main>
  );
}