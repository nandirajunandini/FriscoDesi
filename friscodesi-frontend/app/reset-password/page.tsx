"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const code = searchParams.get("code");

  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showPasswordConfirmation, setShowPasswordConfirmation] =
    useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!code) {
      setError(
        "This password reset link is invalid or incomplete."
      );
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must be at least 6 characters long."
      );
      return;
    }

    if (password !== passwordConfirmation) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        "/api/auth/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code,
            password,
            passwordConfirmation,
          }),
        }
      );

      let data: any = {};

      try {
        data = await res.json();
      } catch {
        data = {};
      }

      if (!res.ok) {
        setError(
          data?.error ||
            "Unable to reset your password. The reset link may have expired."
        );
        return;
      }

      setMessage(
        "Your password has been reset successfully. Redirecting to login..."
      );

      setPassword("");
      setPasswordConfirmation("");

      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (error) {
      console.error(
        "Reset password error:",
        error
      );

      setError(
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">

      <div
        className="
          w-full
          max-w-md
          rounded-xl
          bg-white
          p-8
          shadow-md
        "
      >

        {/* =========================
            TITLE
        ========================= */}

        <h1 className="text-2xl font-semibold text-center text-gray-900">
          Reset Password
        </h1>

        <p className="mt-2 mb-7 text-center text-sm text-gray-500">
          Enter your new password below.
        </p>


        {/* =========================
            ERROR
        ========================= */}

        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm text-red-600">
              {error}
            </p>
          </div>
        )}


        {/* =========================
            SUCCESS
        ========================= */}

        {message && (
          <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3">
            <p className="text-sm text-green-700">
              {message}
            </p>
          </div>
        )}


        {/* =========================
            NO CODE
        ========================= */}

        {!code ? (
          <div className="text-center">

            <p className="mb-5 text-sm text-gray-600">
              This password reset link is invalid or
              has expired.
            </p>

            <Link
              href="/forgot-password"
              className="
                font-medium
                text-red-600
                hover:text-red-700
                hover:underline
              "
            >
              Request a new reset link
            </Link>

          </div>
        ) : (

          /* =========================
             RESET FORM
          ========================= */

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* =========================
                NEW PASSWORD
            ========================= */}

            <div>

              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                New Password
              </label>

              <div className="relative">

                <input
                  id="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  disabled={loading}
                  className="
                    w-full
                    rounded-lg
                    border
                    border-gray-300
                    bg-white
                    px-4
                    py-3
                    pr-12
                    text-gray-900
                    outline-none
                    transition
                    placeholder:text-gray-400
                    focus:border-red-500
                    focus:ring-2
                    focus:ring-red-100
                    disabled:cursor-not-allowed
                    disabled:bg-gray-100
                  "
                  required
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  className="
                    absolute
                    right-3
                    top-1/2
                    -translate-y-1/2
                    rounded-md
                    p-1.5
                    text-gray-400
                    hover:bg-gray-100
                    hover:text-gray-600
                  "
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? "🙈" : "👁"}
                </button>

              </div>

              <p className="mt-1.5 text-xs text-gray-400">
                Password must be at least 6 characters.
              </p>

            </div>


            {/* =========================
                CONFIRM PASSWORD
            ========================= */}

            <div>

              <label
                htmlFor="passwordConfirmation"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Confirm Password
              </label>

              <div className="relative">

                <input
                  id="passwordConfirmation"
                  type={
                    showPasswordConfirmation
                      ? "text"
                      : "password"
                  }
                  placeholder="Confirm new password"
                  value={passwordConfirmation}
                  onChange={(e) => {
                    setPasswordConfirmation(
                      e.target.value
                    );
                    setError("");
                  }}
                  disabled={loading}
                  className="
                    w-full
                    rounded-lg
                    border
                    border-gray-300
                    bg-white
                    px-4
                    py-3
                    pr-12
                    text-gray-900
                    outline-none
                    transition
                    placeholder:text-gray-400
                    focus:border-red-500
                    focus:ring-2
                    focus:ring-red-100
                    disabled:cursor-not-allowed
                    disabled:bg-gray-100
                  "
                  required
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPasswordConfirmation(
                      !showPasswordConfirmation
                    )
                  }
                  className="
                    absolute
                    right-3
                    top-1/2
                    -translate-y-1/2
                    rounded-md
                    p-1.5
                    text-gray-400
                    hover:bg-gray-100
                    hover:text-gray-600
                  "
                  aria-label={
                    showPasswordConfirmation
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPasswordConfirmation
                    ? "🙈"
                    : "👁"}
                </button>

              </div>

            </div>


            {/* =========================
                RESET BUTTON
            ========================= */}

            <button
              type="submit"
              disabled={loading}
              className="
                w-full
                rounded-lg
                bg-red-600
                py-3
                font-medium
                text-white
                transition
                hover:bg-red-700
                active:bg-red-800
                disabled:cursor-not-allowed
                disabled:bg-red-300
              "
            >
              {loading
                ? "Resetting..."
                : "Reset Password"}
            </button>

          </form>
        )}


        {/* =========================
            BACK TO LOGIN
        ========================= */}

        <div className="mt-6 text-center">

          <Link
            href="/login"
            className="
              text-sm
              font-medium
              text-red-600
              hover:text-red-700
              hover:underline
            "
          >
            ← Back to Login
          </Link>

        </div>

      </div>

    </div>
  );
}