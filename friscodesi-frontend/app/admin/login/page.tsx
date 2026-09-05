"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const res = await fetch(
  `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/auth/local`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            identifier: email,
            password,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok || !data.jwt) {
        setError("Invalid admin credentials");
        return;
      }

      const user = data.user;

      console.log("Admin login user:", user);

      /*
       * Only allow the admin account.
       *
       * Your current admin account is:
       * username: admin123
       * email: admin@gmail.com
       */

      if (
        user.username !== "admin123" &&
        user.email !== "admin@gmail.com"
      ) {
        setError(
          "You do not have administrator access."
        );

        return;
      }

      /*
       * Save admin authentication separately
       * from normal user authentication.
       */

      document.cookie = `adminToken=${data.jwt}; path=/; SameSite=Lax`;

      /*
       * Remove any normal-user authentication
       * if it exists.
       */

      document.cookie =
        "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

      document.cookie =
        "role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

      /*
       * Go to Admin Messages after login.
       */

      router.push("/admin/messages");
      router.refresh();

    } catch (error) {
      console.error("Admin login error:", error);

      setError(
        "Unable to login. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-linear-to-br from-gray-100 to-blue-100 flex items-center justify-center px-6">

      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">
            <span className="text-gray-900">
              Frisco
            </span>
            <span className="text-red-600">
              Desi
            </span>
          </h1>

          <p className="text-gray-500 mt-2">
            Administrator Portal
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white p-8 rounded-2xl shadow-xl border">

          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
            Admin Login
          </h2>

          <p className="text-gray-500 text-sm text-center mb-6">
            Sign in to manage FriscoDesi
          </p>

          {error && (
            <div className="mb-5 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>

            {/* Email */}
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>

            <input
              type="email"
              placeholder="Admin email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              className="w-full border border-gray-300 px-4 py-3 rounded-lg mb-5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />

            {/* Password */}
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              className="w-full border border-gray-300 px-4 py-3 rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />

            {/* Login */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white py-3 rounded-lg font-semibold transition"
            >
              {loading
                ? "Signing in..."
                : "Admin Login"}
            </button>

          </form>

        </div>

        {/* Back */}
        <div className="text-center mt-6">
          <a
            href="/"
            className="text-sm text-gray-500 hover:text-blue-600"
          >
            ← Back to FriscoDesi
          </a>
        </div>

      </div>

    </main>
  );
}