"use client";

import { useMemo } from "react";

interface ChapterSettingsProps {
  chapters: boolean;
  onChaptersChange: (v: boolean) => void;
  introOutro: boolean;
  onIntroOutroChange: (v: boolean) => void;
  introVideoId: string | null;
  onIntroVideoIdChange: (v: string | null) => void;
  outroVideoId: string | null;
  onOutroVideoIdChange: (v: string | null) => void;
  layoutOption: string;
  onLayoutOptionChange: (v: string) => void;
  script: string;
  apiUrl: string;
}

const LAYOUTS = [
  { id: "A", label: "Full Screen", desc: "Avatar fills entire frame", icon: "🖥️" },
  { id: "B", label: "Avatar + Slides", desc: "Avatar left, content right", icon: "📊" },
  { id: "C", label: "Split Screen", desc: "Avatar left, screen right", icon: "◧" },
];

export default function ChapterSettings({
  chapters,
  onChaptersChange,
  introOutro,
  onIntroOutroChange,
  introVideoId,
  onIntroVideoIdChange,
  outroVideoId,
  onOutroVideoIdChange,
  layoutOption,
  onLayoutOptionChange,
  script,
  apiUrl,
}: ChapterSettingsProps) {
  // Extract chapters from script ## headings
  const detectedChapters = useMemo(() => {
    const lines = script.split("\n");
    return lines
      .filter((line) => line.trim().startsWith("## "))
      .map((line) => line.trim().replace(/^##\s*/, ""));
  }, [script]);

  return (
    <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: "0.5s" }}>
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <span className="text-lg">🎬</span> Long Video Settings
      </h3>

      {/* Layout selector */}
      <div className="mb-5">
        <label className="text-xs mb-2 block" style={{ color: "var(--text-secondary)" }}>
          Video Layout
        </label>
        <div className="grid grid-cols-3 gap-2">
          {LAYOUTS.map((l) => (
            <button
              key={l.id}
              onClick={() => onLayoutOptionChange(l.id)}
              className="p-3 rounded-xl text-center transition-all"
              style={{
                background: layoutOption === l.id ? "rgba(124, 111, 250, 0.15)" : "var(--bg-secondary)",
                border: `1px solid ${layoutOption === l.id ? "var(--accent)" : "var(--border)"}`,
              }}
            >
              <span className="text-xl block mb-1">{l.icon}</span>
              <span className="text-xs font-medium block">{l.label}</span>
              <span
                className="text-[10px] block mt-0.5"
                style={{ color: "var(--text-muted)" }}
              >
                {l.desc}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Chapters toggle */}
      <div className="mb-4">
        <label className="flex items-center justify-between cursor-pointer">
          <div>
            <span className="text-sm">Auto-Generate Chapters</span>
            <span className="text-xs block mt-0.5" style={{ color: "var(--text-muted)" }}>
              Uses ## headings in your script
            </span>
          </div>
          <div
            className="w-11 h-6 rounded-full relative transition-colors cursor-pointer"
            style={{
              background: chapters ? "var(--accent)" : "var(--bg-secondary)",
              border: "1px solid var(--border)",
            }}
            onClick={() => onChaptersChange(!chapters)}
          >
            <div
              className="w-4 h-4 rounded-full absolute top-0.5 transition-transform"
              style={{
                background: "white",
                transform: chapters ? "translateX(22px)" : "translateX(4px)",
              }}
            />
          </div>
        </label>

        {/* Detected chapters preview */}
        {chapters && detectedChapters.length > 0 && (
          <div
            className="mt-3 p-3 rounded-xl"
            style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}
          >
            <p className="text-xs mb-2" style={{ color: "var(--success)" }}>
              ✓ {detectedChapters.length} chapters detected:
            </p>
            {detectedChapters.map((ch, i) => (
              <div
                key={i}
                className="text-xs py-0.5 flex items-center gap-2"
                style={{ color: "var(--text-secondary)" }}
              >
                <span className="font-mono" style={{ color: "var(--text-muted)" }}>
                  {i === 0 ? "0:00" : "—:——"}
                </span>
                {ch}
              </div>
            ))}
          </div>
        )}

        {chapters && detectedChapters.length === 0 && (
          <p className="text-xs mt-2" style={{ color: "var(--warning)" }}>
            ⚠️ No ## headings found in your script. Add them to enable chapters.
          </p>
        )}
      </div>

      {/* Intro/Outro toggle */}
      <div className="space-y-4">
        <label className="flex items-center justify-between cursor-pointer">
          <div>
            <span className="text-sm">Add Intro & Outro</span>
            <span className="text-xs block mt-0.5" style={{ color: "var(--text-muted)" }}>
              5s animated intro + 10s subscribe CTA
            </span>
          </div>
          <div
            className="w-11 h-6 rounded-full relative transition-colors cursor-pointer"
            style={{
              background: introOutro ? "var(--accent)" : "var(--bg-secondary)",
              border: "1px solid var(--border)",
            }}
            onClick={() => onIntroOutroChange(!introOutro)}
          >
            <div
              className="w-4 h-4 rounded-full absolute top-0.5 transition-transform"
              style={{
                background: "white",
                transform: introOutro ? "translateX(22px)" : "translateX(4px)",
              }}
            />
          </div>
        </label>

        {introOutro && (
          <div className="grid grid-cols-2 gap-3 animate-slide-up">
            <div className="p-3 rounded-xl bg-black/20 border border-white/5">
              <label className="text-[10px] uppercase tracking-wider mb-2 block text-muted-foreground">Intro Video</label>
              <div className="relative">
                {introVideoId ? (
                  <div className="flex items-center gap-2 text-xs text-success">
                    <span className="truncate flex-1">✓ {introVideoId.slice(0, 10)}...</span>
                    <button onClick={() => onIntroVideoIdChange(null)} className="hover:text-red-400">✕</button>
                  </div>
                ) : (
                  <input 
                    type="file" 
                    accept="video/*" 
                    className="text-[10px] w-full file:bg-accent file:border-0 file:rounded file:text-white file:px-2 file:py-1 cursor-pointer"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const formData = new FormData();
                      formData.append("file", file);
                      const res = await fetch(`${apiUrl}/api/upload-photo`, { method: "POST", body: formData });
                      const data = await res.json();
                      if (data.id) onIntroVideoIdChange(data.id);
                    }}
                  />
                )}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-black/20 border border-white/5">
              <label className="text-[10px] uppercase tracking-wider mb-2 block text-muted-foreground">Outro Video</label>
              <div className="relative">
                {outroVideoId ? (
                  <div className="flex items-center gap-2 text-xs text-success">
                    <span className="truncate flex-1">✓ {outroVideoId.slice(0, 10)}...</span>
                    <button onClick={() => onOutroVideoIdChange(null)} className="hover:text-red-400">✕</button>
                  </div>
                ) : (
                  <input 
                    type="file" 
                    accept="video/*" 
                    className="text-[10px] w-full file:bg-accent file:border-0 file:rounded file:text-white file:px-2 file:py-1 cursor-pointer"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const formData = new FormData();
                      formData.append("file", file);
                      const res = await fetch(`${apiUrl}/api/upload-photo`, { method: "POST", body: formData });
                      const data = await res.json();
                      if (data.id) onOutroVideoIdChange(data.id);
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
