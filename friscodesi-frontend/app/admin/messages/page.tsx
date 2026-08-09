"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Message {
  id: number;
  documentId: string;
  name: string;
  email: string;
  message: string;
  messageStatus: string;
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchMessages() {
      try {
        const res = await fetch(
          "http://localhost:1337/api/contact-messages",
          {
            credentials: "include",
          }
        );

        if (res.status === 401) {
          router.push("/admin/login");
          return;
        }

        const data = await res.json();

        const formatted = data.data.map((item: any) => ({
          id: item.id,
          documentId: item.documentId,
          name: item.name,
          email: item.email,
          message: item.message,
          messageStatus: item.messageStatus,
        }));

        setMessages(formatted);
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchMessages();
  }, [router]);

  async function handleLogout() {
    await fetch("/api/admin/logout", {
      method: "POST",
    });

    router.push("/admin/login");
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse text-lg font-medium text-gray-600">
          Loading messages...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-10">
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold">Admin Messages 👑</h1>

        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg transition shadow"
        >
          Logout
        </button>
      </div>

      {/* Empty State */}
      {messages.length === 0 && (
        <div className="bg-white p-10 rounded-2xl shadow text-center">
          <p className="text-gray-600">No messages found.</p>
        </div>
      )}

      {/* Messages Grid */}
      <div className="grid gap-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className="bg-white p-6 rounded-2xl shadow-md border hover:shadow-xl transition"
          >
            <div className="flex justify-between items-start">
              <div>
                <h2 className="font-semibold text-lg">{msg.name}</h2>
                <p className="text-gray-500 text-sm">{msg.email}</p>
              </div>

              <span
                className={`px-3 py-1 text-xs rounded-full font-medium ${
                  msg.messageStatus === "replied"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {msg.messageStatus}
              </span>
            </div>

            <p className="mt-4 text-gray-700 leading-relaxed">
              {msg.message?.slice(0, 140)}...
            </p>

            <Link
              href={`/admin/messages/${msg.documentId}`}
              className="mt-4 inline-block text-indigo-600 font-medium hover:underline"
            >
              View & Reply →
            </Link>
          </div>
        ))}
      </div>
    </main>
  );
}