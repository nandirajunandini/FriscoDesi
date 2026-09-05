"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function AuthChoicePage() {
  const searchParams = useSearchParams();

  const redirect =
    searchParams.get("redirect") ||
    "/dashboard";

  const loginUrl =
    `/login?redirect=${encodeURIComponent(
      redirect
    )}`;

  const registerUrl =
    `/register?redirect=${encodeURIComponent(
      redirect
    )}`;

  return (
    <main className="min-h-screen bg-linear-to-br from-gray-50 via-white to-red-50 flex items-center justify-center px-6">

      <div className="w-full max-w-lg">

        {/* Card */}

        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 sm:p-10 text-center">

          {/* Logo */}

          <div className="mb-8">
            <span className="text-2xl font-bold text-gray-900">
              Frisco
            </span>
            <span className="text-2xl font-bold text-red-600">
              Desi
            </span>
          </div>

          {/* Heading */}

          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Welcome to FriscoDesi
          </h1>

          <p className="mt-4 text-gray-500 leading-6">
            Please login or create an account
            to explore our trusted community
            listings.
          </p>

          {/* New User */}

          <div className="mt-8 p-6 rounded-2xl bg-red-50 border border-red-100">

            <div className="text-3xl mb-3">
              🆕
            </div>

            <h2 className="text-xl font-semibold text-gray-900">
              New to FriscoDesi?
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Create your account and start
              exploring businesses and services.
            </p>

            <Link
              href={registerUrl}
              className="
                mt-5
                inline-flex
                w-full
                justify-center
                items-center
                bg-red-600
                text-white
                px-6
                py-3
                rounded-xl
                font-semibold
                shadow-lg
                shadow-red-600/20
                hover:bg-red-700
                transition
              "
            >
              Create an Account →
            </Link>

          </div>

          {/* Existing User */}

          <div className="mt-5 p-6 rounded-2xl bg-gray-50 border border-gray-200">

            <div className="text-3xl mb-3">
              👋
            </div>

            <h2 className="text-xl font-semibold text-gray-900">
              Already have an account?
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Welcome back! Login to continue
              exploring FriscoDesi.
            </p>

            <Link
              href={loginUrl}
              className="
                mt-5
                inline-flex
                w-full
                justify-center
                items-center
                border-2
                border-red-600
                text-red-600
                px-6
                py-3
                rounded-xl
                font-semibold
                hover:bg-red-600
                hover:text-white
                transition
              "
            >
              Login →
            </Link>

          </div>

          {/* Back */}

          <Link
            href="/"
            className="
              inline-block
              mt-7
              text-sm
              text-gray-500
              hover:text-red-600
              transition
            "
          >
            ← Back to Home
          </Link>

        </div>

      </div>

    </main>
  );
}