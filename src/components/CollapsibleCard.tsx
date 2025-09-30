// src/components/CollapsibleCard.tsx
"use client";

import { useState, ReactNode, PropsWithChildren } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Clipboard } from "lucide-react";

interface CollapsibleCardProps {
  title: string;
  color?: string; // e.g. "text-red-500"
  defaultOpen?: boolean;
  icon?: ReactNode; // 👈 optional icon
  highlight?: "warning" | "info" | "success" | "error"; // 👈 priority styles
}

// ✅ Using PropsWithChildren fixes TS errors about children
export default function CollapsibleCard({
  title,
  children,
  color = "text-white",
  defaultOpen = false,
  icon,
  highlight,
}: PropsWithChildren<CollapsibleCardProps>) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const handleCopy = () => {
    let text = "";
    if (typeof children === "string") {
      text = children;
    } else if (Array.isArray(children)) {
      text = children.map((c) => (typeof c === "string" ? c : "")).join("\n");
    } else {
      text = (children as any)?.props?.children || "Copied content";
    }
    navigator.clipboard.writeText(text);
  };

  // 🔥 Highlight styles
  const borderColors = {
    warning: "border-yellow-500/60 shadow-yellow-500/20",
    info: "border-blue-500/60 shadow-blue-500/20",
    success: "border-green-500/60 shadow-green-500/20",
    error: "border-red-500/60 shadow-red-500/20",
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-gradient-to-br from-gray-800/90 to-gray-900/80 
                  backdrop-blur-md border rounded-xl shadow-lg overflow-hidden 
                  ${highlight ? borderColors[highlight] : "border-gray-700"}`}
    >
      {/* Header */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
        className="w-full flex justify-between items-center px-6 py-4 cursor-pointer 
                   hover:bg-gray-700/60 transition-colors text-left rounded-xl
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
      >
        <h3 className={`font-semibold text-lg flex items-center gap-2 ${color}`}>
          {icon && <span>{icon}</span>}
          {title}
        </h3>
        <div className="flex items-center space-x-3">
          {/* Copy Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCopy();
            }}
            className="p-1 hover:bg-gray-700 rounded transition-colors 
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
            title="Copy to clipboard"
          >
            <Clipboard size={16} />
          </button>

          {/* Expand / Collapse Icon */}
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.25 }}
          >
            <ChevronDown size={20} />
          </motion.div>
        </div>
      </div>

      {/* Body */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="px-6 pb-6 pt-2 text-sm text-gray-200 space-y-3 leading-relaxed"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}