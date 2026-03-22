"use client";

import { JobStatus } from "@/app/page";

interface VideoPreviewProps {
  jobStatus: JobStatus | null;
  isGenerating: boolean;
  apiUrl: string;
}

const STEPS = [
  "Preparing inputs",
  "Processing audio",
  "Generating talking head",
  "Enhancing face quality",
  "Compositing video",
  "Generating subtitles",
  "Generating chapters",
  "Exporting final video",
];

export default function VideoPreview({
  jobStatus,
  isGenerating,
  apiUrl,
}: VideoPreviewProps) {
  const isCompleted = jobStatus?.status === "completed";
  const isFailed = jobStatus?.status === "failed";

  return (
    <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <span className="text-lg">🎬</span> Preview
      </h3>

      {/* Video Player / Placeholder */}
      <div
        className="w-full rounded-xl overflow-hidden mb-4"
        style={{
          aspectRatio: "16/9",
          background: "var(--bg-secondary)",
          border: "1px solid var(--border)",
        }}
      >
        {isCompleted && jobStatus.videoUrl ? (
          <video
            controls
            className="w-full h-full object-contain"
            src={`${apiUrl}/${jobStatus.videoUrl}`}
          >
            Your browser does not support the video tag.
          </video>
        ) : isGenerating || (jobStatus && !isCompleted && !isFailed) ? (
          /* Processing animation */
          <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-6">
            <div className="relative">
              <div
                className="w-16 h-16 rounded-full border-3"
                style={{
                  borderColor: "var(--border)",
                  borderTopColor: "var(--accent)",
                  animation: "spin 1s linear infinite",
                }}
              />
              <div
                className="absolute inset-0 w-16 h-16 rounded-full"
                style={{
                  background: "radial-gradient(circle, var(--accent-glow), transparent 70%)",
                  animation: "pulse-glow 2s ease-in-out infinite",
                }}
              />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium mb-1">
                {jobStatus?.currentStep || "Initializing..."}
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                {jobStatus?.progress || 0}% complete
              </p>
            </div>
            {/* Progress bar */}
            <div className="w-full progress-bar">
              <div
                className="progress-bar-fill"
                style={{ width: `${jobStatus?.progress || 0}%` }}
              />
            </div>
            {/* Step indicators */}
            <div className="w-full grid grid-cols-4 gap-1 mt-2">
              {STEPS.map((step, i) => {
                const stepProgress = ((i + 1) / STEPS.length) * 100;
                const isDone = (jobStatus?.progress || 0) >= stepProgress;
                const isCurrent =
                  (jobStatus?.progress || 0) >= stepProgress - 12.5 &&
                  (jobStatus?.progress || 0) < stepProgress;
                return (
                  <div
                    key={i}
                    className="text-center"
                    title={step}
                  >
                    <div
                      className="w-2 h-2 rounded-full mx-auto mb-0.5"
                      style={{
                        background: isDone
                          ? "var(--success)"
                          : isCurrent
                          ? "var(--accent)"
                          : "var(--border)",
                        boxShadow: isCurrent
                          ? "0 0 8px var(--accent-glow)"
                          : "none",
                      }}
                    />
                    <span
                      className="text-[8px] leading-tight block"
                      style={{
                        color: isDone
                          ? "var(--success)"
                          : isCurrent
                          ? "var(--accent)"
                          : "var(--text-muted)",
                      }}
                    >
                      {i + 1}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : isFailed ? (
          /* Error state */
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-6">
            <span className="text-4xl">❌</span>
            <p className="text-sm" style={{ color: "var(--error)" }}>
              Generation failed
            </p>
            <p className="text-xs text-center" style={{ color: "var(--text-muted)" }}>
              {jobStatus.error || "An unexpected error occurred"}
            </p>
          </div>
        ) : (
          /* Empty state */
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-6">
            <span className="text-5xl opacity-30">🎥</span>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Your video preview will appear here
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Upload a photo → Write a script → Generate audio → Generate video
            </p>
          </div>
        )}
      </div>

      {/* Estimated time */}
      {!isCompleted && !isGenerating && (
        <div
          className="p-3 rounded-xl text-xs"
          style={{
            background: "var(--bg-secondary)",
            color: "var(--text-secondary)",
            border: "1px solid var(--border)",
          }}
        >
          <p className="font-medium mb-1">⏱️ Estimated processing time:</p>
          <div className="flex gap-4">
            <span>Without GPU: 8-12 min (60s video)</span>
            <span>With GPU: 45-90 sec</span>
          </div>
        </div>
      )}
    </div>
  );
}
