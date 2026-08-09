"use client";

import { useEffect, useState } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import AdminHeader from "@/components/AdminHeader";
import MessageCard from "@/components/MessageCard";

export default function AdminMessages() {
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    const fetchMessages = async () => {
      const res = await fetch(
        "http://localhost:1337/api/contact-messages"
      );

      const data = await res.json();

      console.log("Messages:", data.data);

      setMessages(data.data);
    };

    fetchMessages();
  }, []);

  return (
    <div className="flex bg-gradient-to-br from-blue-50 to-purple-100 min-h-screen">
      <AdminSidebar />

      <div className="flex-1 p-10">
        <AdminHeader />

        <div className="grid md:grid-cols-2 gap-6">
          {messages.map((msg, index) => (
            <MessageCard
              key={msg.id}
              message={{
                id: msg.id,
                ...msg.attributes,
              }}
              index={index}
            />
          ))}
        </div>
      </div>
    </div>
  );
}