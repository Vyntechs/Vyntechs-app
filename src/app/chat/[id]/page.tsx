"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface Message {
  role: "user" | "ai";
  type: "text" | "image";
  content: string;
}

interface Chat {
  id: string;
  date: string;
  messages: Message[];
}

export default function ChatDetailPage() {
  const { id } = useParams();
  const [chat, setChat] = useState<Chat | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("chatHistory");
    if (stored) {
      const chats: Chat[] = JSON.parse(stored);
      const found = chats.find((c) => c.id === id);
      setChat(found || null);
    }
  }, [id]);

  if (!chat) return <p>Chat not found.</p>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Chat from {chat.date}</h2>
      {chat.messages.map((msg, index) => (
        <div
          key={index}
          className={`p-4 rounded-lg ${
            msg.role === "user" ? "bg-gray-700/70" : "bg-gray-800/70"
          }`}
        >
          <p className="font-semibold mb-2">
            {msg.role === "user" ? "You" : "AI"}
          </p>
          {msg.type === "image" ? (
            <img
              src={msg.content}
              alt="Uploaded"
              className="rounded-md max-w-full"
            />
          ) : (
            <p>{msg.content}</p>
          )}
        </div>
      ))}
    </div>
  );
}