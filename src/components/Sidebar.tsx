// src/components/Sidebar.tsx
"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Plus, ChevronDown, ChevronRight } from "lucide-react";
import Image from "next/image";

interface Chat {
  id: string;
  title: string | null;
  createdAt: string;
}

interface SidebarProps {
  onClose?: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(true);

  // 🔐 Check if logged in
  const checkLogin = async () => {
    try {
      const res = await fetch("/api/me", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });
      if (!res.ok) {
        setUserEmail(null);
        return;
      }
      const data = await res.json();
      setUserEmail(data.ok ? data.email || "Logged In" : null);
    } catch {
      setUserEmail(null);
    }
  };

  // 📡 Fetch chats
  const fetchChats = async () => {
    setLoading(true);
    setErr(null);

    try {
      const res = await fetch("/api/chats", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      if (!res.ok) {
        setErr("Failed to load chats");
        setChats([]);
        return;
      }

      const data = await res.json();
      if (data.ok && Array.isArray(data.chats)) {
        setChats(data.chats);
      } else {
        setErr("Unexpected response");
        setChats([]);
      }
    } catch (e) {
      console.error("🚨 Sidebar fetch error:", e);
      setErr("Network error");
      setChats([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkLogin();
  }, []);

  useEffect(() => {
    if (userEmail) {
      fetchChats();
    } else {
      setChats([]);
    }
  }, [userEmail, pathname]);

  const handleNewChat = () => {
    sessionStorage.removeItem("pendingPrompt");
    router.push("/diagnose");
    if (onClose) onClose();
  };

  return (
    <aside className="bg-gray-800 text-white flex flex-col h-full">
      {/* Header with Logo */}
      <div className="p-6 flex items-center justify-center border-b border-gray-700">
        <Image
          src="/vyntechs-logo.png" // ✅ correct path (in /public)
          alt="VynTechs Logo"
          width={160}
          height={50}
          className="object-contain"
          priority
        />
      </div>

      {/* Nav */}
      <div className="flex-grow overflow-y-auto px-4 pb-6 mt-6">
        <ul className="space-y-3">
          <li>
            <Link
              href="/"
              onClick={onClose}
              className="hover:text-indigo-400 transition-colors"
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              href="/settings"
              onClick={onClose}
              className="hover:text-indigo-400 transition-colors"
            >
              Settings
            </Link>
          </li>
          <li>
            <Link
              href="/tutorial"
              onClick={onClose}
              className="hover:text-indigo-400 transition-colors"
            >
              Tutorial
            </Link>
          </li>
        </ul>

        {/* History Section (only when logged in) */}
        {userEmail && (
          <div className="mt-10">
            <button
              onClick={() => setHistoryOpen(!historyOpen)}
              className="flex items-center justify-between text-sm text-gray-400 uppercase w-full hover:text-indigo-400"
            >
              History
              {historyOpen ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>

            <button
              onClick={handleNewChat}
              className="w-full mt-3 mb-3 px-2 py-2 flex items-center justify-center gap-2 text-sm rounded bg-indigo-600 hover:bg-indigo-700 font-medium transition-colors"
            >
              <Plus className="w-4 h-4" /> New Chat
            </button>

            {historyOpen && (
              <>
                {err && (
                  <p className="text-xs text-gray-500 px-2">
                    ⚠ Couldn’t load history
                  </p>
                )}
                {!err && chats.length === 0 && !loading && (
                  <p className="text-gray-500 text-xs px-2">No chats yet</p>
                )}
                {loading && (
                  <p className="text-xs text-gray-400 px-2">Loading…</p>
                )}
                {!loading && chats.length > 0 && (
                  <ul className="space-y-1 max-h-64 overflow-y-auto pr-1 custom-scroll">
                    {chats.map((chat) => {
                      const isActive = pathname === `/history/${chat.id}`;
                      return (
                        <li key={chat.id} className="truncate">
                          <Link
                            href={`/history/${chat.id}`}
                            onClick={onClose}
                            className={`block px-2 py-1 rounded truncate text-sm transition-colors ${
                              isActive
                                ? "bg-indigo-600 text-white font-semibold"
                                : "hover:bg-gray-700"
                            }`}
                            title={chat.title || "Untitled Chat"}
                          >
                            {chat.title || "Untitled Chat"}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}