"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
const router = useRouter();

const [identifier, setIdentifier] = useState("");
const [password, setPassword] = useState("");
const [error, setError] = useState("");

const handleLogin = async (e: React.FormEvent) => {
e.preventDefault();
setError("");

try {
  const res = await fetch("http://localhost:1337/api/auth/local", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      identifier,
      password
    })
  });

  const data = await res.json();

  if (!res.ok) {
    setError("Invalid credentials");
    return;
  }

  const token = data.jwt;
  const user = data.user;

  // save token
  document.cookie = `token=${token}; path=/`;

  console.log("Logged in user:", user);

  /*
  Since Strapi login does not return role in v5,
  we route admin based on username or email.
  */

  if (user.username === "admin") {
    document.cookie = `role=Admin; path=/`;
    router.push("/admin/messages");
  } else {
    document.cookie = `role=User; path=/`;
    router.push("/dashboard");
  }

} catch (err) {
  console.error(err);
  setError("Login failed");
}

};

return (
<div className="flex items-center justify-center min-h-screen bg-gray-100">

  <form
    onSubmit={handleLogin}
    className="bg-white p-8 rounded-lg shadow-md w-96"
  >
    <h1 className="text-2xl font-semibold mb-4 text-center">
      Login
    </h1>

    {error && (
      <p className="text-red-500 text-sm mb-3">
        {error}
      </p>
    )}

    <input
      type="text"
      placeholder="Username or Email"
      value={identifier}
      onChange={(e) => setIdentifier(e.target.value)}
      className="w-full border p-2 rounded mb-3"
      required
    />

    <input
      type="password"
      placeholder="Password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      className="w-full border p-2 rounded mb-4"
      required
    />

    <button
      type="submit"
      className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
    >
      Login
    </button>
  </form>

</div>

);
}