import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import LayoutShell from "../components/LayoutShell"; // ✅ use the shell

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "VynTechs",
  description: "AI-powered automotive diagnostics and repair assistant",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-gray-950 text-white`}>
        {/* Wrap everything inside LayoutShell */}
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  );
}