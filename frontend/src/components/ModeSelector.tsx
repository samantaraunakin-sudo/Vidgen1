"use client";

import { VideoMode } from "@/app/page";

interface ModeSelectorProps {
  mode: VideoMode;
  onModeChange: (mode: VideoMode) => void;
}

const modes = [
  {
    id: "shorts" as VideoMode,

    icon: "📱",
    label: "Shorts & Reels",
    desc: "9:16 Vertical · 15-60s",
    resolution: "1080 × 1920",
    words: "80-150 words",
  },
  {
    id: "long" as VideoMode,
    icon: "🎬",
    label: "YouTube Long Video",
    desc: "16:9 Landscape · 4-20 min",
    resolution: "1920 × 1080",
    words: "600-3000 words",
  },
  {
    id: "square" as VideoMode,
    icon: "⬜",
    label: "Square Video",
    desc: "1:1 Square · 1-3 min",
    resolution: "1080 × 1080",
    words: "150-450 words",
  },
];

export default function ModeSelector({ mode, onModeChange }: ModeSelectorProps) {
  return (
    <div className="animate-fade-in">
      <h2
        className="text-sm font-semibold uppercase tracking-wider mb-3"
        style={{ color: "var(--text-secondary)" }}
      >
        Video Format
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {modes.map((m) => (
          <button
            key={m.id}
            onClick={() => onModeChange(m.id)}
            className="glass-card p-5 text-left transition-all duration-300 relative overflow-hidden"
            style={{
              borderColor:
                mode === m.id ? "var(--accent)" : "var(--border)",
              boxShadow:
                mode === m.id ? "0 0 30px var(--accent-glow)" : "none",
            }}
          >
            {/* Active indicator */}
            {mode === m.id && (
              <div
                className="absolute top-0 left-0 right-0 h-0.5"
                style={{
                  background:
                    "linear-gradient(90deg, var(--accent), #9b8ffd)",
                }}
              />
            )}

            <div className="text-3xl mb-3">{m.icon}</div>
            <h3 className="font-semibold text-base mb-1">{m.label}</h3>
            <p
              className="text-xs mb-2"
              style={{ color: "var(--text-secondary)" }}
            >
              {m.desc}
            </p>
            <div className="flex items-center gap-2">
              <span
                className="text-xs px-2 py-0.5 rounded"
                style={{
                  background: "var(--bg-secondary)",
                  color: "var(--text-muted)",
                }}
              >
                {m.resolution}
              </span>
              <span
                className="text-xs px-2 py-0.5 rounded"
                style={{
                  background: "var(--bg-secondary)",
                  color: "var(--text-muted)",
                }}
              >
                {m.words}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
