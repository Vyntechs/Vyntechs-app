// src/app/history/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Chat {
  id: string;
  title: string | null;
  createdAt: string;
}

export default function HistoryPage() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchChats() {
      try {
        const res = await fetch("/api/chats");
        const data = await res.json();
        if (res.ok && data.ok) {
          setChats(data.chats);
        } else {
          setError(data.error || "❌ Failed to load chats");
        }
      } catch (err) {
        console.error(err);
        setError("⚠️ Server error while loading chats");
      } finally {
        setLoading(false);
      }
    }
    fetchChats();
  }, []);

  if (loading) return <p className="text-gray-400">Loading...</p>;
  if (error) return <p className="text-red-400">{error}</p>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Chat History</h2>
      {chats.length === 0 ? (
        <p className="text-gray-400">No past chats yet.</p>
      ) : (
        <ul className="space-y-4">
          {chats.map((chat) => (
            <li
              key={chat.id}
              className="bg-gray-800 p-4 rounded-lg shadow hover:bg-gray-700 transition"
            >
              <Link href={`/history/${chat.id}`} className="block">
                <p className="text-sm text-gray-400">
                  {new Date(chat.createdAt).toLocaleString()}
                </p>
                <p className="mt-2 font-semibold text-indigo-300">
                  {chat.title || "Untitled Chat"}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}