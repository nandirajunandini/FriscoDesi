"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ReplyPage() {
  const { documentId } = useParams();
  const router = useRouter();

  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(false);
  const [messageData, setMessageData] = useState<any>(null);

  // 🔥 Fetch correct message details
  useEffect(() => {
    const fetchMessage = async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/contact-messages/${documentId}`
      );
      const data = await res.json();
      setMessageData(data.data);
    };

    fetchMessage();
  }, [documentId]);

  const handleReply = async () => {
    if (!replyText) return;

    setLoading(true);

    const res = await fetch("/api/reply-message", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        documentId,
        userEmail: messageData.email, // ✅ automatically correct
        replyText,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (data.success) {
      alert("Reply sent successfully!");
      router.push("/admin/messages");
    } else {
      alert("Error sending reply");
    }
  };

  if (!messageData) return <p>Loading...</p>;

  return (
    <main className="min-h-screen bg-gray-50 p-10">
      <h1 className="text-2xl font-bold mb-6">Reply to Message</h1>

      <div className="mb-6 bg-white p-6 rounded-lg shadow">
        <p><strong>Name:</strong> {messageData.name}</p>
        <p><strong>Email:</strong> {messageData.email}</p>
        <p className="mt-4"><strong>Message:</strong></p>
        <p>{messageData.message}</p>
      </div>

      <textarea
        value={replyText}
        onChange={(e) => setReplyText(e.target.value)}
        placeholder="Type your reply..."
        className="w-full border rounded-lg p-4 mb-6"
        rows={6}
      />

      <button
        onClick={handleReply}
        disabled={loading}
        className="bg-indigo-600 text-white px-6 py-2 rounded-lg"
      >
        {loading ? "Sending..." : "Send Reply"}
      </button>
    </main>
  );
}