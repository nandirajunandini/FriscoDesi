"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(
        `${process.env.STRAPI_URL}/api/auth/local`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            identifier,
            password,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok || !data.jwt || !data.user) {
        setError("Invalid credentials");
        return;
      }

      const token = data.jwt;
      const user = data.user;

      console.log("Logged in user:", user);

      /* =========================
         SAVE AUTHENTICATION
      ========================= */

      document.cookie =
        `token=${token}; path=/`;

      document.cookie =
        `userToken=${token}; path=/`;

      /* =========================
         ADMIN LOGIN
      ========================= */

      if (user.username === "admin123") {
        document.cookie =
          "role=Admin; path=/";

        router.push("/admin/messages");

        return;
      }

      /* =========================
         NORMAL USER LOGIN
      ========================= */

      document.cookie =
        "role=User; path=/";

      /* =========================
         REDIRECT
      ========================= */

      const redirect =
        searchParams.get("redirect");

      if (
        redirect &&
        redirect.startsWith("/category/")
      ) {
        router.push(redirect);
        return;
      }

      /* =========================
         NORMAL DASHBOARD
      ========================= */

      router.push("/dashboard");

    } catch (err) {
      console.error(
        "Login error:",
        err
      );

      setError("Login failed");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">

      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-xl shadow-md w-full max-w-md"
      >

        {/* =========================
            LOGIN TITLE
        ========================= */}

        <h1 className="text-2xl font-semibold mb-2 text-center text-gray-900">
          Welcome Back
        </h1>

        <p className="text-sm text-gray-500 text-center mb-6">
          Sign in to your FriscoDesi account
        </p>

        {/* =========================
            ERROR
        ========================= */}

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3">
            <p className="text-red-600 text-sm">
              {error}
            </p>
          </div>
        )}

        {/* =========================
            USERNAME / EMAIL
        ========================= */}

        <div className="mb-4">

          <label
            htmlFor="identifier"
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            Username or Email
          </label>

          <input
            id="identifier"
            type="text"
            placeholder="Enter your username or email"
            value={identifier}
            onChange={(e) =>
              setIdentifier(e.target.value)
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

        </div>

        {/* =========================
            PASSWORD
        ========================= */}

        <div className="mb-2">

          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            Password
          </label>

          <div className="relative">

            <input
              id="password"
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              placeholder="Enter your password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              className="
                w-full
                border
                border-gray-300
                p-3
                pr-12
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
                SHOW / HIDE PASSWORD
            ========================= */}

            <button
              type="button"
              onClick={() =>
                setShowPassword(
                  !showPassword
                )
              }
              className="
                absolute
                right-3
                top-1/2
                -translate-y-1/2
                text-gray-500
                hover:text-gray-700
                transition
                p-1
              "
              aria-label={
                showPassword
                  ? "Hide password"
                  : "Show password"
              }
            >
              {showPassword ? (
                /* Eye Off */
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c1.875 0 3.63-.493 5.146-1.356M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.774 3.162 10.066 7.5a10.523 10.523 0 0 1-4.132 5.411M6.228 6.228 3 3m3.228 3.228 3.015 3.015m5.514 5.514L21 21M9.243 9.243a3.75 3.75 0 0 0 5.514 5.514M9.243 9.243 14.757 14.757"
                  />
                </svg>
              ) : (
                /* Eye */
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7Z"
                  />

                  <circle
                    cx="12"
                    cy="12"
                    r="3"
                  />
                </svg>
              )}
            </button>

          </div>

        </div>

        {/* =========================
            FORGOT PASSWORD
        ========================= */}

        <div className="flex justify-end mb-5">

          <Link
            href="/forgot-password"
            className="
              text-sm
              font-medium
              text-red-600
              hover:text-red-700
              hover:underline
              transition
            "
          >
            Forgot password?
          </Link>

        </div>

        {/* =========================
            LOGIN BUTTON
        ========================= */}

        <button
          type="submit"
          className="
            w-full
            bg-red-600
            text-white
            py-3
            rounded-lg
            font-medium
            hover:bg-red-700
            active:bg-red-800
            transition
            shadow-sm
          "
        >
          Login
        </button>

        {/* =========================
            REGISTER LINK
        ========================= */}

        <div className="mt-6 text-center text-sm text-gray-500">

          <span>
            New to FriscoDesi?{" "}
          </span>

          <Link
            href={
              searchParams.get("redirect")
                ? `/register?redirect=${encodeURIComponent(
                    searchParams.get("redirect")!
                  )}`
                : "/register"
            }
            className="
              font-semibold
              text-red-600
              hover:text-red-700
              hover:underline
              transition
            "
          >
            Create an account
          </Link>

        </div>

      </form>

    </div>
  );
}