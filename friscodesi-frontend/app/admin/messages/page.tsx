"use client";

import { useEffect, useState } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import AdminHeader from "@/components/AdminHeader";
import MessageCard from "@/components/MessageCard";

type Message = {
  id: number;
  documentId: string;
  name: string;
  email: string;
  message: string;
  messageStatus: "new" | "replied" | string;
  adminReply?: string | null;
  createdAt?: string;
};

export default function AdminMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMessages();
  }, []);

  async function fetchMessages() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(
        "http://localhost:1337/api/contact-messages?sort=createdAt:desc",
        {
          method: "GET",
          cache: "no-store",
        }
      );

      if (!res.ok) {
        throw new Error("Failed to fetch messages");
      }

      const data = await res.json();

      console.log("Messages from Strapi:", data.data);

      const formattedMessages: Message[] = (data.data || []).map(
        (item: any) => ({
          id: item.id,
          documentId: item.documentId,
          name: item.name || "",
          email: item.email || "",
          message: item.message || "",
          messageStatus: item.messageStatus || "new",
          adminReply: item.adminReply || null,
          createdAt: item.createdAt || "",
        })
      );

      setMessages(formattedMessages);
    } catch (error) {
      console.error("Error fetching messages:", error);

      setError(
        "Unable to load messages. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-linear-to-br from-blue-50 to-purple-100">
      
      {/* =========================
          SIDEBAR
      ========================= */}

      <AdminSidebar />

      {/* =========================
          MAIN CONTENT
      ========================= */}

      <main className="flex-1 p-6 sm:p-8 lg:p-10">

        {/* 
          AdminHeader already contains
          "Admin Messages 👑"
          
          Therefore we DO NOT add another h1 here.
        */}

        <AdminHeader />

        {/* =========================
            PAGE DESCRIPTION
        ========================= */}

        <div className="mx-auto mt-6 max-w-7xl">

          <div className="mb-6">
            <p className="text-sm text-gray-600">
              Manage messages received from the
              FriscoDesi community.
            </p>
          </div>

          {/* =========================
              ERROR
          ========================= */}

          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-5">
              <p className="text-sm font-medium text-red-700">
                {error}
              </p>

              <button
                type="button"
                onClick={fetchMessages}
                className="
                  mt-3
                  rounded-lg
                  bg-red-600
                  px-4
                  py-2
                  text-sm
                  font-medium
                  text-white
                  transition
                  hover:bg-red-700
                "
              >
                Try Again
              </button>
            </div>
          )}

          {/* =========================
              LOADING
          ========================= */}

          {loading && (
            <div className="rounded-2xl bg-white p-10 text-center shadow-md">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-indigo-600" />

              <p className="text-sm text-gray-500">
                Loading messages...
              </p>
            </div>
          )}

          {/* =========================
              NO MESSAGES
          ========================= */}

          {!loading &&
            !error &&
            messages.length === 0 && (
              <div className="rounded-2xl bg-white p-12 text-center shadow-md">

                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                  <svg
                    className="h-7 w-7 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 11.5a8.38 8.38 0 01-1.9 5.4A8.5 8.5 0 0112 20a8.38 8.38 0 01-3.9-.9L3 20l1.1-4.1A8.38 8.38 0 013 11.5 8.5 8.5 0 0112 3a8.5 8.5 0 019 8.5z"
                    />
                  </svg>
                </div>

                <h2 className="text-lg font-semibold text-gray-900">
                  No messages yet
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  There are no contact messages to display.
                </p>
              </div>
            )}

          {/* =========================
              MESSAGE GRID
          ========================= */}

          {!loading &&
            !error &&
            messages.length > 0 && (
              <div className="grid gap-6 md:grid-cols-2">

                {messages.map((message, index) => (
                  <MessageCard
                    key={
                      message.documentId ||
                      message.id
                    }
                    message={message}
                    index={index}
                  />
                ))}

              </div>
            )}

        </div>

      </main>
    </div>
  );
}