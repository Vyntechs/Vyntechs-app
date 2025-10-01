// src/components/LayoutShell.tsx
"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-950">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out
          md:relative md:translate-x-0 md:flex
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col md:ml-64">
        {/* Mobile top bar */}
        <div className="md:hidden px-4 py-3 flex justify-between items-center 
                        bg-gray-900/70 backdrop-blur-md border-b border-gray-800 
                        sticky top-0 z-20 safe-top">
          <button
            onClick={() => setSidebarOpen((prev) => !prev)}
            className="px-3 py-2 rounded-xl bg-gray-800/70 hover:bg-gray-700/80 text-white 
                       font-medium text-sm transition-all"
          >
            {sidebarOpen ? "✕ Close" : "☰ Menu"}
          </button>
          <h2 className="text-lg font-bold bg-gradient-to-r from-gray-200 via-gray-300 to-gray-400 bg-clip-text text-transparent">
            VynTechs
          </h2>
        </div>

        {/* Main body */}
        <main className="flex-1 px-4 py-6 md:p-8 overflow-y-auto safe-bottom">
          <div className="max-w-5xl mx-auto w-full">
            {/* Desktop title */}
            <h2 className="hidden md:block text-3xl font-extrabold mb-6 
                           bg-gradient-to-r from-gray-300 via-gray-400 to-gray-500 
                           bg-clip-text text-transparent">
              VynTechs
            </h2>

            {children}
          </div>
        </main>
      </div>

      {/* Background overlay when sidebar is open on mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}