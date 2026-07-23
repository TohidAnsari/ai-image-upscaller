"use client";

import { useState, useRef, useEffect } from 'react';
import { Loader2, Image as ImageIcon, MessageSquare, FileText, Send } from 'lucide-react';
import Image from 'next/image';

interface VisionUIProps {
  toolId: string;
  title: string;
  description: string;
}

export function VisionUI({ toolId, title, description }: VisionUIProps) {
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Chat State
  const [chatPrompt, setChatPrompt] = useState('Describe this image in detail.');
  const [chatResult, setChatResult] = useState<string | null>(null);
  const [chatLoading, setChatLoading] = useState(false);
  
  const [error, setError] = useState<string | null>(null);

  // Clean up object URL to prevent memory leaks
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file.');
      return;
    }
    
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setChatResult(null);
    setError(null);
  };

  const processVisionChat = async () => {
    if (!imageFile || !chatPrompt.trim()) return;
    setChatLoading(true);
    setError(null);
    setChatResult(null);
    
    try {
      const { puter } = await import('@heyputer/puter.js');
      // Pass the prompt and the image file directly to Puter
      const result = await puter.ai.chat(chatPrompt, imageFile);
      
      if (result && result.message && result.message.content) {
        setChatResult(result.message.content);
      } else if (typeof result === 'string') {
        setChatResult(result);
      } else {
        throw new Error('Failed to get a response from the Vision Assistant.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during vision analysis.');
    } finally {
      setChatLoading(false);
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
          <h3 className="text-xl font-semibold">Upload Image</h3>
          
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-64 border-2 border-dashed border-primary/50 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-primary/5 transition-colors group relative overflow-hidden bg-card"
          >
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden" 
            />
            {imagePreview ? (
              <Image src={imagePreview} alt="Upload preview" fill className="object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
            ) : null}
            
            <div className="relative z-10 flex flex-col items-center p-4 bg-background/50 rounded-xl backdrop-blur-sm pointer-events-none">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ImageIcon className="w-8 h-8 text-primary" />
              </div>
              <p className="font-semibold mb-1">{imageFile ? 'Change Image' : 'Click to browse'}</p>
              <p className="text-sm text-foreground/80">JPG, PNG, WebP</p>
            </div>
          </div>

          <div className="flex flex-col gap-2 mt-2">
            <label className="text-sm font-medium text-foreground/70">Ask about the image</label>
            <textarea
              className="w-full h-24 p-3 rounded-xl bg-card border border-card-border focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"
              placeholder="What is in this image?"
              value={chatPrompt}
              onChange={(e) => setChatPrompt(e.target.value)}
            />
          </div>

          <button 
            onClick={processVisionChat}
            disabled={!imageFile || chatLoading}
            className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50 mt-4"
          >
            {chatLoading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
            ) : (
              <><Send className="w-5 h-5" /> Ask AI</>
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
          <div className="relative h-[400px] w-full rounded-2xl border border-card-border bg-card overflow-hidden flex flex-col p-6">
            {chatLoading ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-foreground/50 text-center">
                <Loader2 className="w-10 h-10 animate-spin mb-4 text-primary" />
                <span>Puter AI is analyzing the image...</span>
              </div>
            ) : chatResult ? (
              <div className="w-full h-full flex flex-col gap-4">
                <div className="flex items-center gap-2 text-primary font-medium border-b border-card-border pb-2">
                  <MessageSquare className="w-5 h-5" /> AI Response
                </div>
                <div className="flex-1 overflow-y-auto text-foreground/90 whitespace-pre-wrap leading-relaxed pr-2">
                  {chatResult}
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-foreground/30">
                <MessageSquare className="w-12 h-12 mb-4" />
                <span>Your result will appear here</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
