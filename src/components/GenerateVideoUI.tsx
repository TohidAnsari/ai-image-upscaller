"use client";

import { useState } from 'react';
import { Loader2, Download, Video, Film } from 'lucide-react';

interface GenerateVideoUIProps {
  toolId: string;
  title: string;
  description: string;
}

export function GenerateVideoUI({ title, description }: GenerateVideoUIProps) {
  const [prompt, setPrompt] = useState<string>('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [model, setModel] = useState<string>('google/veo-3.1-fast');

  const generateVideo = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      // Use dynamic import for puter to avoid SSR issues
      const { puter } = await import('@heyputer/puter.js');
      
      const videoElement = await puter.ai.txt2vid(prompt, { model });
      
      // puter.ai.txt2vid returns an HTMLVideoElement, we can extract the src
      if (videoElement && videoElement.src) {
        setResult(videoElement.src);
      } else {
        throw new Error('Failed to generate video URL');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during generation. Make sure you are signed in to Puter if prompted.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">{title}</h1>
        <p className="text-foreground/70 text-lg">{description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="flex flex-col gap-4">
          <h3 className="text-xl font-semibold">Describe your video</h3>
          
          <textarea
            className="w-full h-40 p-4 rounded-xl bg-card border border-card-border focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"
            placeholder="A cinematic drone shot over a glowing cyberpunk city..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />

          <div className="flex flex-col gap-2 mt-2">
            <label className="text-sm font-medium text-foreground/70">Model</label>
            <select 
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="p-3 rounded-lg bg-card border border-card-border outline-none"
            >
              <optgroup label="Free & Fast Models">
                <option value="google/veo-3.1-fast">Google Veo 3.1 Fast</option>
                <option value="wan-ai/wan2.2-t2v-a14b">Wan 2.2 T2V 14B</option>
              </optgroup>
              <optgroup label="Pro Models (May require credits)">
                <option value="google/veo-3.1">Google Veo 3.1</option>
                <option value="openai/sora-2">Sora 2</option>
                <option value="openai/sora-2-pro">Sora 2 Pro</option>
              </optgroup>
            </select>
          </div>

          <button 
            onClick={generateVideo}
            disabled={loading || !prompt.trim()}
            className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50 mt-4"
          >
            {loading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Generating Video...</>
            ) : (
              <><Video className="w-5 h-5" /> Generate Video</>
            )}
          </button>
          
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm mt-2">
              {error}
            </div>
          )}
        </div>

        {/* Output Section */}
        <div className="flex flex-col gap-4">
          <h3 className="text-xl font-semibold">Result</h3>
          <div className="relative aspect-video w-full rounded-2xl border border-card-border bg-card overflow-hidden flex flex-col items-center justify-center">
            {loading ? (
              <div className="flex flex-col items-center text-foreground/50 text-center px-4">
                <Loader2 className="w-10 h-10 animate-spin mb-4 text-primary" />
                <span>Puter is generating your video...<br/><span className="text-sm">This can take a minute.</span></span>
              </div>
            ) : result ? (
              <video src={result} controls autoPlay loop className="w-full h-full object-contain bg-black" />
            ) : (
              <div className="flex flex-col items-center text-foreground/30">
                <Film className="w-12 h-12 mb-4" />
                <span>Your video will appear here</span>
              </div>
            )}
          </div>
          
          {result && (
            <a 
              href={result}
              download="generated-video.mp4"
              className="w-full py-4 rounded-xl bg-card border border-card-border text-foreground font-bold text-lg flex items-center justify-center gap-2 hover:bg-card-border/50 transition-colors"
            >
              <Download className="w-5 h-5" /> Download Result
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
