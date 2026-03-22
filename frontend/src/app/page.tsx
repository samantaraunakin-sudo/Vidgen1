"use client";

import { useState } from "react";
import ModeSelector from "@/components/ModeSelector";
import PhotoUploader from "@/components/PhotoUploader";
import ScriptEditor from "@/components/ScriptEditor";
import VoiceSelector from "@/components/VoiceSelector";
import CustomizationPanel from "@/components/CustomizationPanel";
import VideoPreview from "@/components/VideoPreview";
import DownloadPanel from "@/components/DownloadPanel";
import BatchQueue from "@/components/BatchQueue";
import ChapterSettings from "@/components/ChapterSettings";

// API base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export type VideoMode = "shorts" | "long" | "square";

export interface LowerThird {
  name: string;
  title: string;
  url: string;
  animated: boolean;
}

export interface JobStatus {
  jobId: string;
  status: "queued" | "processing" | "completed" | "failed";
  progress: number;
  currentStep: string;
  videoUrl: string | null;
  thumbnailUrl: string | null;
  srtUrl: string | null;
  chaptersText: string | null;
  descriptionText: string | null;
  error: string | null;
}

export default function Home() {
  // --- State ---
  const [mode, setMode] = useState<VideoMode>("shorts");
  const [introVideoId, setIntroVideoId] = useState<string | null>(null);
  const [outroVideoId, setOutroVideoId] = useState<string | null>(null);
  const [photoId, setPhotoId] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [script, setScript] = useState("");
  const [voice, setVoice] = useState("p225");
  const [language, setLanguage] = useState("en");
  const [rate, setRate] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);
  const [audioId, setAudioId] = useState<string | null>(null);
  const [audioDuration, setAudioDuration] = useState(0);
  const [background, setBackground] = useState("dark_studio");
  const [brandColor, setBrandColor] = useState("#7c6ffa");
  const [watermarkUrl, setWatermarkUrl] = useState("");
  const [lowerThird, setLowerThird] = useState<LowerThird>({
    name: "",
    title: "",
    url: "",
    animated: true,
  });
  const [subtitles, setSubtitles] = useState(true);
  const [chapters, setChapters] = useState(false);
  const [introOutro, setIntroOutro] = useState(false);
  const [layoutOption, setLayoutOption] = useState("A");

  // Processing state
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);

  // --- Handlers ---
  const handlePhotoUploaded = (id: string, previewUrl: string) => {
    setPhotoId(id);
    setPhotoPreview(previewUrl);
  };

  const handleGenerateAudio = async () => {
    if (!script.trim()) return;
    setIsGeneratingAudio(true);
    try {
      const res = await fetch(`${API_URL}/api/generate-audio`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ script, voice, rate, pitch, language, mode }),
      });
      const data = await res.json();
      if (res.ok) {
        setAudioId(data.audioId);
        setAudioDuration(data.duration);
      }
    } catch (err) {
      console.error("Audio generation failed:", err);
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (!photoId || !audioId) return;
    setIsGeneratingVideo(true);
    try {
      const res = await fetch(`${API_URL}/api/generate-video`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          photoPath: photoId,
          audioId,
          mode,
          background,
          subtitles,
          subtitleStyle: mode === "shorts" ? "shorts" : "youtube",
          chapters: chapters && mode === "long",
          introOutro: introOutro && mode === "long",
          lowerThird,
          layoutOption,
          brandColor,
          watermarkUrl,
          introVideoId,
          outroVideoId,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        // Start polling
        pollJobStatus(data.jobId);
      }
    } catch (err) {
      console.error("Video generation failed:", err);
      setIsGeneratingVideo(false);
    }
  };

  const pollJobStatus = async (jobId: string) => {
    const poll = async () => {
      try {
        const res = await fetch(`${API_URL}/api/job-status/${jobId}`);
        const data: JobStatus = await res.json();
        setJobStatus(data);

        if (data.status === "processing" || data.status === "queued") {
          setTimeout(poll, 2000);
        } else {
          setIsGeneratingVideo(false);
        }
      } catch {
        setTimeout(poll, 3000);
      }
    };
    poll();
  };

  const canGenerate = photoId && audioId && !isGeneratingVideo;

  return (
    <main className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
      {/* ===== Header ===== */}
      <header className="border-b" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl font-bold"
              style={{
                background: "linear-gradient(135deg, var(--accent), #6456e0)",
              }}
            >
              V
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Vidgen</h1>
              <p
                className="text-xs"
                style={{ color: "var(--text-secondary)" }}
              >
                AI Avatar Video Generator
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span
              className="text-xs px-3 py-1 rounded-full"
              style={{
                background: "rgba(52, 211, 153, 0.15)",
                color: "var(--success)",
              }}
            >
              ● Online
            </span>
          </div>
        </div>
      </header>

      {/* ===== Section 1: Mode Selector ===== */}
      <section className="max-w-7xl mx-auto px-6 pt-8 pb-4">
        <ModeSelector mode={mode} onModeChange={setMode} />
      </section>

      {/* ===== Section 2: Two Column Layout ===== */}
      <section className="max-w-7xl mx-auto px-6 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left Column — Controls */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            <PhotoUploader
              apiUrl={API_URL}
              onPhotoUploaded={handlePhotoUploaded}
              photoPreview={photoPreview}
            />

            <ScriptEditor
              script={script}
              onScriptChange={setScript}
              mode={mode}
              language={language}
              onLanguageChange={setLanguage}
            />

            <VoiceSelector
              voice={voice}
              onVoiceChange={setVoice}
              rate={rate}
              onRateChange={setRate}
              pitch={pitch}
              onPitchChange={setPitch}
              language={language}
              isGenerating={isGeneratingAudio}
              onGenerate={handleGenerateAudio}
              audioId={audioId}
              audioDuration={audioDuration}
              apiUrl={API_URL}
              onVoiceUpload={(id) => setAudioId(id)}
            />

            <CustomizationPanel
              background={background}
              onBackgroundChange={setBackground}
              brandColor={brandColor}
              onBrandColorChange={setBrandColor}
              watermarkUrl={watermarkUrl}
              onWatermarkUrlChange={setWatermarkUrl}
              lowerThird={lowerThird}
              onLowerThirdChange={setLowerThird}
              subtitles={subtitles}
              onSubtitlesChange={setSubtitles}
              mode={mode}
            />

            {mode === "long" && (
              <ChapterSettings
                chapters={chapters}
                onChaptersChange={setChapters}
                introOutro={introOutro}
                onIntroOutroChange={setIntroOutro}
                introVideoId={introVideoId}
                onIntroVideoIdChange={setIntroVideoId}
                outroVideoId={outroVideoId}
                onOutroVideoIdChange={setOutroVideoId}
                layoutOption={layoutOption}
                onLayoutOptionChange={setLayoutOption}
                script={script}
                apiUrl={API_URL}
              />
            )}
          </div>

          {/* Right Column — Preview + Generate */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <VideoPreview
              jobStatus={jobStatus}
              isGenerating={isGeneratingVideo}
              apiUrl={API_URL}
            />

            <button
              className="btn-accent w-full py-4 text-lg"
              onClick={handleGenerateVideo}
              disabled={!canGenerate}
            >
              {isGeneratingVideo ? (
                <span className="flex items-center justify-center gap-3">
                  <span
                    className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    style={{ animation: "spin 0.8s linear infinite" }}
                  />
                  Generating Video...
                </span>
              ) : (
                "🎬 Generate Video"
              )}
            </button>

            {jobStatus?.status === "completed" && (
              <DownloadPanel
                jobStatus={jobStatus}
                apiUrl={API_URL}
                mode={mode}
              />
            )}
          </div>
        </div>
      </section>

      {/* ===== Section 3: Batch Queue ===== */}
      <section className="max-w-7xl mx-auto px-6 pb-12">
        <BatchQueue />
      </section>
    </main>
  );
}
