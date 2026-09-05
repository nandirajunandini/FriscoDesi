"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch(
        "/api/auth/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(
          data.error ||
            "Unable to process your request."
        );
        return;
      }

      setMessage(
        "If an account exists with this email, you will receive a password reset link shortly."
      );

      setEmail("");
    } catch (err) {
      console.error(
        "Forgot password error:",
        err
      );

      setError(
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">

      <div
        className="
          bg-white
          w-full
          max-w-md
          p-8
          rounded-xl
          shadow-md
        "
      >

        {/* =========================
            TITLE
        ========================= */}

        <h1 className="text-2xl font-semibold text-center text-gray-900">
          Forgot Password?
        </h1>

        <p className="text-sm text-gray-500 text-center mt-2 mb-7">
          Enter your email address and we'll
          send you a link to reset your password.
        </p>

        {/* =========================
            SUCCESS MESSAGE
        ========================= */}

        {message && (
          <div className="mb-5 rounded-lg bg-green-50 border border-green-200 px-4 py-3">
            <p className="text-sm text-green-700">
              {message}
            </p>
          </div>
        )}

        {/* =========================
            ERROR MESSAGE
        ========================= */}

        {error && (
          <div className="mb-5 rounded-lg bg-red-50 border border-red-200 px-4 py-3">
            <p className="text-sm text-red-600">
              {error}
            </p>
          </div>
        )}

        {/* =========================
            FORM
        ========================= */}

        <form
          onSubmit={handleSubmit}
        >

          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Email address
          </label>

          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            className="
              w-full
              border
              border-gray-300
              p-3
              rounded-lg
              outline-none
              focus:border-red-500
              focus:ring-2
              focus:ring-red-100
              transition
            "
            required
          />

          {/* =========================
              SUBMIT
          ========================= */}

          <button
            type="submit"
            disabled={loading}
            className="
              w-full
              mt-5
              bg-red-600
              text-white
              py-3
              rounded-lg
              font-medium
              hover:bg-red-700
              active:bg-red-800
              disabled:bg-red-300
              disabled:cursor-not-allowed
              transition
            "
          >
            {loading
              ? "Sending..."
              : "Send Reset Link"}
          </button>

        </form>

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
              transition
            "
          >
            ← Back to Login
          </Link>

        </div>

      </div>

    </div>
  );
}