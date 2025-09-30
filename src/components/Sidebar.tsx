// src/components/Sidebar.tsx
"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Menu,
  Plus,
  LogOut,
  ChevronDown,
  ChevronRight,
  X,
} from "lucide-react";

interface Chat {
  id: string;
  title: string | null;
  createdAt: string;
}

interface SidebarProps {
  onClose?: () => void; // ✅ optional close handler
}

export default function Sidebar({ onClose }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(true);
  const mounted = useRef(false);

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
    if (mounted.current) return;
    mounted.current = true;

    const storedEmail = localStorage.getItem("user_email") || null;
    setUserEmail(storedEmail);

    fetchChats();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
      localStorage.removeItem("user_email");
      router.push("/login");
    } catch (err) {
      console.error("🚨 Logout failed:", err);
    }
  };

  const handleNewChat = () => {
    sessionStorage.removeItem("pendingPrompt");
    router.push("/diagnose");
  };

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
    if (onClose) onClose(); // ✅ call parent close if provided
  };

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={toggleSidebar}
        className="absolute top-4 left-4 z-50 p-2 rounded bg-gray-800 hover:bg-gray-700 text-white"
      >
        {collapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`transition-all duration-300 ease-in-out 
          ${collapsed ? "w-0" : "w-64"} 
          bg-gray-800 text-white flex flex-col h-screen overflow-hidden`}
      >
        {/* Header */}
        <div className="p-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Auto Repair AI</h2>
        </div>

        {/* Nav + History */}
        <div className="flex-grow overflow-y-auto px-4">
          <ul className="space-y-2">
            <li>
              <Link href="/" className="hover:text-indigo-400 transition-colors">
                Home
              </Link>
            </li>
            <li>
              <Link
                href="/settings"
                className="hover:text-indigo-400 transition-colors"
              >
                Settings
              </Link>
            </li>
            <li>
              <Link
                href="/tutorial"
                className="hover:text-indigo-400 transition-colors"
              >
                Tutorial
              </Link>
            </li>
          </ul>

          <div className="mt-6">
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
              className="w-full mt-3 mb-2 px-2 py-2 flex items-center justify-center gap-2 text-sm rounded bg-indigo-600 hover:bg-indigo-700 font-medium transition-colors"
            >
              <Plus className="w-4 h-4" /> New Chat
            </button>

            {historyOpen && (
              <>
                {err && (
                  <div className="text-xs text-red-300">
                    Couldn’t load chats.{" "}
                    <Link
                      href="/history"
                      className="underline text-indigo-400 hover:text-indigo-300"
                    >
                      View Chat History →
                    </Link>
                  </div>
                )}

                {!err && chats.length === 0 && !loading && (
                  <p className="text-gray-500 text-xs px-2">No chats yet</p>
                )}

                {loading && (
                  <p className="text-xs text-gray-400">Loading…</p>
                )}

                {!loading && chats.length > 0 && (
                  <ul className="space-y-1 max-h-64 overflow-y-auto pr-1 custom-scroll">
                    {chats.map((chat) => {
                      const isActive = pathname === `/history/${chat.id}`;
                      return (
                        <li key={chat.id} className="truncate">
                          <Link
                            href={`/history/${chat.id}`}
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
                    <li className="mt-2">
                      <Link
                        href="/history"
                        className="block px-2 py-1 text-indigo-400 hover:text-indigo-300 text-sm font-medium"
                      >
                        View all history →
                      </Link>
                    </li>
                  </ul>
                )}
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700">
          {userEmail && (
            <p className="text-xs text-gray-400 mb-2 truncate">
              Logged in as{" "}
              <span className="text-gray-200 font-medium">{userEmail}</span>
            </p>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 rounded bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>
    </>
  );
}