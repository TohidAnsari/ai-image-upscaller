"use client";

import { useState } from 'react';
import { Loader2, Download, Sparkles, Wand2 } from 'lucide-react';
import Image from 'next/image';

interface GenerateImageUIProps {
  toolId: string;
  title: string;
  description: string;
}

export function GenerateImageUI({ title, description }: GenerateImageUIProps) {
  const [prompt, setPrompt] = useState<string>('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [model, setModel] = useState<string>('google/gemini-3.1-flash-image-preview');

  const generateImage = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);
    
    try {
      // Use dynamic import for puter to avoid SSR issues
      const { puter } = await import('@heyputer/puter.js');
      
      const imgElement = await puter.ai.txt2img(prompt, { model });
      
      // puter.ai.txt2img returns an HTMLImageElement, we can extract the src
      if (imgElement && imgElement.src) {
        setResult(imgElement.src);
      } else {
        throw new Error('Failed to generate image URL');
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
          <h3 className="text-xl font-semibold">Describe your image</h3>
          
          <textarea
            className="w-full h-40 p-4 rounded-xl bg-card border border-card-border focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"
            placeholder="A futuristic city with flying cars at sunset..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground/70">Model</label>
            <select 
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="p-3 rounded-lg bg-card border border-card-border outline-none"
            >
              <optgroup label="Fast & Free Models">
                <option value="google/gemini-3.1-flash-image-preview">Gemini Flash Image</option>
                <option value="google/imagen-4.0-fast">Imagen 4.0 Fast</option>
                <option value="openai/gpt-image-1-mini">GPT Image Mini</option>
                <option value="black-forest-labs/flux-2-klein-4b">Flux Klein 4B</option>
                <option value="black-forest-labs/flux-2-klein-9b-base">Flux Klein 9B</option>
              </optgroup>
              <optgroup label="Standard Models">
                <option value="openai/gpt-image-2">GPT Image 2</option>
                <option value="openai/gpt-image-1.5">GPT Image 1.5</option>
                <option value="qwen/qwen-image-2.0">Qwen Image 2.0</option>
                <option value="qwen/qwen-image">Qwen Image</option>
                <option value="x-ai/grok-imagine-image">Grok Imagine</option>
              </optgroup>
              <optgroup label="Pro Models (May require credits)">
                <option value="black-forest-labs/flux-2-pro">FLUX.2 [pro]</option>
                <option value="google/gemini-3-pro-image-preview">Nano Banana Pro</option>
                <option value="google/imagen-4.0-ultra">Imagen 4.0 Ultra</option>
                <option value="qwen/qwen-image-2.0-pro">Qwen Image 2.0 Pro</option>
                <option value="x-ai/grok-imagine-image-quality">Grok Imagine Quality</option>
              </optgroup>
            </select>
          </div>
          
          <button 
            onClick={generateImage}
            disabled={loading || !prompt.trim()}
            className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50 mt-4"
          >
            {loading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Generating...</>
            ) : (
              <><Wand2 className="w-5 h-5" /> Generate Image</>
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
          <div className="relative aspect-square w-full rounded-2xl border border-card-border bg-card overflow-hidden flex flex-col items-center justify-center">
            {loading ? (
              <div className="flex flex-col items-center text-foreground/50 text-center px-4">
                <Loader2 className="w-10 h-10 animate-spin mb-4 text-primary" />
                <span>Puter is generating your image...<br/><span className="text-sm">(If this is your first time, a popup might ask you to sign in)</span></span>
              </div>
            ) : result ? (
              <img src={result} alt="Result" className="w-full h-full object-contain p-2" />
            ) : (
              <div className="flex flex-col items-center text-foreground/30">
                <Sparkles className="w-12 h-12 mb-4" />
                <span>Your masterpiece will appear here</span>
              </div>
            )}
          </div>
          
          {result && (
            <a 
              href={result}
              download="generated-image.png"
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
