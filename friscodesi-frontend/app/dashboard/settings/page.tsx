"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Lock,
  Shield,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";

interface UserData {
  id: number;
  username: string;
  email: string;
  role?: {
    name: string;
  };
}

export default function SettingsPage() {
  /* =========================================================
     User
  ========================================================= */

  const [user, setUser] =
    useState<UserData | null>(null);

  const [loadingUser, setLoadingUser] =
    useState(true);

  /* =========================================================
     Password
  ========================================================= */

  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  /* =========================================================
     Password Visibility
  ========================================================= */

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  /* =========================================================
     Status
  ========================================================= */

  const [saving, setSaving] =
    useState(false);

  const [success, setSuccess] =
    useState("");

  const [error, setError] =
    useState("");

  /* =========================================================
     Fetch Current User
  ========================================================= */

  useEffect(() => {
    async function fetchUser() {
      try {
        setLoadingUser(true);

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
          console.error(
            "Unable to fetch user:",
            data
          );

          return;
        }

        setUser(data.user);
      } catch (error) {
        console.error(
          "Fetch user error:",
          error
        );
      } finally {
        setLoadingUser(false);
      }
    }

    fetchUser();
  }, []);

  /* =========================================================
     Change Password
  ========================================================= */

  async function handleChangePassword(
    event: React.FormEvent
  ) {
    event.preventDefault();

    setSuccess("");
    setError("");

    /* =======================================================
       Validate Current Password
    ======================================================= */

    if (!currentPassword) {
      setError(
        "Please enter your current password."
      );
      return;
    }

    /* =======================================================
       Validate New Password
    ======================================================= */

    if (!newPassword) {
      setError(
        "Please enter a new password."
      );
      return;
    }

    if (newPassword.length < 6) {
      setError(
        "New password must be at least 6 characters."
      );
      return;
    }

    /* =======================================================
       Validate Confirmation
    ======================================================= */

    if (!confirmPassword) {
      setError(
        "Please confirm your new password."
      );
      return;
    }

    if (
      newPassword !==
      confirmPassword
    ) {
      setError(
        "New password and confirmation password do not match."
      );
      return;
    }

    /* =======================================================
       Send Request
    ======================================================= */

    try {
      setSaving(true);

      const response = await fetch(
        "/api/user/change-password",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            currentPassword,
            newPassword,
            passwordConfirmation:
              confirmPassword,
          }),
        }
      );

      const data =
        await response.json();

      /* =====================================================
         Handle Error
      ===================================================== */

      if (!response.ok) {
        setError(
          data.error ||
            "Failed to change password."
        );

        return;
      }

      /* =====================================================
         Success
      ===================================================== */

      setSuccess(
        "Your password has been changed successfully."
      );

      /* =====================================================
         Clear Form
      ===================================================== */

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      /* Reset password visibility */

      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);

    } catch (error) {
      console.error(
        "Change password error:",
        error
      );

      setError(
        "Unable to change password. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main
      className="
        min-h-screen
        bg-linear-to-b
        from-gray-50
        via-white
        to-blue-50
      "
    >
      <div
        className="
          mx-auto
          max-w-4xl
          px-6
          py-10
        "
      >

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
              hover:text-blue-600
              transition
            "
          >
            <ArrowLeft size={16} />

            Back to Dashboard
          </Link>

          <div
            className="
              mt-6
              flex
              items-center
              gap-4
            "
          >

            {/* Settings Icon */}

            <div
              className="
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-2xl
                bg-blue-50
                text-blue-600
              "
            >
              <Shield size={26} />
            </div>

            {/* Heading */}

            <div>

              <h1
                className="
                  text-3xl
                  font-bold
                  text-gray-900
                "
              >
                Settings
              </h1>

              <p
                className="
                  mt-1
                  text-gray-500
                "
              >
                Manage your FriscoDesi account settings.
              </p>

            </div>

          </div>

        </div>

        {/* =================================================
            Account Settings
        ================================================= */}

        <section
          className="
            mb-6
            overflow-hidden
            rounded-2xl
            border
            border-gray-200
            bg-white
            shadow-sm
          "
        >

          {/* Section Header */}

          <div
            className="
              border-b
              border-gray-100
              px-6
              py-5
            "
          >

            <div
              className="
                flex
                items-center
                gap-3
              "
            >

              <div
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  bg-blue-50
                  text-blue-600
                "
              >
                <Shield size={19} />
              </div>

              <div>

                <h2
                  className="
                    text-lg
                    font-semibold
                    text-gray-900
                  "
                >
                  Account Settings
                </h2>

                <p
                  className="
                    mt-1
                    text-sm
                    text-gray-500
                  "
                >
                  Manage your account information.
                </p>

              </div>

            </div>

          </div>

          {/* =================================================
              Account Information
          ================================================= */}

          <div className="divide-y divide-gray-100">

            {/* Username */}

            <div
              className="
                px-6
                py-5
              "
            >

              <p
                className="
                  text-xs
                  font-medium
                  text-gray-500
                "
              >
                Username
              </p>

              {loadingUser ? (
                <div
                  className="
                    mt-2
                    h-5
                    w-32
                    animate-pulse
                    rounded
                    bg-gray-200
                  "
                />
              ) : (
                <p
                  className="
                    mt-1
                    font-medium
                    text-gray-900
                  "
                >
                  {user?.username ||
                    "Not available"}
                </p>
              )}

              <p
                className="
                  mt-1
                  text-sm
                  text-gray-500
                "
              >
                Your registered username.
              </p>

            </div>

            {/* Email */}

            <div
              className="
                px-6
                py-5
              "
            >

              <p
                className="
                  text-xs
                  font-medium
                  text-gray-500
                "
              >
                Email
              </p>

              {loadingUser ? (
                <div
                  className="
                    mt-2
                    h-5
                    w-48
                    animate-pulse
                    rounded
                    bg-gray-200
                  "
                />
              ) : (
                <p
                  className="
                    mt-1
                    font-medium
                    text-gray-900
                  "
                >
                  {user?.email ||
                    "Not available"}
                </p>
              )}

              <p
                className="
                  mt-1
                  text-sm
                  text-gray-500
                "
              >
                Your registered email address.
              </p>

            </div>

          </div>

        </section>

        {/* =================================================
            Change Password
        ================================================= */}

        <section
          className="
            overflow-hidden
            rounded-2xl
            border
            border-gray-200
            bg-white
            shadow-sm
          "
        >

          {/* Section Header */}

          <div
            className="
              border-b
              border-gray-100
              px-6
              py-5
            "
          >

            <div
              className="
                flex
                items-center
                gap-3
              "
            >

              <div
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  bg-purple-50
                  text-purple-600
                "
              >
                <Lock size={19} />
              </div>

              <div>

                <h2
                  className="
                    text-lg
                    font-semibold
                    text-gray-900
                  "
                >
                  Change Password
                </h2>

                <p
                  className="
                    mt-1
                    text-sm
                    text-gray-500
                  "
                >
                  Update your account password.
                </p>

              </div>

            </div>

          </div>

          {/* =================================================
              Form
          ================================================= */}

          <form
            onSubmit={handleChangePassword}
            className="p-6"
          >

            {/* =================================================
                Success Message
            ================================================= */}

            {success && (
              <div
                className="
                  mb-5
                  flex
                  items-start
                  gap-3
                  rounded-xl
                  border
                  border-green-200
                  bg-green-50
                  px-4
                  py-3
                  text-sm
                  text-green-700
                "
              >

                <CheckCircle
                  size={18}
                  className="
                    mt-0.5
                    shrink-0
                  "
                />

                <span>
                  {success}
                </span>

              </div>
            )}

            {/* =================================================
                Error Message
            ================================================= */}

            {error && (
              <div
                className="
                  mb-5
                  flex
                  items-start
                  gap-3
                  rounded-xl
                  border
                  border-red-200
                  bg-red-50
                  px-4
                  py-3
                  text-sm
                  text-red-700
                "
              >

                <AlertCircle
                  size={18}
                  className="
                    mt-0.5
                    shrink-0
                  "
                />

                <span>
                  {error}
                </span>

              </div>
            )}

            <div className="space-y-5">

              {/* =================================================
                  Current Password
              ================================================= */}

              <div>

                <label
                  htmlFor="currentPassword"
                  className="
                    block
                    text-sm
                    font-medium
                    text-gray-700
                  "
                >
                  Current Password
                </label>

                <div className="relative mt-2">

                  <input
                    id="currentPassword"
                    type={
                      showCurrentPassword
                        ? "text"
                        : "password"
                    }
                    value={currentPassword}
                    onChange={(event) =>
                      setCurrentPassword(
                        event.target.value
                      )
                    }
                    placeholder="Enter your current password"
                    autoComplete="current-password"
                    className="
                      w-full
                      rounded-xl
                      border
                      border-gray-200
                      bg-white
                      px-4
                      py-3
                      pr-12
                      text-sm
                      text-gray-900
                      outline-none
                      transition
                      focus:border-blue-500
                      focus:ring-2
                      focus:ring-blue-100
                    "
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowCurrentPassword(
                        !showCurrentPassword
                      )
                    }
                    aria-label={
                      showCurrentPassword
                        ? "Hide current password"
                        : "Show current password"
                    }
                    className="
                      absolute
                      right-3
                      top-1/2
                      -translate-y-1/2
                      rounded-lg
                      p-1.5
                      text-gray-400
                      transition
                      hover:bg-gray-100
                      hover:text-gray-600
                    "
                  >
                    {showCurrentPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>

                </div>

              </div>

              {/* =================================================
                  New Password
              ================================================= */}

              <div>

                <label
                  htmlFor="newPassword"
                  className="
                    block
                    text-sm
                    font-medium
                    text-gray-700
                  "
                >
                  New Password
                </label>

                <div className="relative mt-2">

                  <input
                    id="newPassword"
                    type={
                      showNewPassword
                        ? "text"
                        : "password"
                    }
                    value={newPassword}
                    onChange={(event) =>
                      setNewPassword(
                        event.target.value
                      )
                    }
                    placeholder="Enter your new password"
                    autoComplete="new-password"
                    className="
                      w-full
                      rounded-xl
                      border
                      border-gray-200
                      bg-white
                      px-4
                      py-3
                      pr-12
                      text-sm
                      text-gray-900
                      outline-none
                      transition
                      focus:border-blue-500
                      focus:ring-2
                      focus:ring-blue-100
                    "
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowNewPassword(
                        !showNewPassword
                      )
                    }
                    aria-label={
                      showNewPassword
                        ? "Hide new password"
                        : "Show new password"
                    }
                    className="
                      absolute
                      right-3
                      top-1/2
                      -translate-y-1/2
                      rounded-lg
                      p-1.5
                      text-gray-400
                      transition
                      hover:bg-gray-100
                      hover:text-gray-600
                    "
                  >
                    {showNewPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>

                </div>

                <p
                  className="
                    mt-1.5
                    text-xs
                    text-gray-400
                  "
                >
                  Minimum 6 characters.
                </p>

              </div>

              {/* =================================================
                  Confirm Password
              ================================================= */}

              <div>

                <label
                  htmlFor="confirmPassword"
                  className="
                    block
                    text-sm
                    font-medium
                    text-gray-700
                  "
                >
                  Confirm New Password
                </label>

                <div className="relative mt-2">

                  <input
                    id="confirmPassword"
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(
                        event.target.value
                      )
                    }
                    placeholder="Confirm your new password"
                    autoComplete="new-password"
                    className="
                      w-full
                      rounded-xl
                      border
                      border-gray-200
                      bg-white
                      px-4
                      py-3
                      pr-12
                      text-sm
                      text-gray-900
                      outline-none
                      transition
                      focus:border-blue-500
                      focus:ring-2
                      focus:ring-blue-100
                    "
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        !showConfirmPassword
                      )
                    }
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirmation password"
                        : "Show confirmation password"
                    }
                    className="
                      absolute
                      right-3
                      top-1/2
                      -translate-y-1/2
                      rounded-lg
                      p-1.5
                      text-gray-400
                      transition
                      hover:bg-gray-100
                      hover:text-gray-600
                    "
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>

                </div>

              </div>

            </div>

            {/* =================================================
                Submit Button
            ================================================= */}

            <div className="mt-6">

              <button
                type="submit"
                disabled={saving}
                className="
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-blue-600
                  px-5
                  py-3
                  text-sm
                  font-semibold
                  text-white
                  shadow-sm
                  transition
                  hover:bg-blue-700
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >

                <Lock size={17} />

                {saving
                  ? "Changing Password..."
                  : "Change Password"}

              </button>

            </div>

          </form>

        </section>

      </div>
    </main>
  );
}