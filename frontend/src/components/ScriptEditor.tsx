"use client";

import { useState } from "react";
import { VideoMode } from "@/app/page";

interface ScriptEditorProps {
  script: string;
  onScriptChange: (script: string) => void;
  mode: VideoMode;
  language: string;
  onLanguageChange: (lang: string) => void;
}

const WORD_TARGETS: Record<VideoMode, { min: number; max: number; duration: string }> = {
  shorts: { min: 80, max: 150, duration: "30-60 sec" },
  long: { min: 600, max: 3000, duration: "4-20 min" },
  square: { min: 150, max: 450, duration: "1-3 min" },
};

const TEMPLATES: Record<VideoMode, { title: string; text: string }[]> = {
  short: [
    {
      title: "GST Mistakes (30s)",
      text: "Kya aap yeh 3 GST mistakes kar rahe hain? Mistake number 1 - Late filing. GSTR-3B late file karne par 50 rupees per day penalty lagti hai. Mistake number 2 - Wrong HSN code. Galat HSN code se ITC reject ho sakta hai. Mistake number 3 - Not reconciling. GSTR-2B se match nahi karna matlab paisa doobna. CheckMyGST app download karo aur in sab mistakes se bacho!",
    },
    {
      title: "App Introduction (60s)",
      text: "Namaskar! Main Raunak Samanta, aur maine banaya hai CheckMyGST — India ka sabse simple GST management app. Agar aap business owner hain, CA hain, ya accountant hain, toh yeh app aapke liye hai. Ek click mein purchases add karo, sales track karo, aur GSTR-2B se automatic reconciliation karo. GST filing kabhi itni easy nahi thi. Abhi download karo — bilkul free hai!",
    },
  ],
  long: [
    {
      title: "Complete GST Guide (10 min)",
      text: "## Introduction\nNamaskar dosto! Aaj hum baat karenge GST ke baare mein — ek complete guide jo har business owner ko pata hona chahiye. Main hoon Raunak Samanta aur maine banaya hai CheckMyGST.\n\n## GST Kya Hota Hai\nGST matlab Goods and Services Tax. Yeh India mein 2017 mein launch hua tha. Pehle bahut saare taxes the — VAT, Service Tax, Excise Duty. Ab sab ek GST mein aa gaye hain.\n\n## GST Rates\nGST ke 4 main rates hain: 5%, 12%, 18%, aur 28%. Essential items pe 5% lagta hai, jaise food grains. Luxury items pe 28% lagta hai, jaise AC aur cars.\n\n## GSTR Filing\nHar month aapko GSTR-3B file karna padta hai. Quarterly return GSTR-1 mein sales report karte hain. Annual return GSTR-9 mein poore saal ka summary dete hain.\n\n## Common Mistakes\nSabse badi mistake hai late filing — isse penalty lagti hai. Doosri mistake hai ITC claim galat karna. Teesri mistake hai reconciliation na karna.\n\n## Conclusion\nToh dosto, GST complicated lagta hai lekin CheckMyGST app se sab easy ho jaata hai. App download karo, apna business tension-free chalao. Like karo, subscribe karo, aur bell icon dabao!",
    },
  ],
  square: [
    {
      title: "ITC Explained (90s)",
      text: "ITC matlab Input Tax Credit. Simple language mein — jo GST aapne purchase pe diya, woh aap sales ke GST se minus kar sakte ho. Example: Aapne 1000 rupees ka maal kharida, uspe 180 rupees GST diya. Ab aapne woh maal 1500 mein becha, uspe 270 rupees GST lagega. Lekin aapko sirf 270 - 180 = 90 rupees dena hai government ko. Yeh hai ITC ka fayda! CheckMyGST app automatically aapka ITC track karta hai.",
    },
  ],
};

export default function ScriptEditor({
  script,
  onScriptChange,
  mode,
  language,
  onLanguageChange,
}: ScriptEditorProps) {
  const [showTemplates, setShowTemplates] = useState(false);
  const target = WORD_TARGETS[mode];
  const wordCount = script.trim() ? script.trim().split(/\s+/).length : 0;
  const estimatedDuration = Math.round(wordCount / 2.5); // ~150 wpm

  const isInRange = wordCount >= target.min && wordCount <= target.max;
  const isOver = wordCount > target.max;

  return (
    <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <span className="text-lg">📝</span> Script
        </h3>
        <div className="flex items-center gap-3">
          {/* Language selector */}
          <select
            className="input-field text-xs py-1.5 px-3"
            style={{ width: "auto" }}
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
          >
            <option value="en">English</option>
            <option value="hi">Hindi</option>
            <option value="hinglish">Hinglish</option>
          </select>
          <button
            className="text-xs px-3 py-1.5 rounded-lg transition-colors"
            style={{
              background: showTemplates ? "var(--accent)" : "var(--bg-secondary)",
              color: showTemplates ? "white" : "var(--text-secondary)",
              border: "1px solid var(--border)",
            }}
            onClick={() => setShowTemplates(!showTemplates)}
          >
            📋 Templates
          </button>
        </div>
      </div>

      {/* Templates panel */}
      {showTemplates && (
        <div
          className="mb-4 p-4 rounded-xl"
          style={{
            background: "var(--bg-secondary)",
            border: "1px solid var(--border)",
          }}
        >
          <p className="text-xs mb-3" style={{ color: "var(--text-secondary)" }}>
            Choose a pre-loaded script template:
          </p>
          <div className="flex flex-wrap gap-2">
            {(TEMPLATES[mode] || []).map((tmpl, i) => (
              <button
                key={i}
                className="text-xs px-3 py-1.5 rounded-lg transition-all hover:scale-105"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                }}
                onClick={() => {
                  onScriptChange(tmpl.text);
                  setShowTemplates(false);
                }}
              >
                {tmpl.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Text area */}
      <textarea
        className="input-field resize-none"
        rows={10}
        placeholder={`Paste your script here...\n\nFor long videos, use ## headings for chapter markers:\n## Introduction\nYour intro text here...\n## Main Topic\nYour content here...`}
        value={script}
        onChange={(e) => onScriptChange(e.target.value)}
      />

      {/* Stats bar */}
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-4">
          <span
            className="text-xs font-mono"
            style={{
              color: isOver
                ? "var(--error)"
                : isInRange
                ? "var(--success)"
                : "var(--text-secondary)",
            }}
          >
            {wordCount} / {target.min}-{target.max} words
          </span>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            ~{estimatedDuration}s ({target.duration})
          </span>
        </div>
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
          {script.length} chars
        </span>
      </div>

      {/* Word count progress bar */}
      <div className="progress-bar mt-2">
        <div
          className="progress-bar-fill"
          style={{
            width: `${Math.min(100, (wordCount / target.max) * 100)}%`,
            background: isOver
              ? "var(--error)"
              : isInRange
              ? "var(--success)"
              : "linear-gradient(90deg, var(--accent), #9b8ffd)",
          }}
        />
      </div>
    </div>
  );
}
