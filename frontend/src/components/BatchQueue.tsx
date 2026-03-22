"use client";

import { useState } from "react";

interface BatchItem {
  id: string;
  title: string;
  script: string;
  status: "queued" | "processing" | "completed" | "failed";
}

export default function BatchQueue() {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<BatchItem[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [newScript, setNewScript] = useState("");

  const addToQueue = () => {
    if (!newScript.trim()) return;
    const item: BatchItem = {
      id: Date.now().toString(),
      title: newTitle || `Script ${items.length + 1}`,
      script: newScript,
      status: "queued",
    };
    setItems([...items, item]);
    setNewTitle("");
    setNewScript("");
  };

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  return (
    <div className="glass-card overflow-hidden animate-fade-in" style={{ animationDelay: "0.5s" }}>
      {/* Header / Toggle */}
      <button
        className="w-full p-5 flex items-center justify-between text-left"
        onClick={() => setIsOpen(!isOpen)}
        style={{ background: "transparent" }}
      >
        <div className="flex items-center gap-3">
          <span className="text-lg">📦</span>
          <div>
            <h3 className="font-semibold text-sm">Batch Queue</h3>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
              Queue multiple scripts and process them overnight
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {items.length > 0 && (
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{ background: "var(--accent)", color: "white" }}
            >
              {items.length}
            </span>
          )}
          <span
            className="text-sm transition-transform"
            style={{
              color: "var(--text-muted)",
              transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            }}
          >
            ▼
          </span>
        </div>
      </button>

      {/* Expandable content */}
      {isOpen && (
        <div className="px-5 pb-5" style={{ borderTop: "1px solid var(--border)" }}>
          {/* Add to queue form */}
          <div className="pt-4 mb-4">
            <div className="flex gap-3 mb-3">
              <input
                className="input-field text-xs"
                placeholder="Script title (optional)"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                style={{ flex: "0 0 200px" }}
              />
              <button
                className="btn-accent text-xs px-4 flex-shrink-0"
                onClick={addToQueue}
                disabled={!newScript.trim()}
              >
                + Add to Queue
              </button>
            </div>
            <textarea
              className="input-field resize-none text-xs"
              rows={4}
              placeholder="Paste a script to add to the batch queue..."
              value={newScript}
              onChange={(e) => setNewScript(e.target.value)}
            />
          </div>

          {/* Queue items */}
          {items.length > 0 ? (
            <div className="space-y-2">
              {items.map((item, i) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-xl"
                  style={{
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <span
                    className="text-xs font-mono w-6 h-6 flex items-center justify-center rounded-lg flex-shrink-0"
                    style={{ background: "var(--bg-card)", color: "var(--text-muted)" }}
                  >
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.title}</p>
                    <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                      {item.script.slice(0, 60)}...
                    </p>
                  </div>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{
                      background:
                        item.status === "completed"
                          ? "rgba(52, 211, 153, 0.15)"
                          : item.status === "processing"
                          ? "rgba(124, 111, 250, 0.15)"
                          : "var(--bg-card)",
                      color:
                        item.status === "completed"
                          ? "var(--success)"
                          : item.status === "processing"
                          ? "var(--accent)"
                          : "var(--text-muted)",
                    }}
                  >
                    {item.status}
                  </span>
                  <button
                    className="text-xs p-1 flex-shrink-0 opacity-50 hover:opacity-100 transition-opacity"
                    onClick={() => removeItem(item.id)}
                    title="Remove"
                  >
                    ✕
                  </button>
                </div>
              ))}

              {/* Process all button */}
              <button className="btn-accent w-full mt-3">
                🚀 Process All ({items.length} scripts)
              </button>
            </div>
          ) : (
            <p className="text-xs text-center py-4" style={{ color: "var(--text-muted)" }}>
              No scripts in queue. Add scripts above to batch process them.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
