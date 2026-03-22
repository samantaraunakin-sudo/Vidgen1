"use client";
import React from "react";

interface VoiceSelectorProps {
  voice: string;
  onVoiceChange: (voice: string) => void;
  rate: number;
  onRateChange: (rate: number) => void;
  pitch: number;
  onPitchChange: (pitch: number) => void;
  language: string;
  isGenerating: boolean;
  onGenerate: () => void;
  audioId: string | null;
  audioDuration: number;
  apiUrl: string;
  onVoiceUpload: (audioId: string) => void;
}

const VOICES = [
  { id: "p225", label: "Male English", flag: "🇬🇧" },
  { id: "p228", label: "Female English", flag: "🇬🇧" },
  { id: "p226", label: "Male (Deep)", flag: "🎙️" },
  { id: "p229", label: "Female (Warm)", flag: "🎙️" },
];

export default function VoiceSelector({
  voice,
  onVoiceChange,
  rate,
  onRateChange,
  pitch,
  onPitchChange,
  language,
  isGenerating,
  onGenerate,
  audioId,
  audioDuration,
  apiUrl,
  onVoiceUpload,
}: VoiceSelectorProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${apiUrl}/api/upload-voice`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (data.id) {
        onVoiceUpload(data.id);
      }
    } catch (error) {
      console.error("Voice upload failed:", error);
    }
  };

  return (
    <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: "0.3s" }}>
      <h3 className="font-semibold mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">🎙️</span> Voice Settings
        </div>
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="text-[10px] uppercase tracking-wider font-bold py-1 px-2 rounded bg-white/5 hover:bg-white/10"
          style={{ color: "var(--accent)" }}
        >
          Upload Custom Voice
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileUpload} 
          accept="audio/*" 
          className="hidden" 
        />
      </h3>

      {/* Voice selector */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {VOICES.map((v) => (
          <button
            key={v.id}
            onClick={() => onVoiceChange(v.id)}
            className="p-3 rounded-xl text-left text-sm transition-all"
            style={{
              background: voice === v.id ? "rgba(124, 111, 250, 0.15)" : "var(--bg-secondary)",
              border: `1px solid ${voice === v.id ? "var(--accent)" : "var(--border)"}`,
            }}
          >
            <span className="text-lg mr-2">{v.flag}</span>
            <span style={{ color: voice === v.id ? "var(--accent)" : "var(--text-primary)" }}>
              {v.label}
            </span>
          </button>
        ))}
      </div>

      {/* Sliders */}
      <div className="space-y-4 mb-5">
        <div>
          <div className="flex justify-between mb-1.5">
            <label className="text-xs" style={{ color: "var(--text-secondary)" }}>
              Speech Rate
            </label>
            <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
              {rate.toFixed(1)}x
            </span>
          </div>
          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.1"
            value={rate}
            onChange={(e) => onRateChange(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>
        <div>
          <div className="flex justify-between mb-1.5">
            <label className="text-xs" style={{ color: "var(--text-secondary)" }}>
              Pitch
            </label>
            <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
              {pitch.toFixed(1)}
            </span>
          </div>
          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.1"
            value={pitch}
            onChange={(e) => onPitchChange(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      {/* Generate Audio button */}
      <button
        className="btn-accent w-full"
        onClick={onGenerate}
        disabled={isGenerating}
      >
        {isGenerating ? (
          <span className="flex items-center justify-center gap-2">
            <span
              className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
              style={{ animation: "spin 0.8s linear infinite" }}
            />
            Generating Audio...
          </span>
        ) : audioId ? (
          "🔄 Regenerate Audio"
        ) : (
          "🎵 Generate Audio Preview"
        )}
      </button>

      {/* Audio preview */}
      {audioId && (
        <div
          className="mt-4 p-3 rounded-xl"
          style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs" style={{ color: "var(--success)" }}>
              ✓ {audioId.startsWith("upload_") ? "Custom voice uploaded" : "Audio generated"}
            </span>
            {audioDuration > 0 && (
              <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                {audioDuration.toFixed(1)}s
              </span>
            )}
          </div>
          <audio
            controls
            className="w-full h-8"
            src={`${apiUrl}/outputs/${audioId}.wav`}
            style={{ filter: "invert(1) hue-rotate(180deg)", opacity: 0.8 }}
          />
        </div>
      )}
    </div>
  );
}
