"use client";

import { VideoMode, LowerThird } from "@/app/page";

interface CustomizationPanelProps {
  background: string;
  onBackgroundChange: (bg: string) => void;
  brandColor: string;
  onBrandColorChange: (color: string) => void;
  watermarkUrl: string;
  onWatermarkUrlChange: (url: string) => void;
  lowerThird: LowerThird;
  onLowerThirdChange: (lt: LowerThird) => void;
  subtitles: boolean;
  onSubtitlesChange: (s: boolean) => void;
  mode: VideoMode;
}

const BACKGROUNDS = [
  { id: "dark_studio", label: "Dark Studio", color: "#0a0a12" },
  { id: "gradient_purple", label: "Purple Gradient", color: "#1a0533" },
  { id: "gradient_blue", label: "Blue Gradient", color: "#0a1628" },
  { id: "white_clean", label: "White Clean", color: "#f0f0f5" },
  { id: "blur_bokeh", label: "Blur Bokeh", color: "#151520" },
  { id: "office", label: "Virtual Office", color: "#1c1c28" },
];

export default function CustomizationPanel({
  background,
  onBackgroundChange,
  brandColor,
  onBrandColorChange,
  watermarkUrl,
  onWatermarkUrlChange,
  lowerThird,
  onLowerThirdChange,
  subtitles,
  onSubtitlesChange,
  mode,
}: CustomizationPanelProps) {
  return (
    <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: "0.4s" }}>
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <span className="text-lg">🎨</span> Customization
      </h3>

      {/* Background */}
      <div className="mb-5">
        <label className="text-xs mb-2 block" style={{ color: "var(--text-secondary)" }}>
          Background
        </label>
        <div className="grid grid-cols-3 gap-2">
          {BACKGROUNDS.map((bg) => (
            <button
              key={bg.id}
              onClick={() => onBackgroundChange(bg.id)}
              className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl transition-all"
              style={{
                background: background === bg.id ? "rgba(124, 111, 250, 0.1)" : "var(--bg-secondary)",
                border: `1px solid ${background === bg.id ? "var(--accent)" : "var(--border)"}`,
              }}
            >
              <div
                className="w-8 h-8 rounded-lg"
                style={{
                  background: bg.color,
                  border: "1px solid var(--border)",
                }}
              />
              <span className="text-[10px]" style={{ color: "var(--text-secondary)" }}>
                {bg.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Brand Color */}
      <div className="mb-5">
        <label className="text-xs mb-2 block" style={{ color: "var(--text-secondary)" }}>
          Brand Color
        </label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={brandColor}
            onChange={(e) => onBrandColorChange(e.target.value)}
            className="w-10 h-10 rounded-lg border-0 cursor-pointer"
            style={{ background: "transparent" }}
          />
          <input
            className="input-field text-xs font-mono"
            value={brandColor}
            onChange={(e) => onBrandColorChange(e.target.value)}
            style={{ width: "120px" }}
          />
        </div>
      </div>

      {/* Subtitles toggle */}
      <div className="mb-5">
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-sm">
            Burn Subtitles
            <span className="text-xs ml-2" style={{ color: "var(--text-muted)" }}>
              {mode === "short" ? "(Bold centered)" : "(Standard style)"}
            </span>
          </span>
          <div
            className="w-11 h-6 rounded-full relative transition-colors cursor-pointer"
            style={{
              background: subtitles ? "var(--accent)" : "var(--bg-secondary)",
              border: "1px solid var(--border)",
            }}
            onClick={() => onSubtitlesChange(!subtitles)}
          >
            <div
              className="w-4 h-4 rounded-full absolute top-0.5 transition-transform"
              style={{
                background: "white",
                transform: subtitles ? "translateX(22px)" : "translateX(4px)",
              }}
            />
          </div>
        </label>
      </div>

      {/* Watermark */}
      <div className="mb-5">
        <label className="text-xs mb-2 block" style={{ color: "var(--text-secondary)" }}>
          Watermark URL
        </label>
        <input
          className="input-field text-xs"
          placeholder="e.g. checkmygst.vercel.app"
          value={watermarkUrl}
          onChange={(e) => onWatermarkUrlChange(e.target.value)}
        />
      </div>

      {/* Lower Third */}
      <div>
        <label className="text-xs mb-2 block" style={{ color: "var(--text-secondary)" }}>
          Lower Third
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input
            className="input-field text-xs"
            placeholder="Your Name"
            value={lowerThird.name}
            onChange={(e) =>
              onLowerThirdChange({ ...lowerThird, name: e.target.value })
            }
          />
          <input
            className="input-field text-xs"
            placeholder="Title / Role"
            value={lowerThird.title}
            onChange={(e) =>
              onLowerThirdChange({ ...lowerThird, title: e.target.value })
            }
          />
        </div>
      </div>
    </div>
  );
}
