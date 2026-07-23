import Link from 'next/link';
import { Sparkles, Image as ImageIcon, Wand2, Zap, Upload } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center bg-background w-full">
      {/* Hero Section */}
      <section className="w-full flex flex-col items-center text-center py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] -z-10" />
        
        <div className="animate-fade-in max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
            Transform Images with <br />
            <span className="text-primary">Next-Gen AI</span>
          </h1>
          <p className="text-lg md:text-xl text-foreground/70 mb-10 max-w-2xl mx-auto">
            Upscale to 8K, seamlessly remove backgrounds, restore pixelated photos, and generate stunning art. Your all-in-one AI image toolkit.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/tools" className="flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-full text-lg font-semibold hover:bg-primary/90 transition-all shadow-[0_0_40px_rgba(99,102,241,0.4)] hover:shadow-[0_0_60px_rgba(99,102,241,0.6)]">
              <Sparkles className="w-5 h-5" />
              Try Tools for Free
            </Link>
            <Link href="/login" className="flex items-center gap-2 px-8 py-4 rounded-full text-lg font-semibold bg-card border border-card-border hover:bg-card-border transition-colors">
              View Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-24 grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          {
            icon: <Zap className="w-8 h-8 text-yellow-500" />,
            title: "8K Upscaling",
            desc: "Enhance image resolution instantly without losing quality."
          },
          {
            icon: <Wand2 className="w-8 h-8 text-pink-500" />,
            title: "Background Removal",
            desc: "Isolate subjects perfectly with state-of-the-art precision."
          },
          {
            icon: <ImageIcon className="w-8 h-8 text-blue-500" />,
            title: "Image Restoration",
            desc: "Clear blurry and pixelated photos back to their former glory."
          }
        ].map((feature, i) => (
          <div key={i} className="bg-card border border-card-border p-8 rounded-2xl hover:border-primary/50 transition-colors group">
            <div className="bg-background/50 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              {feature.icon}
            </div>
            <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
            <p className="text-foreground/70">{feature.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
