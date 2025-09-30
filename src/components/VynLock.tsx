"use client";
import { useState, useRef, useEffect } from "react";

interface VynLockProps {
  size?: number; // grid size (default 4x4)
  onPatternComplete: (pattern: string) => void;
}

export default function VynLock({ size = 4, onPatternComplete }: VynLockProps) {
  const [pattern, setPattern] = useState<number[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const spacing = 80; // px between centers
  const dotSize = 48; // px dot size

  // 🔹 Convert index → double-digit grid ID (11–44)
  const getGridId = (index: number): number => {
    const row = Math.floor(index / size) + 1; // 1–4
    const col = (index % size) + 1;           // 1–4
    return row * 10 + col;                    // e.g. row 1 col 1 → 11
  };

  const handleDotStart = (index: number) => {
    setIsDrawing(true);
    setPattern([index]);
  };

  const handleDotEnter = (index: number) => {
    if (isDrawing && !pattern.includes(index)) {
      setPattern((prev) => [...prev, index]);
    }
  };

  const handleRelease = () => {
    if (isDrawing && pattern.length > 0) {
      // Convert drawn pattern → double-digit IDs string
      const converted = pattern.map(getGridId).join("-");
      onPatternComplete(converted);
    }
    setIsDrawing(false);
    setPattern([]);
  };

  const grid = Array.from({ length: size * size }, (_, i) => i);

  const getDotPosition = (index: number) => {
    const row = Math.floor(index / size);
    const col = index % size;
    return {
      x: col * spacing + spacing / 2,
      y: row * spacing + spacing / 2,
    };
  };

  useEffect(() => {
    const handleMouseUp = () => handleRelease();
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchend", handleMouseUp);
    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, [isDrawing, pattern]);

  return (
    <div className="relative select-none">
      {/* SVG lines between dots */}
      <svg
        ref={svgRef}
        className="absolute top-0 left-0 pointer-events-none"
        width={size * spacing}
        height={size * spacing}
      >
        {pattern.map((dot, i) => {
          if (i === 0) return null;
          const prev = getDotPosition(pattern[i - 1]);
          const curr = getDotPosition(dot);
          return (
            <line
              key={i}
              x1={prev.x}
              y1={prev.y}
              x2={curr.x}
              y2={curr.y}
              stroke="#60a5fa"
              strokeWidth="6"
              strokeLinecap="round"
            />
          );
        })}
      </svg>

      {/* Grid dots */}
      <div
        className="grid gap-6"
        style={{
          gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
          width: size * spacing,
          height: size * spacing,
        }}
      >
        {grid.map((i) => (
          <div
            key={i}
            onMouseDown={() => handleDotStart(i)}
            onMouseEnter={() => handleDotEnter(i)}
            onTouchStart={() => handleDotStart(i)}
            onTouchMove={(e) => {
              const touch = e.touches[0];
              const rect = (e.target as HTMLElement).getBoundingClientRect();
              const x = touch.clientX - rect.left;
              const y = touch.clientY - rect.top;
              const col = Math.floor((x / rect.width) * size);
              const row = Math.floor((y / rect.height) * size);
              const index = row * size + col;
              if (index >= 0 && index < size * size) handleDotEnter(index);
            }}
            className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-colors
              ${
                pattern.includes(i)
                  ? "bg-indigo-500 border-indigo-400"
                  : "bg-gray-800 border-gray-500 hover:border-indigo-400"
              }
            `}
            style={{ width: dotSize, height: dotSize }}
          >
            {/* Optional: show ID inside dot for debugging */}
            {/* <span className="text-xs text-gray-400">{getGridId(i)}</span> */}
          </div>
        ))}
      </div>
    </div>
  );
}