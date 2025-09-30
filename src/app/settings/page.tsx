// src/app/settings/page.tsx
"use client";

import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
      router.push("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Settings</h2>
      <p className="mb-4">Configure your Auto Repair AI preferences below.</p>

      {/* Theme Section */}
      <div className="space-y-4">
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Theme</h3>
          <p>Toggle between Light and Dark mode (coming soon).</p>
        </div>

        {/* Logout Section */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Account</h3>
          <button
            onClick={handleLogout}
            className="mt-2 w-full py-2 rounded bg-red-600 hover:bg-red-700 text-white font-semibold"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}