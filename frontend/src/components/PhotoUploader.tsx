"use client";

import { useState, useRef, useCallback } from "react";

interface PhotoUploaderProps {
  apiUrl: string;
  onPhotoUploaded: (id: string, previewUrl: string) => void;
  photoPreview: string | null;
}

export default function PhotoUploader({
  apiUrl,
  onPhotoUploaded,
  photoPreview,
}: PhotoUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = useCallback(
    async (file: File) => {
      setError(null);
      setIsUploading(true);

      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch(`${apiUrl}/api/upload-photo`, {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.detail || "Upload failed");
          return;
        }

        onPhotoUploaded(data.photoId, `${apiUrl}${data.croppedUrl}`);
      } catch (err) {
        setError("Failed to connect to server. Is the backend running?");
      } finally {
        setIsUploading(false);
      }
    },
    [apiUrl, onPhotoUploaded]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file);
  };

  return (
    <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <span className="text-lg">📸</span> Upload Photo
      </h3>

      {photoPreview ? (
        /* Photo Preview */
        <div className="flex items-start gap-4">
          <div
            className="w-32 h-32 rounded-xl overflow-hidden border-2 flex-shrink-0"
            style={{ borderColor: "var(--accent)" }}
          >
            <img
              src={photoPreview}
              alt="Face preview"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <div
              className="flex items-center gap-2 mb-2 text-sm"
              style={{ color: "var(--success)" }}
            >
              <span>✓</span> Face detected & cropped
            </div>
            <p className="text-xs mb-3" style={{ color: "var(--text-secondary)" }}>
              Your photo has been auto-cropped and centered on the face.
              This will be used to generate the talking avatar.
            </p>
            <button
              className="text-xs px-3 py-1.5 rounded-lg"
              style={{
                background: "var(--bg-secondary)",
                color: "var(--text-secondary)",
                border: "1px solid var(--border)",
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              Change Photo
            </button>
          </div>
        </div>
      ) : (
        /* Drop Zone */
        <div
          className={`drop-zone ${isDragging ? "active" : ""}`}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-3">
              <div
                className="w-10 h-10 border-3 border-t-transparent rounded-full"
                style={{
                  borderColor: "var(--accent)",
                  borderTopColor: "transparent",
                  animation: "spin 0.8s linear infinite",
                }}
              />
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Detecting face & cropping...
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                style={{ background: "var(--bg-secondary)" }}
              >
                🖼️
              </div>
              <div>
                <p className="font-medium text-sm">
                  Drop your portrait photo here
                </p>
                <p
                  className="text-xs mt-1"
                  style={{ color: "var(--text-secondary)" }}
                >
                  JPG, PNG, or WebP · Clear front-facing photo works best
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div
          className="mt-3 p-3 rounded-lg text-sm"
          style={{
            background: "rgba(248, 113, 113, 0.1)",
            color: "var(--error)",
            border: "1px solid rgba(248, 113, 113, 0.2)",
          }}
        >
          ⚠️ {error}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileSelect}
      />
    </div>
  );
}
