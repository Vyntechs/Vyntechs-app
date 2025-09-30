// src/app/diagnose/page.tsx
"use client";

import { useState, useEffect } from "react";
import CollapsibleCard from "../../components/CollapsibleCard";

interface Section {
  title: string;
  items: string[];
}

interface DiagnoseResponse {
  diagnoseData: Section[];
  repairData: Section[];
  verifyData: Section[];
  tsbData: Section[];
}

const safeSections = (arr: any): Section[] =>
  Array.isArray(arr) ? (arr as Section[]) : [];

const safeList = (arr: any): string[] =>
  Array.isArray(arr)
    ? (arr as unknown[]).filter((x) => typeof x === "string") as string[]
    : [];

export default function DiagnosePage() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DiagnoseResponse | null>(null);
  const [error, setError] = useState("");
  const [vehicleTitle, setVehicleTitle] = useState("");

  const handleSubmit = async (prompt?: string) => {
    const query = prompt ?? input;
    if (!query.trim()) return;

    setLoading(true);
    setError("");
    setData(null);

    try {
      const res = await fetch("/api/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: query }),
      });

      const result = await res.json();

      if (res.ok && result.ok) {
        const normalized: DiagnoseResponse = {
          diagnoseData: safeSections(result.data?.diagnoseData),
          repairData: safeSections(result.data?.repairData),
          verifyData: safeSections(result.data?.verifyData),
          tsbData: safeSections(result.data?.tsbData),
        };

        setData(normalized);
        setVehicleTitle(query);

        const chatRes = await fetch("/api/chats", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: query.slice(0, 40) + "...",
            messages: [
              { role: "user", content: query },
              { role: "assistant", content: normalized },
            ],
          }),
        });

        const saved = await chatRes.json();
        if (saved.ok && saved.chat) {
          window.dispatchEvent(new Event("chatUpdated"));
          window.location.href = `/history/${saved.chat.id}`;
        }
      } else {
        setError(result.error || "Failed to fetch diagnosis.");
      }
    } catch (err) {
      console.error(err);
      setError("⚠️ Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const pending = sessionStorage.getItem("pendingPrompt");
    if (pending) {
      sessionStorage.removeItem("pendingPrompt");
      setInput(pending);
      handleSubmit(pending);
    }
  }, []);

  return (
    <div className="space-y-6">
      {vehicleTitle && (
        <h2 className="text-2xl font-bold mb-2">{vehicleTitle}</h2>
      )}

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          className="flex-grow p-3 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe the issue (e.g., '2005 F250 crank no start')..."
          disabled={loading}
        />
        <button
          onClick={() => handleSubmit()}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? "Analyzing..." : "Run Diagnosis"}
        </button>
      </div>

      {error && (
        <div className="bg-red-800/40 text-red-300 p-3 rounded">{error}</div>
      )}

      {data && (
        <div className="space-y-4">
          {/* Vehicle / Theory (exclude Diagnostic Steps for now) */}
          {safeSections(data.diagnoseData)
            .filter(
              (section) =>
                section.title !== "Diagnostic Steps" &&
                section.title !== "Common Issues Seen" &&
                section.title !== "Common Mistakes"
            )
            .map((section, i) => (
              <CollapsibleCard
                key={`diag-${i}`}
                title={section.title}
                color="text-blue-300"
                defaultOpen={i === 0}
              >
                <ul className="list-disc list-inside space-y-1 text-gray-300">
                  {safeList(section.items).map((item, j) => (
                    <li key={j}>{item}</li>
                  ))}
                </ul>
              </CollapsibleCard>
            ))}

          {/* ✅ TSB Data before Diagnostic Steps */}
          {safeSections(data.tsbData).map((section, i) => (
            <CollapsibleCard
              key={`tsb-${i}`}
              title={section.title}
              color="text-yellow-300"
            >
              <ul className="list-disc list-inside space-y-1 text-gray-300">
                {safeList(section.items).map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ul>
            </CollapsibleCard>
          ))}

          {/* Diagnostic Steps */}
          {safeSections(data.diagnoseData)
            .filter((section) => section.title === "Diagnostic Steps")
            .map((section, i) => (
              <CollapsibleCard
                key={`diag-steps-${i}`}
                title={section.title}
                color="text-blue-300"
              >
                <ul className="list-disc list-inside space-y-1 text-gray-300">
                  {safeList(section.items).map((item, j) => (
                    <li key={j}>{item}</li>
                  ))}
                </ul>
              </CollapsibleCard>
            ))}

          {/* Common Issues + Mistakes (after Steps) */}
          {safeSections(data.diagnoseData)
            .filter(
              (section) =>
                section.title === "Common Issues Seen" ||
                section.title === "Common Mistakes"
            )
            .map((section, i) => (
              <CollapsibleCard
                key={`diag-common-${i}`}
                title={section.title}
                color="text-blue-300"
              >
                <ul className="list-disc list-inside space-y-1 text-gray-300">
                  {safeList(section.items).map((item, j) => (
                    <li key={j}>{item}</li>
                  ))}
                </ul>
              </CollapsibleCard>
            ))}

          {/* Repair Data */}
          {safeSections(data.repairData).map((section, i) => (
            <CollapsibleCard
              key={`repair-${i}`}
              title={section.title}
              color="text-green-300"
            >
              <ul className="list-disc list-inside space-y-1 text-gray-300">
                {safeList(section.items).map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ul>
            </CollapsibleCard>
          ))}

          {/* Verify Data */}
          {safeSections(data.verifyData).map((section, i) => (
            <CollapsibleCard
              key={`verify-${i}`}
              title={section.title}
              color="text-teal-300"
            >
              <ul className="list-disc list-inside space-y-1 text-gray-300">
                {safeList(section.items).map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ul>
            </CollapsibleCard>
          ))}
        </div>
      )}
    </div>
  );
}