// src/components/Sidebar.tsx
import Link from "next/link";

export default function Sidebar() {
  return (
    <aside className="w-64 bg-gray-800 p-6 space-y-4">
      <h2 className="text-2xl font-bold">Auto Repair AI</h2>
      <nav className="space-y-2">
        <Link href="/" className="block hover:text-blue-400">
          Home
        </Link>
        <Link href="/tutorial" className="block hover:text-blue-400">
          Tutorial
        </Link>
        <Link href="/settings" className="block hover:text-blue-400">
          Settings
        </Link>
      </nav>
    </aside>
  );
}