"use client";

import { useState, useRef } from 'react';
import { Loader2, Download, Mic, FileText, Music, Play, Type } from 'lucide-react';

interface AudioSuiteUIProps {
  toolId: string;
  title: string;
  description: string;
}

export function AudioSuiteUI({ toolId, title, description }: AudioSuiteUIProps) {
  const [activeTab, setActiveTab] = useState<'tts' | 'transcribe'>(toolId === 'transcribe' ? 'transcribe' : 'tts');
  
  // TTS State
  const [ttsPrompt, setTtsPrompt] = useState('');
  const [ttsResult, setTtsResult] = useState<string | null>(null);
  const [ttsLoading, setTtsLoading] = useState(false);
  
  // Transcribe State
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [transcribeResult, setTranscribeResult] = useState<string | null>(null);
  const [transcribeLoading, setTranscribeLoading] = useState(false);
  
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateSpeech = async () => {
    if (!ttsPrompt.trim()) return;
    setTtsLoading(true);
    setError(null);
    setTtsResult(null);
    
    try {
      const { puter } = await import('@heyputer/puter.js');
      const audioElement = await puter.ai.txt2speech(ttsPrompt);
      
      if (audioElement && audioElement.src) {
        setTtsResult(audioElement.src);
      } else {
        throw new Error('Failed to generate audio URL');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during generation.');
    } finally {
      setTtsLoading(false);
    }
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check if it's an audio file
    if (!file.type.startsWith('audio/')) {
      setError('Please upload a valid audio file.');
      return;
    }
    
    setAudioFile(file);
    setTranscribeResult(null);
    setError(null);
  };

  const transcribeAudio = async () => {
    if (!audioFile) return;
    setTranscribeLoading(true);
    setError(null);
    setTranscribeResult(null);
    
    try {
      const { puter } = await import('@heyputer/puter.js');
      // puter.ai.speech2txt expects a File or Blob
      const result = await puter.ai.speech2txt(audioFile);
      
      if (result && result.text) {
        setTranscribeResult(result.text);
      } else {
        throw new Error('Failed to transcribe audio.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during transcription.');
    } finally {
      setTranscribeLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">{title}</h1>
        <p className="text-foreground/70 text-lg">{description}</p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center gap-4 mb-4">
        <button
          onClick={() => { setActiveTab('tts'); setError(null); }}
          className={`px-6 py-3 rounded-full font-medium transition-all flex items-center gap-2 ${
            activeTab === 'tts' 
              ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' 
              : 'bg-card border border-card-border hover:border-primary/50 text-foreground/70'
          }`}
        >
          <Music className="w-4 h-4" /> Text to Speech
        </button>
        <button
          onClick={() => { setActiveTab('transcribe'); setError(null); }}
          className={`px-6 py-3 rounded-full font-medium transition-all flex items-center gap-2 ${
            activeTab === 'transcribe' 
              ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' 
              : 'bg-card border border-card-border hover:border-primary/50 text-foreground/70'
          }`}
        >
          <Mic className="w-4 h-4" /> Transcribe Audio
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="flex flex-col gap-4">
          <h3 className="text-xl font-semibold">
            {activeTab === 'tts' ? 'Enter text to synthesize' : 'Upload audio to transcribe'}
          </h3>
          
          {activeTab === 'tts' ? (
            <textarea
              className="w-full h-40 p-4 rounded-xl bg-card border border-card-border focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"
              placeholder="Hello world! Welcome to Omni AI..."
              value={ttsPrompt}
              onChange={(e) => setTtsPrompt(e.target.value)}
            />
          ) : (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-40 border-2 border-dashed border-primary/50 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-primary/5 transition-colors group relative overflow-hidden bg-card"
            >
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleAudioUpload}
                accept="audio/*"
                className="hidden" 
              />
              {audioFile ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-2">
                    <Music className="w-6 h-6 text-primary" />
                  </div>
                  <p className="font-semibold text-center px-4 truncate max-w-full">{audioFile.name}</p>
                  <p className="text-sm text-foreground/50">{(audioFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              ) : (
                <>
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Mic className="w-8 h-8 text-primary" />
                  </div>
                  <p className="font-semibold mb-1">Click to browse audio</p>
                  <p className="text-sm text-foreground/50">MP3, WAV, M4A, etc.</p>
                </>
              )}
            </div>
          )}

          <button 
            onClick={activeTab === 'tts' ? generateSpeech : transcribeAudio}
            disabled={(activeTab === 'tts' && (!ttsPrompt.trim() || ttsLoading)) || (activeTab === 'transcribe' && (!audioFile || transcribeLoading))}
            className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50 mt-4"
          >
            {(activeTab === 'tts' ? ttsLoading : transcribeLoading) ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
            ) : activeTab === 'tts' ? (
              <><Play className="w-5 h-5" /> Generate Audio</>
            ) : (
              <><Type className="w-5 h-5" /> Transcribe</>
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
          <div className="relative aspect-video w-full rounded-2xl border border-card-border bg-card overflow-hidden flex flex-col items-center justify-center p-6">
            {(activeTab === 'tts' ? ttsLoading : transcribeLoading) ? (
              <div className="flex flex-col items-center text-foreground/50 text-center">
                <Loader2 className="w-10 h-10 animate-spin mb-4 text-primary" />
                <span>Puter is processing...<br/><span className="text-sm">This can take a moment.</span></span>
              </div>
            ) : activeTab === 'tts' && ttsResult ? (
              <div className="w-full flex flex-col items-center gap-6">
                <Music className="w-16 h-16 text-primary mb-2" />
                <audio src={ttsResult} controls className="w-full" autoPlay />
              </div>
            ) : activeTab === 'transcribe' && transcribeResult ? (
              <div className="w-full h-full flex flex-col">
                <div className="flex-1 overflow-y-auto bg-background/50 rounded-lg p-4 text-foreground text-lg whitespace-pre-wrap">
                  {transcribeResult}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center text-foreground/30">
                {activeTab === 'tts' ? <Play className="w-12 h-12 mb-4" /> : <FileText className="w-12 h-12 mb-4" />}
                <span>Your result will appear here</span>
              </div>
            )}
          </div>
          
          {activeTab === 'tts' && ttsResult && (
            <a 
              href={ttsResult}
              download="generated-speech.mp3"
              className="w-full py-4 rounded-xl bg-card border border-card-border text-foreground font-bold text-lg flex items-center justify-center gap-2 hover:bg-card-border/50 transition-colors"
            >
              <Download className="w-5 h-5" /> Download Audio
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
