"use client";
import { useState, useRef, useEffect } from "react";

interface VynLockProps {
  size?: number;
  onPatternComplete: (pattern: string) => void;
}

export default function VynLock({ size = 4, onPatternComplete }: VynLockProps) {
  const [pattern, setPattern] = useState<number[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [fingerPos, setFingerPos] = useState<{ x: number; y: number } | null>(
    null
  );
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const spacing = 80;
  const dotSize = 48;

  const getGridId = (index: number): number => {
    const row = Math.floor(index / size) + 1;
    const col = (index % size) + 1;
    return row * 10 + col;
  };

  const handleDotStart = (index: number) => {
    setIsDrawing(true);
    setPattern([index]);
    setFingerPos(null); // reset finger tracker
  };

  const handleDotEnter = (index: number) => {
    if (isDrawing && !pattern.includes(index)) {
      setPattern((prev) => [...prev, index]);
    }
  };

  const handleRelease = () => {
    if (isDrawing && pattern.length > 0) {
      const converted = pattern.map(getGridId).join("-");
      onPatternComplete(converted);
    }
    setIsDrawing(false);
    setPattern([]);
    setFingerPos(null);
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

  // 🔹 Track finger drag globally
  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => {
      if (!isDrawing || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const touch = e.touches[0];
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;

      setFingerPos({ x, y }); // live update finger pos for line

      const col = Math.floor((x / rect.width) * size);
      const row = Math.floor((y / rect.height) * size);
      const index = row * size + col;

      if (index >= 0 && index < size * size) handleDotEnter(index);
    };

    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("mouseup", handleRelease);
    window.addEventListener("touchend", handleRelease);

    return () => {
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("mouseup", handleRelease);
      window.removeEventListener("touchend", handleRelease);
    };
  }, [isDrawing, pattern]);

  return (
    <div className="relative select-none" ref={containerRef}>
      {/* SVG lines */}
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

        {/* 👆 Live finger line */}
        {isDrawing && fingerPos && pattern.length > 0 && (
          <line
            x1={getDotPosition(pattern[pattern.length - 1]).x}
            y1={getDotPosition(pattern[pattern.length - 1]).y}
            x2={fingerPos.x}
            y2={fingerPos.y}
            stroke="#60a5fa"
            strokeWidth="4"
            strokeDasharray="6 4"
            strokeLinecap="round"
          />
        )}
      </svg>

      {/* Dots */}
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
            className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-colors
              ${
                pattern.includes(i)
                  ? "bg-indigo-500 border-indigo-400"
                  : "bg-gray-800 border-gray-500 hover:border-indigo-400"
              }
            `}
            style={{ width: dotSize, height: dotSize }}
          />
        ))}
      </div>
    </div>
  );
}