"use client";
import { useState, useEffect } from "react";

interface ChatItem {
  id: string;
  query: string;
  response: string;
  timestamp: string;
}

export default function ChatPage() {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<ChatItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("chatHistory");
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  const handleSubmit = () => {
    if (!input.trim()) return;

    // Mock AI response (later we’ll connect OpenAI API here)
    const newItem: ChatItem = {
      id: Date.now().toString(),
      query: input,
      response: `Pretend AI answer for: "${input}"`,
      timestamp: new Date().toISOString(),
    };

    const updated = [newItem, ...history];
    setHistory(updated);
    localStorage.setItem("chatHistory", JSON.stringify(updated));
    setInput("");
  };

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-2xl font-bold mb-4">Chat</h2>

      {/* Chat history display */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {history.map((item) => (
          <div key={item.id} className="bg-gray-800 p-4 rounded-lg shadow">
            <p className="text-sm text-gray-400">
              {new Date(item.timestamp).toLocaleString()}
            </p>
            <p className="mt-2 font-semibold">Q: {item.query}</p>
            <p className="mt-1 text-gray-300">A: {item.response}</p>
          </div>
        ))}
      </div>

      {/* Input box */}
      <div className="flex space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe the issue..."
          className="flex-1 p-2 rounded bg-gray-700 text-white"
        />
        <button
          onClick={handleSubmit}
          className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-500"
        >
          Run
        </button>
      </div>
    </div>
  );
}