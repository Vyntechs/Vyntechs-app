// src/app/login/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import VynLock from "../../components/VynLock";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  // 🔒 Redirect if already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/chats", {
          method: "GET",
          credentials: "include", // ✅ ensure cookies are sent
        });
        if (res.ok) {
          const data = await res.json();
          if (data.ok !== false) {
            router.replace("/"); // ✅ send to root, not /home
          }
        }
      } catch (err) {
        console.warn("Auth check failed:", err);
      }
    };

    checkAuth();
  }, [router]);

  const handleUnlock = async (pattern: string) => {
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // ✅ so cookie is saved in Safari
        body: JSON.stringify({ email, pattern }),
      });

      const data = await res.json();

      if (data.ok) {
        setError("");
        router.replace("/"); // ✅ safer than push, replaces history
      } else {
        setError("❌ Incorrect email or pattern, try again.");
      }
    } catch (err) {
      console.error("Login failed:", err);
      setError("⚠️ Server error. Please try again later.");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black text-white">
      <div className="bg-gray-900/70 border border-gray-800 rounded-2xl shadow-2xl p-8 w-[420px] text-center">
        <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-gray-300 via-gray-400 to-gray-500 mb-6">
          VynLock Login
        </h1>

        {/* Email input */}
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 mb-4 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <p className="text-gray-400 mb-4">Draw your unlock pattern</p>

        {/* VynLock Component */}
        <div className="flex justify-center mb-4">
          <VynLock onPatternComplete={handleUnlock} />
        </div>

        {error && <p className="text-red-400 mt-2">{error}</p>}

        {/* 🔑 Register link */}
        <p className="mt-6 text-sm text-gray-500">
          Don’t have an account?{" "}
          <button
            onClick={() => router.push("/register")}
            className="text-indigo-400 hover:text-indigo-300 font-medium"
          >
            Create one
          </button>
        </p>
      </div>
    </div>
  );
}