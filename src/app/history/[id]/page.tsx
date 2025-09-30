"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import CollapsibleCard from "../../../components/CollapsibleCard";
import {
  Wrench,
  AlertTriangle,
  ClipboardList,
  Lightbulb,
  CheckCircle,
  BookOpen, // 📘 for TSBs
} from "lucide-react";

interface Message {
  role: string;
  content: any;
}

interface Section {
  title: string;
  items: string[];
}

interface DiagnoseResponse {
  diagnoseData: Section[];
  repairData: Section[];
  verifyData: Section[];
  tsbData?: Section[]; // 👈 added
}

// ✅ Helpers
const safeSections = (arr: any): Section[] =>
  Array.isArray(arr) ? (arr as Section[]) : [];

const safeList = (arr: any): string[] =>
  Array.isArray(arr)
    ? (arr as unknown[]).filter((x) => typeof x === "string") as string[]
    : [];

export default function ChatDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params as { id: string };

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    const fetchChat = async () => {
      try {
        const res = await fetch(`/api/chats/${id}`, {
          credentials: "include",
        });
        const data = await res.json();

        if (res.ok && data.ok) {
          let parsed: unknown = [];
          try {
            parsed =
              typeof data.chat.messages === "string"
                ? JSON.parse(data.chat.messages)
                : data.chat.messages;
          } catch {
            parsed = [];
          }
          setMessages(Array.isArray(parsed) ? (parsed as Message[]) : []);
        } else {
          setError(data.error || "Failed to load chat.");
        }
      } catch (err) {
        console.error("ChatDetailPage fetch error:", err);
        setError("⚠️ Server error. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchChat();
  }, [id]);

  if (loading) return <p className="text-gray-400">Loading chat...</p>;
  if (error) return <p className="text-red-400">{error}</p>;

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.back()}
        className="text-blue-400 hover:text-blue-300 underline"
      >
        ← Back to History
      </button>

      <h2 className="text-2xl font-bold mb-4">Chat Details</h2>

      <div className="space-y-6">
        {messages.map((msg, index) => {
          if (msg.role === "user") {
            return (
              <div
                key={index}
                className="p-4 rounded-lg bg-blue-900/40 text-blue-200"
              >
                <p className="font-semibold">User:</p>
                <p className="mt-1 whitespace-pre-wrap">{String(msg.content)}</p>
              </div>
            );
          }

          if (msg.role === "assistant") {
            let structured: DiagnoseResponse | null = null;
            try {
              structured =
                typeof msg.content === "string"
                  ? JSON.parse(msg.content)
                  : (msg.content as DiagnoseResponse);
            } catch {
              structured = null;
            }

            const hasSections =
              structured &&
              (safeSections(structured.diagnoseData).length > 0 ||
                safeSections(structured.repairData).length > 0 ||
                safeSections(structured.verifyData).length > 0 ||
                safeSections(structured.tsbData).length > 0);

            if (hasSections && structured) {
              return (
                <div
                  key={index}
                  className="p-4 rounded-lg bg-green-900/40 text-green-200 space-y-4"
                >
                  <p className="font-semibold">Assistant:</p>

                  {/* Diagnose */}
                  {safeSections(structured.diagnoseData).map((section, i) => (
                    <CollapsibleCard
                      key={`diag-${i}`}
                      title={section.title || "Quick Checks"}
                      color="text-blue-300"
                      defaultOpen={i === 0}
                      icon={<ClipboardList className="text-blue-400" size={18} />}
                      highlight="info"
                    >
                      <ul className="list-disc list-inside space-y-1 text-gray-300">
                        {safeList(section.items).map((item, j) => (
                          <li key={j}>{item}</li>
                        ))}
                      </ul>
                    </CollapsibleCard>
                  ))}

                  {/* Repair */}
                  {safeSections(structured.repairData).map((section, i) => (
                    <CollapsibleCard
                      key={`repair-${i}`}
                      title={section.title || "Repair Actions"}
                      color="text-green-300"
                      icon={<Wrench className="text-green-400" size={18} />}
                      highlight="success"
                    >
                      <ul className="list-disc list-inside space-y-1 text-gray-300">
                        {safeList(section.items).map((item, j) => (
                          <li key={j}>{item}</li>
                        ))}
                      </ul>
                    </CollapsibleCard>
                  ))}

                  {/* Verify */}
                  {safeSections(structured.verifyData).map((section, i) => (
                    <CollapsibleCard
                      key={`verify-${i}`}
                      title={section.title || "Post-Repair Verification"}
                      color="text-teal-300"
                      icon={<CheckCircle className="text-teal-400" size={18} />}
                      highlight="info"
                    >
                      <ul className="list-disc list-inside space-y-1 text-gray-300">
                        {safeList(section.items).map((item, j) => (
                          <li key={j}>{item}</li>
                        ))}
                      </ul>
                    </CollapsibleCard>
                  ))}

                  {/* TSB */}
                  {safeSections(structured.tsbData).map((section, i) => (
                    <CollapsibleCard
                      key={`tsb-${i}`}
                      title={section.title || "TSB / Known Issues"}
                      color="text-purple-300"
                      icon={<BookOpen className="text-purple-400" size={18} />}
                      highlight="info"
                    >
                      <ul className="list-disc list-inside space-y-1 text-gray-300">
                        {safeList(section.items).map((item, j) => (
                          <li key={j}>{item}</li>
                        ))}
                      </ul>
                    </CollapsibleCard>
                  ))}

                  {/* Always show tips + pitfalls */}
                  <CollapsibleCard
                    title="Pro Tech Tips"
                    color="text-yellow-300"
                    icon={<Lightbulb className="text-yellow-400" size={18} />}
                    highlight="warning"
                  >
                    <ul className="list-disc list-inside space-y-1 text-gray-300">
                      <li>Check grounds under load, not just with a multimeter.</li>
                      <li>Inspect connector pins for spread/looseness.</li>
                      <li>Always scan for related TSBs before diving deep.</li>
                    </ul>
                  </CollapsibleCard>

                  <CollapsibleCard
                    title="Common Pitfalls"
                    color="text-red-300"
                    icon={<AlertTriangle className="text-red-400" size={18} />}
                    highlight="error"
                  >
                    <ul className="list-disc list-inside space-y-1 text-gray-300">
                      <li>Don’t replace the cluster before checking ignition feed.</li>
                      <li>Check for water intrusion in the underhood fuse block.</li>
                      <li>Rule out CAN bus faults that mimic sensor failures.</li>
                    </ul>
                  </CollapsibleCard>
                </div>
              );
            }

            // fallback
            return (
              <div
                key={index}
                className="p-4 rounded-lg bg-green-900/40 text-green-200"
              >
                <p className="font-semibold">Assistant:</p>
                <p className="mt-1 whitespace-pre-wrap">{String(msg.content)}</p>
              </div>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
}