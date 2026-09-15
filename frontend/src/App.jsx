import React, { useState } from 'react';

// 1. Direct path mappings for your local public video folder assets
const CACHED_VIDEOS = {
  "hello": "/videos/hello.mp4",
  "good morning": "/videos/good_morning.mp4",
  "good night": "/videos/good_night.mp4",
  "how are you": "/videos/how_are_you.mp4",
  "bye": "/videos/bye.mp4"
};

export default function App() {
  const [inputText, setInputText] = useState("");
  const [videoSrc, setVideoSrc] = useState(CACHED_VIDEOS["hello"]);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState("Ready");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanText = inputText.trim().toLowerCase();
    if (!cleanText) return;

    // Route A: Instant CDN Cache Lookup (0ms Latency Delay)
    if (CACHED_VIDEOS[cleanText]) {
      setIsLoading(false);
      setVideoSrc(CACHED_VIDEOS[cleanText]);
      setStatus(`Playing cached translation for: "${cleanText}"`);
      return;
    }

    // Route B: Dynamic Fallback to Gemini Video Engine
    setIsLoading(true);
    setStatus("Connecting to Gemini Video Engine...");

    try {
      // Simulation steps mimicking live Gemini API server responses
      setTimeout(() => setStatus("Uploading interpreter identity reference..."), 2000);
      setTimeout(() => setStatus("Gemini rendering precise hand vectors..."), 5000);
      setTimeout(() => setStatus("Compiling 60fps video container..."), 9000);

      setTimeout(() => {
        setIsLoading(false);
        // This links to your dynamic target when the real backend endpoint is connected
        setVideoSrc("/videos/fallback_generated.mp4");
        setStatus(`Successfully generated custom sign for: "${cleanText}"`);
      }, 12000);

    } catch (error) {
      setIsLoading(false);
      setStatus("Error generating translation video asset");
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 selection:bg-white/20">
      <div className="w-full max-w-2xl bg-[#28292c] border border-white/5 rounded-2xl p-6 shadow-2xl transition-all">
        
        {/* Header Block */}
        <header className="mb-6 border-b border-white/5 pb-4">
          <h1 className="text-xl font-semibold tracking-tight text-[#f5f5f5] flex items-center gap-2">
            🤟 ISL Multimodal Interpreter
          </h1>
          <p className="text-xs text-neutral-400 mt-1">Consistent Character Translation Engine</p>
        </header>

        {/* Video Playback Canvas Screen */}
        <div className="relative w-full aspect-video bg-[#1a1b1d] border border-white/5 rounded-xl overflow-hidden flex items-center justify-center">
          {isLoading ? (
            <div className="flex flex-col items-center gap-3">
              {/* Spinner */}
              <div className="w-10 h-10 border-2 border-white/10 border-t-[#f5f5f5] rounded-full animate-spin"></div>
              <p className="text-xs font-mono text-neutral-400 animate-pulse">{status}</p>
            </div>
          ) : (
            <video
              key={videoSrc}
              src={videoSrc}
              autoPlay
              controls
              loop
              playsInline
              className="w-full h-full object-contain"
            />
          )}
        </div>

        {/* Dynamic Form Control Inputs */}
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
          <div className="flex gap-2">
            <textarea
              rows="1"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type a greeting or 'My name is Rithika'..."
              className="flex-1 min-h-[48px] px-4 py-3 bg-[#1a1b1d] border border-white/5 rounded-xl text-sm text-[#f5f5f5] focus:outline-none focus:border-white/20 transition-all font-sans"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 h-[48px] bg-[#f5f5f5] hover:bg-[#e5e5e5] text-[#202124] text-sm font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shadow-sm"
            >
              Translate
            </button>
          </div>
        </form>

        {/* Context Status Logger */}
        {!isLoading && (
          <footer className="mt-4 flex items-center justify-between border-t border-white/5 pt-3 text-[11px] font-mono text-neutral-500">
            <span>Status: {status}</span>
            <span>v1.0.0</span>
          </footer>
        )}

      </div>
    </main>
  );
}