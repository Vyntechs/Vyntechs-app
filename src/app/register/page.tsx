// src/app/register/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import VynLock from "../../components/VynLock";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (pattern: string) => {
    setError("");
    setStatus("⏳ Creating account...");
    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, phone, pattern }),
      });

      const data = await res.json();

      if (res.ok && data.ok) {
        setStatus("✅ Account created! Redirecting to login...");
        setTimeout(() => router.push("/login"), 1500);
      } else {
        setStatus("");
        setError(data.error || "❌ Failed to create account.");
      }
    } catch (err) {
      console.error(err);
      setStatus("");
      setError("⚠️ Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black text-white">
      <div className="bg-gray-900/70 border border-gray-800 rounded-2xl shadow-2xl p-8 w-[420px] text-center">
        <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-600 mb-6">
          Create Account
        </h1>

        {/* Email + Phone inputs */}
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          className="w-full p-3 mb-4 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
        />
        <input
          type="tel"
          placeholder="Enter your phone (optional)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          disabled={loading}
          className="w-full p-3 mb-4 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
        />

        <p className="text-gray-400 mb-4">
          {loading ? "⏳ Drawing disabled while processing..." : "Draw your unlock pattern"}
        </p>

        {/* VynLock Component */}
        <div className={`flex justify-center mb-4 ${loading ? "opacity-50 pointer-events-none" : ""}`}>
          <VynLock onPatternComplete={handleRegister} />
        </div>

        {/* Status & Errors */}
        {status && <p className="text-green-400 font-semibold mt-2">{status}</p>}
        {error && <p className="text-red-400 font-semibold mt-2">{error}</p>}

        <p className="mt-6 text-sm text-gray-500">
          Already have an account?{" "}
          <button
            onClick={() => router.push("/login")}
            className="text-indigo-400 hover:text-indigo-300 font-medium"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}