"use client";

import { useState } from 'react';
import { Upload, ImageIcon, Loader2, Download, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { removeBackground } from '@imgly/background-removal';
import Upscaler from 'upscaler';
import defaultModel from '@upscalerjs/default-model';

interface ToolUIProps {
  toolId: string;
  title: string;
  description: string;
}

export function ToolUI({ toolId, title, description }: ToolUIProps) {
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileObject, setFileObject] = useState<File | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileObject(file);
      setImage(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  };

  const processImage = async () => {
    if (!image || !fileObject) return;
    setLoading(true);
    setError(null);
    
    try {
      if (toolId === 'remove-bg') {
        const imageBlob = await removeBackground(image);
        const url = URL.createObjectURL(imageBlob);
        setResult(url);
      } 
      else if (toolId === 'upscale') {
        const img = document.createElement('img');
        img.src = image;
        
        // Wait for image to load before upscaling
        await new Promise((resolve) => {
          img.onload = resolve;
        });

        // Prevent WebGL texture size crashes for massive images
        const canvas = document.createElement('canvas');
        const gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
        const maxTextureSize = gl ? gl.getParameter(gl.MAX_TEXTURE_SIZE) : 8192;
        
        // UpscalerJS default model is 2x
        const scale = 2; 
        const expectedWidth = img.width * scale;
        const expectedHeight = img.height * scale;

        if (expectedWidth > maxTextureSize || expectedHeight > maxTextureSize) {
          throw new Error(
            `Image is too large! Upscaling would create a ${expectedWidth}x${expectedHeight} image, ` +
            `but your GPU's maximum supported size is ${maxTextureSize}x${maxTextureSize}. ` +
            `Please use a smaller image.`
          );
        }

        const upscaler = new Upscaler({ model: defaultModel });
        const upscaledDataURL = await upscaler.upscale(img);
        setResult(upscaledDataURL);
      }
      else {
        throw new Error('Tool not implemented client-side yet.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during local processing.');
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
          <h3 className="text-xl font-semibold">Original Image</h3>
          
          <div className="relative aspect-square w-full rounded-2xl border-2 border-dashed border-card-border bg-card/50 overflow-hidden flex flex-col items-center justify-center transition-colors hover:bg-card">
            {image ? (
              <img src={image} alt="Original" className="w-full h-full object-contain p-2" />
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer p-6 text-center">
                <Upload className="w-10 h-10 mb-4 text-foreground/50" />
                <span className="text-sm font-medium mb-1">Click or drag image to upload</span>
                <span className="text-xs text-foreground/50">Supports JPG, PNG, WebP</span>
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
              </label>
            )}
          </div>
          
          {image && (
            <button 
              onClick={processImage}
              disabled={loading}
              className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Processing locally...</>
              ) : (
                <><Sparkles className="w-5 h-5" /> Generate</>
              )}
            </button>
          )}
          
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm">
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
                <span>Processing directly on your device...<br/>This may take a moment.</span>
              </div>
            ) : result ? (
              <img src={result} alt="Result" className="w-full h-full object-contain p-2" />
            ) : (
              <div className="flex flex-col items-center text-foreground/30">
                <ImageIcon className="w-12 h-12 mb-4" />
                <span>Output will appear here</span>
              </div>
            )}
          </div>
          
          {result && (
            <a 
              href={result}
              download
              target="_blank"
              rel="noreferrer"
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
