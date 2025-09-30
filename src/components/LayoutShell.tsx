"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      {sidebarOpen && (
        <div className="w-64 transition-all duration-300">
          {/* ✅ onClose is now recognized in SidebarProps */}
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 p-6 overflow-y-auto transition-all duration-300">
        {/* Toggle button */}
        <button
          onClick={() => setSidebarOpen((prev) => !prev)}
          className="p-2 rounded-md bg-gray-800 text-white hover:bg-gray-700 mb-4"
        >
          {sidebarOpen ? "⟨ Hide" : "☰ Menu"}
        </button>

        <h2 className="text-3xl font-extrabold mb-6 bg-gradient-to-r from-gray-300 via-gray-400 to-gray-500 bg-clip-text text-transparent">
          VynTechs
        </h2>

        {children}
      </main>
    </div>
  );
}