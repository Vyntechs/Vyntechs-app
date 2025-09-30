// src/app/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function HomePage() {
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRun = () => {
    if (!inputValue.trim()) return;

    setLoading(true);

    // Save input so Diagnose page can pick it up
    sessionStorage.setItem("pendingPrompt", inputValue);

    // Redirect to diagnose page
    router.push("/diagnose");
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black text-white">
      <div className="w-full max-w-xl p-8 bg-gray-900/70 border border-gray-800 rounded-2xl shadow-2xl text-center">
        <h1 className="text-3xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
          VynTechs Auto Repair AI
        </h1>

        {/* Input */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Describe the issue (e.g., '2010 F150 5.4 - crank no start')"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleRun()}
            disabled={loading}
            className="flex-1 p-3 rounded-full bg-gray-900/70 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <motion.button
            onClick={handleRun}
            disabled={loading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            className="px-6 py-2 rounded-full font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-600 shadow-[0_0_12px_rgba(139,92,246,0.8)] disabled:opacity-50"
          >
            {loading ? "Loading..." : "Run"}
          </motion.button>
        </div>

        <p className="mt-6 text-sm text-gray-400">
          Or check your{" "}
          <a
            href="/history"
            className="text-indigo-400 hover:text-indigo-300 font-medium"
          >
            chat history
          </a>
        </p>
      </div>
    </div>
  );
}