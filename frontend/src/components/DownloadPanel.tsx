"use client";

import { JobStatus, VideoMode } from "@/app/page";
import { useState } from "react";

interface DownloadPanelProps {
  jobStatus: JobStatus;
  apiUrl: string;
  mode: VideoMode;
}

export default function DownloadPanel({
  jobStatus,
  apiUrl,
  mode,
}: DownloadPanelProps) {
  const [copiedChapters, setCopiedChapters] = useState(false);
  const [copiedDesc, setCopiedDesc] = useState(false);

  const handleCopy = async (text: string, setter: (v: boolean) => void) => {
    await navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  return (
    <div className="glass-card p-6 animate-fade-in">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <span className="text-lg">📥</span> Downloads
      </h3>

      <div className="space-y-3">
        {/* Main video download */}
        <a
          href={`${apiUrl}/api/download/${jobStatus.jobId}`}
          download
          className="btn-accent w-full flex items-center justify-center gap-2 py-3 no-underline"
          style={{ display: "flex" }}
        >
          <span>⬇️</span>
          Download MP4 Video
        </a>

        {/* SRT download */}
        {jobStatus.srtUrl && (
          <a
            href={`${apiUrl}/api/download/${jobStatus.jobId}/srt`}
            download
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm no-underline transition-all"
            style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border)",
              color: "var(--text-primary)",
            }}
          >
            <span>📝</span>
            Download SRT Subtitles
          </a>
        )}

        {/* Thumbnail download (long video) */}
        {mode === "long" && jobStatus.thumbnailUrl && (
          <a
            href={`${apiUrl}/api/download/${jobStatus.jobId}/thumbnail`}
            download
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm no-underline transition-all"
            style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border)",
              color: "var(--text-primary)",
            }}
          >
            <span>🖼️</span>
            Download Thumbnail (1280×720)
          </a>
        )}

        {/* Copy chapters */}
        {mode === "long" && jobStatus.chaptersText && (
          <button
            onClick={() => handleCopy(jobStatus.chaptersText!, setCopiedChapters)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm transition-all"
            style={{
              background: copiedChapters
                ? "rgba(52, 211, 153, 0.1)"
                : "var(--bg-secondary)",
              border: `1px solid ${copiedChapters ? "var(--success)" : "var(--border)"}`,
              color: copiedChapters ? "var(--success)" : "var(--text-primary)",
            }}
          >
            <span>{copiedChapters ? "✓" : "📋"}</span>
            {copiedChapters ? "Copied!" : "Copy YouTube Chapters"}
          </button>
        )}

        {/* Copy description */}
        {mode === "long" && jobStatus.descriptionText && (
          <button
            onClick={() => handleCopy(jobStatus.descriptionText!, setCopiedDesc)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm transition-all"
            style={{
              background: copiedDesc
                ? "rgba(52, 211, 153, 0.1)"
                : "var(--bg-secondary)",
              border: `1px solid ${copiedDesc ? "var(--success)" : "var(--border)"}`,
              color: copiedDesc ? "var(--success)" : "var(--text-primary)",
            }}
          >
            <span>{copiedDesc ? "✓" : "📄"}</span>
            {copiedDesc ? "Copied!" : "Copy YouTube Description"}
          </button>
        )}
      </div>
    </div>
  );
}
