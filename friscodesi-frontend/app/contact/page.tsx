"use client";

import { useState } from "react";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // 🚨 VERY IMPORTANT

    setLoading(true);
    setSuccess("");

    const res = await fetch("/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (res.ok) {
      setSuccess("Message sent successfully!");
      setForm({ name: "", email: "", message: "" });
    } else {
      setSuccess(data.error || "Something went wrong");
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-24">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow">

        <h1 className="text-2xl font-bold mb-6">
          Contact Us
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">

          <input
            type="text"
            placeholder="Your name"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
            className="w-full border rounded-lg p-3"
          />

          <input
            type="email"
            placeholder="Your email"
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
            className="w-full border rounded-lg p-3"
          />

          <textarea
            placeholder="Your message"
            rows={5}
            value={form.message}
            onChange={(e) =>
              setForm({ ...form, message: e.target.value })
            }
            className="w-full border rounded-lg p-3"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg"
          >
            {loading ? "Sending..." : "Send Message"}
          </button>

          {success && (
            <p className="text-center text-sm mt-4">
              {success}
            </p>
          )}

        </form>
      </div>
    </main>
  );
}