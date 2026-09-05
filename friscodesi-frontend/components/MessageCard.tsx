"use client";

import Link from "next/link";
import { motion } from "framer-motion";

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

type Props = {
  message: Message;
  index: number;
};

export default function MessageCard({
  message,
  index,
}: Props) {
  const isReplied =
    message.messageStatus === "replied";

  function formatDate(dateString?: string) {
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

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 30,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.45,
        delay: Math.min(index * 0.08, 0.4),
      }}
      whileHover={{
        y: -3,
      }}
      className="
        rounded-2xl
        border
        border-gray-200
        bg-white
        p-6
        shadow-md
        transition-shadow
        hover:shadow-xl
      "
    >

      {/* =========================
          HEADER
      ========================= */}

      <div className="flex items-start justify-between gap-4">

        <div className="min-w-0">

          <h2 className="truncate text-lg font-semibold text-gray-900">
            {message.name || "Unknown User"}
          </h2>

          <p className="mt-1 truncate text-sm text-gray-500">
            {message.email || "No email"}
          </p>

        </div>


        {/* =========================
            STATUS
        ========================= */}

        <span
          className={`
            shrink-0
            rounded-full
            px-3
            py-1
            text-xs
            font-semibold
            uppercase
            tracking-wide
            ${
              isReplied
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-800"
            }
          `}
        >
          {isReplied ? "REPLIED" : "NEW"}
        </span>

      </div>


      {/* =========================
          DATE
      ========================= */}

      {message.createdAt && (
        <p className="mt-3 text-xs text-gray-400">
          {formatDate(message.createdAt)}
        </p>
      )}


      {/* =========================
          USER MESSAGE
      ========================= */}

      <div className="mt-5 rounded-xl bg-gray-50 p-4">

        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
          User Message
        </p>

        <p className="whitespace-pre-wrap wrap-break-word text-sm leading-6 text-gray-700">
          {message.message || "No message content."}
        </p>

      </div>


      {/* =========================
          ADMIN REPLY
      ========================= */}

      {isReplied &&
        message.adminReply && (
          <div className="mt-4 rounded-xl border border-green-100 bg-green-50 p-4">

            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-green-600">
              Admin Reply
            </p>

            <p className="whitespace-pre-wrap wrap-break-word text-sm leading-6 text-gray-700">
              {message.adminReply}
            </p>

          </div>
        )}


      {/* =========================
          ACTION
      ========================= */}

      <div className="mt-5">

        <Link
          href={`/admin/messages/${message.documentId}`}
          className="
            inline-flex
            items-center
            rounded-lg
            px-1
            py-1
            text-sm
            font-semibold
            text-indigo-600
            transition
            hover:text-indigo-800
            hover:underline
          "
        >
          {isReplied
            ? "View Conversation →"
            : "View & Reply →"}
        </Link>

      </div>

    </motion.div>
  );
}