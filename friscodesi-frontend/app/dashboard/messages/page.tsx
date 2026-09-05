"use client";

import { useCallback, useEffect, useState } from "react";

type Message = {
  id: number;
  documentId?: string;
  name: string;
  email: string;
  message: string;
  messageStatus: string;
  adminReply?: string;
  createdAt: string;
};

type ApiResponse = {
  success?: boolean;
  messages?: Message[];
  error?: string;
};

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchMessages = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const response = await fetch(
          "/api/dashboard/messages",
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
            cache: "no-store",
          }
        );

        let data: ApiResponse = {};

        try {
          data = await response.json();
        } catch {
          data = {};
        }

        if (!response.ok) {
          console.error(
            "Messages API error:",
            {
              status: response.status,
              data,
            }
          );

          setError(
            data?.error ||
              "Unable to load your messages. Please try again."
          );

          return;
        }

        if (!Array.isArray(data?.messages)) {
          console.error(
            "Invalid messages API response:",
            data
          );

          setError(
            "Unable to load your messages. Please try again."
          );

          return;
        }

        setMessages(data.messages);
      } catch (error) {
        console.error(
          "Fetch messages error:",
          error
        );

        setError(
          "Something went wrong while loading your messages."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  function formatDate(dateString: string) {
    if (!dateString) {
      return "";
    }

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  function getStatusLabel(status: string) {
    switch (status) {
      case "new":
        return "New";

      case "replied":
        return "Replied";

      case "closed":
        return "Closed";

      default:
        return status || "New";
    }
  }

  function getStatusClasses(status: string) {
    switch (status) {
      case "new":
        return "bg-blue-50 text-blue-700";

      case "replied":
        return "bg-green-50 text-green-700";

      case "closed":
        return "bg-gray-100 text-gray-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">

        {/* =========================================
            HEADER
        ========================================= */}

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              My Messages
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              View the messages you have sent to
              FriscoDesi and replies from our team.
            </p>
          </div>

          {!loading && !error && messages.length > 0 && (
            <button
              type="button"
              onClick={() => fetchMessages(true)}
              disabled={refreshing}
              className="
                inline-flex
                w-fit
                items-center
                justify-center
                rounded-lg
                border
                border-gray-300
                bg-white
                px-4
                py-2
                text-sm
                font-medium
                text-gray-700
                shadow-sm
                transition
                hover:bg-gray-50
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          )}

        </div>


        {/* =========================================
            LOADING
        ========================================= */}

        {loading && (
          <div
            className="
              rounded-xl
              border
              border-gray-200
              bg-white
              p-8
              text-center
              shadow-sm
            "
          >
            <div className="flex items-center justify-center gap-3">

              <div
                className="
                  h-5
                  w-5
                  animate-spin
                  rounded-full
                  border-2
                  border-gray-200
                  border-t-red-600
                "
              />

              <p className="text-sm text-gray-500">
                Loading your messages...
              </p>

            </div>
          </div>
        )}


        {/* =========================================
            ERROR
        ========================================= */}

        {!loading && error && (
          <div
            className="
              rounded-xl
              border
              border-red-200
              bg-red-50
              px-5
              py-5
            "
          >
            <p className="text-sm font-medium text-red-700">
              {error}
            </p>

            <button
              type="button"
              onClick={() => fetchMessages(false)}
              className="
                mt-4
                rounded-lg
                bg-red-600
                px-4
                py-2
                text-sm
                font-medium
                text-white
                transition
                hover:bg-red-700
                focus:outline-none
                focus:ring-2
                focus:ring-red-500
                focus:ring-offset-2
              "
            >
              Try Again
            </button>
          </div>
        )}


        {/* =========================================
            NO MESSAGES
        ========================================= */}

        {!loading &&
          !error &&
          messages.length === 0 && (
            <div
              className="
                rounded-xl
                border
                border-gray-200
                bg-white
                px-6
                py-12
                text-center
                shadow-sm
              "
            >
              <div
                className="
                  mx-auto
                  mb-4
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-full
                  bg-gray-100
                "
              >
                <svg
                  className="h-6 w-6 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="
                      M21 11.5a8.38 8.38 0 01-1.9 5.4
                      A8.5 8.5 0 0112 20
                      a8.38 8.38 0 01-3.9-.9
                      L3 20l1.1-4.1
                      A8.38 8.38 0 013 11.5
                      A8.5 8.5 0 0112 3
                      a8.5 8.5 0 019 8.5z
                    "
                  />
                </svg>
              </div>

              <h2 className="text-lg font-semibold text-gray-900">
                No messages yet
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                You haven't sent any messages to us yet.
              </p>
            </div>
          )}


        {/* =========================================
            MESSAGE LIST
        ========================================= */}

        {!loading &&
          !error &&
          messages.length > 0 && (
            <div className="space-y-5">

              {messages.map((item) => {
                const hasAdminReply =
                  typeof item.adminReply === "string" &&
                  item.adminReply.trim().length > 0;

                return (
                  <article
                    key={
                      item.documentId ||
                      item.id
                    }
                    className="
                      overflow-hidden
                      rounded-xl
                      border
                      border-gray-200
                      bg-white
                      shadow-sm
                      transition
                      hover:shadow-md
                    "
                  >

                    {/* =================================
                        MESSAGE HEADER
                    ================================= */}

                    <div className="p-5">

                      <div
                        className="
                          flex
                          flex-col
                          gap-3
                          sm:flex-row
                          sm:items-start
                          sm:justify-between
                        "
                      >

                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {item.name || "User"}
                          </p>

                          <p className="mt-0.5 text-xs text-gray-500">
                            {item.email}
                          </p>

                          <p className="mt-2 text-xs text-gray-400">
                            {formatDate(item.createdAt)}
                          </p>
                        </div>


                        {/* STATUS */}

                        <span
                          className={`
                            inline-flex
                            w-fit
                            shrink-0
                            rounded-full
                            px-3
                            py-1
                            text-xs
                            font-medium
                            ${getStatusClasses(
                              item.messageStatus
                            )}
                          `}
                        >
                          {getStatusLabel(
                            item.messageStatus
                          )}
                        </span>

                      </div>


                      {/* =================================
                          USER MESSAGE
                      ================================= */}

                      <div className="mt-5">

                        <p
                          className="
                            mb-2
                            text-xs
                            font-semibold
                            uppercase
                            tracking-wide
                            text-gray-500
                          "
                        >
                          Your Message
                        </p>

                        <div
                          className="
                            rounded-lg
                            bg-gray-50
                            p-4
                          "
                        >
                          <p
                            className="
                              whitespace-pre-wrap
                              text-sm
                              leading-6
                              text-gray-700
                            "
                          >
                            {item.message}
                          </p>
                        </div>

                      </div>


                      {/* =================================
                          ADMIN REPLY
                      ================================= */}

                      {hasAdminReply && (
                        <div className="mt-5">

                          <p
                            className="
                              mb-2
                              text-xs
                              font-semibold
                              uppercase
                              tracking-wide
                              text-gray-500
                            "
                          >
                            Reply from FriscoDesi
                          </p>

                          <div
                            className="
                              rounded-lg
                              border
                              border-green-100
                              bg-green-50
                              p-4
                            "
                          >
                            <p
                              className="
                                whitespace-pre-wrap
                                text-sm
                                leading-6
                                text-gray-700
                              "
                            >
                              {item.adminReply}
                            </p>
                          </div>

                        </div>
                      )}


                      {/* =================================
                          WAITING FOR REPLY
                      ================================= */}

                      {!hasAdminReply &&
                        item.messageStatus === "new" && (
                          <div
                            className="
                              mt-5
                              rounded-lg
                              border
                              border-gray-200
                              bg-gray-50
                              px-4
                              py-3
                            "
                          >
                            <p className="text-sm text-gray-500">
                              Our team hasn't replied to
                              this message yet.
                            </p>
                          </div>
                        )}

                    </div>

                  </article>
                );
              })}

            </div>
          )}

      </div>
    </main>
  );
}