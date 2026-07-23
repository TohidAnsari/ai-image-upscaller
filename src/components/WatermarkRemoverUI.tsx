"use client";

import { useState, useRef, useEffect } from 'react';
import { Loader2, Download, Eraser, Image as ImageIcon, RotateCcw, Paintbrush } from 'lucide-react';
import Image from 'next/image';

interface WatermarkRemoverUIProps {
  toolId: string;
  title: string;
  description: string;
}

export function WatermarkRemoverUI({ title, description }: WatermarkRemoverUIProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [brushSize, setBrushSize] = useState(20);
  const [isDrawing, setIsDrawing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    return () => {
      if (imageSrc) URL.revokeObjectURL(imageSrc);
      if (result) URL.revokeObjectURL(result);
    };
  }, [imageSrc, result]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file.');
      return;
    }
    
    if (imageSrc) URL.revokeObjectURL(imageSrc);
    if (result) URL.revokeObjectURL(result);
    
    const url = URL.createObjectURL(file);
    setImageFile(file);
    setImageSrc(url);
    setResult(null);
    setError(null);
  };

  const initCanvas = () => {
    if (!imageRef.current || !canvasRef.current || !maskCanvasRef.current) return;
    
    const img = imageRef.current;
    const canvas = canvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    
    // Set native canvas resolution to match image
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    maskCanvas.width = img.naturalWidth;
    maskCanvas.height = img.naturalHeight;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(img, 0, 0);
    }
  };

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }
    
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (result) return; // Prevent drawing on result
    e.preventDefault();
    setIsDrawing(true);
    draw(e);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !maskCanvasRef.current) return;
    e.preventDefault();
    
    const ctx = maskCanvasRef.current.getContext('2d');
    if (!ctx) return;
    
    const { x, y } = getCoordinates(e, maskCanvasRef.current);
    
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = brushSize * (maskCanvasRef.current.width / maskCanvasRef.current.clientWidth); 
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.8)'; // Red mask for UI
    ctx.fillStyle = 'rgba(239, 68, 68, 0.8)';
    
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, y, ctx.lineWidth / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const ctx = maskCanvasRef.current?.getContext('2d');
    if (ctx) ctx.beginPath();
  };

  const clearMask = () => {
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;
    const ctx = maskCanvas.getContext('2d');
    ctx?.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
  };

  const resetAll = () => {
    setImageFile(null);
    setImageSrc(null);
    setResult(null);
  };

  // Local Fast Marching Method (FMM) / Boundary Fill Inpainting + Smoothing
  const processInpainting = async () => {
    const canvas = canvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    if (!canvas || !maskCanvas) return;
    
    setLoading(true);
    setError(null);
    
    // We use a small timeout to let the UI update to "loading" state before freezing the main thread
    await new Promise(resolve => setTimeout(resolve, 50));
    
    try {
      const ctx = canvas.getContext('2d');
      const maskCtx = maskCanvas.getContext('2d', { willReadFrequently: true });
      if (!ctx || !maskCtx) throw new Error("Failed to get canvas context");
      
      const width = canvas.width;
      const height = canvas.height;
      
      const imgData = ctx.getImageData(0, 0, width, height);
      const maskData = maskCtx.getImageData(0, 0, width, height);
      
      const { data } = imgData;
      const { data: mask } = maskData;
      
      const status = new Uint8Array(width * height);
      const originalMask = new Uint8Array(width * height);
      let maskedCount = 0;
      
      // Initialize status
      for (let i = 0; i < width * height; i++) {
        if (mask[i * 4 + 3] > 0) { // Alpha > 0 means masked
          status[i] = 1;
          originalMask[i] = 1;
          maskedCount++;
        }
      }
      
      if (maskedCount === 0) {
        setLoading(false);
        setError("Please highlight the watermark first by drawing over it.");
        return;
      }

      const maxIterations = Math.max(width, height);
      const readData = new Uint8ClampedArray(data);
      
      // 1. Iterative boundary fill
      for (let iter = 0; iter < maxIterations && maskedCount > 0; iter++) {
        let filledThisRound = false;
        
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            const idx = y * width + x;
            
            if (status[idx] === 1) {
              let r = 0, g = 0, b = 0, a = 0, count = 0;
              
              for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                  if (dx === 0 && dy === 0) continue;
                  const ny = y + dy;
                  const nx = x + dx;
                  
                  if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
                    const nIdx = ny * width + nx;
                    if (status[nIdx] === 0) { // Known pixel
                      const pIdx = nIdx * 4;
                      r += readData[pIdx];
                      g += readData[pIdx + 1];
                      b += readData[pIdx + 2];
                      a += readData[pIdx + 3];
                      count++;
                    }
                  }
                }
              }
              
              if (count > 0) {
                const pIdx = idx * 4;
                data[pIdx] = r / count;
                data[pIdx + 1] = g / count;
                data[pIdx + 2] = b / count;
                data[pIdx + 3] = a / count;
                
                status[idx] = 2; // Mark as filled this round
                filledThisRound = true;
              }
            }
          }
        }
        
        if (!filledThisRound) break;
        
        // Commit
        for (let i = 0; i < status.length; i++) {
          if (status[i] === 2) {
            status[i] = 0;
            maskedCount--;
            const pIdx = i * 4;
            readData[pIdx] = data[pIdx];
            readData[pIdx+1] = data[pIdx+1];
            readData[pIdx+2] = data[pIdx+2];
            readData[pIdx+3] = data[pIdx+3];
          }
        }
      }
      
      // 2. Smoothing Pass (Box Blur over inpainted area)
      const blurData = new Uint8ClampedArray(data);
      const blurRadius = 2; // adjust this for more/less smoothing
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx = y * width + x;
          if (originalMask[idx] === 1) { // Only smooth inpainted pixels
            let r = 0, g = 0, b = 0, a = 0, count = 0;
            for (let dy = -blurRadius; dy <= blurRadius; dy++) {
              for (let dx = -blurRadius; dx <= blurRadius; dx++) {
                const ny = y + dy;
                const nx = x + dx;
                if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
                  const nIdx = (ny * width + nx) * 4;
                  r += blurData[nIdx];
                  g += blurData[nIdx + 1];
                  b += blurData[nIdx + 2];
                  a += blurData[nIdx + 3];
                  count++;
                }
              }
            }
            if (count > 0) {
              const pIdx = idx * 4;
              data[pIdx] = r / count;
              data[pIdx + 1] = g / count;
              data[pIdx + 2] = b / count;
              data[pIdx + 3] = a / count;
            }
          }
        }
      }
      
      // Draw result back to canvas
      ctx.putImageData(imgData, 0, 0);
      
      // Create blob for download
      canvas.toBlob((blob) => {
        if (blob) {
          if (result) URL.revokeObjectURL(result);
          setResult(URL.createObjectURL(blob));
        }
        setLoading(false);
      }, 'image/png');
      
    } catch (err: any) {
      console.error(err);
      setError("An error occurred during processing.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">{title}</h1>
        <p className="text-foreground/70 text-lg">{description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-8">
        
        {/* Editor Section */}
        <div className="flex flex-col gap-4">
          <div className="bg-card border border-card-border rounded-2xl p-4 flex flex-col items-center justify-center min-h-[500px] relative overflow-hidden">
            {!imageSrc ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-full border-2 border-dashed border-primary/50 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-primary/5 transition-colors group"
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden" 
                />
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <ImageIcon className="w-8 h-8 text-primary" />
                </div>
                <p className="font-semibold text-lg mb-1">Click to upload image</p>
                <p className="text-foreground/60 text-sm">JPG, PNG, WebP supported</p>
              </div>
            ) : (
              <div className="relative w-full h-full flex items-center justify-center bg-black/5 rounded-xl overflow-hidden">
                <img 
                  ref={imageRef}
                  src={imageSrc} 
                  alt="Original" 
                  className="hidden" // Hidden original for drawing to canvas
                  onLoad={initCanvas}
                />
                
                {/* Result Image */}
                {result ? (
                  <img src={result} alt="Result" className="max-w-full max-h-full object-contain" />
                ) : (
                  /* Editing Canvases */
                  <div className="relative max-w-full max-h-full aspect-auto inline-block">
                    <canvas 
                      ref={canvasRef} 
                      className="max-w-full max-h-full object-contain block"
                    />
                    <canvas 
                      ref={maskCanvasRef}
                      className="absolute top-0 left-0 w-full h-full touch-none cursor-crosshair opacity-80"
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                    />
                  </div>
                )}
                
                {loading && (
                  <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                    <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                    <p className="text-lg font-medium animate-pulse">Removing watermark locally...</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Controls Section */}
        <div className="flex flex-col gap-6">
          <div className="bg-card border border-card-border rounded-2xl p-6 flex flex-col gap-6">
            <h3 className="text-xl font-bold">Tools</h3>
            
            {!result ? (
              <>
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-foreground/80 flex items-center gap-2">
                      <Paintbrush className="w-4 h-4" /> Brush Size
                    </label>
                    <span className="text-xs font-mono bg-background px-2 py-1 rounded">{brushSize}px</span>
                  </div>
                  <input 
                    type="range" 
                    min="5" 
                    max="100" 
                    value={brushSize} 
                    onChange={(e) => setBrushSize(Number(e.target.value))}
                    className="w-full accent-primary"
                    disabled={!imageSrc || loading}
                  />
                  <p className="text-xs text-foreground/50 mt-1">
                    Paint over the watermark or text you want to remove.
                  </p>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={clearMask}
                    disabled={!imageSrc || loading}
                    className="flex-1 py-3 rounded-xl bg-background border border-card-border hover:bg-card-border/50 text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    Clear Brush
                  </button>
                  <button 
                    onClick={resetAll}
                    disabled={!imageSrc || loading}
                    className="flex-1 py-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    Reset All
                  </button>
                </div>

                <button 
                  onClick={processInpainting}
                  disabled={!imageSrc || loading}
                  className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50 mt-2 shadow-lg shadow-primary/20"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Eraser className="w-5 h-5" />}
                  Remove Watermark
                </button>
              </>
            ) : (
              <>
                <a 
                  href={result}
                  download="watermark-removed.png"
                  className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                >
                  <Download className="w-5 h-5" /> Download Image
                </a>
                
                <button 
                  onClick={() => {
                    setResult(null);
                    clearMask();
                  }}
                  className="w-full py-4 rounded-xl bg-card border border-card-border text-foreground font-bold flex items-center justify-center gap-2 hover:bg-card-border/50 transition-colors"
                >
                  <RotateCcw className="w-5 h-5" /> Edit Again
                </button>
              </>
            )}

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
