import Link from 'next/link';
import { Zap, Wand2, Image as ImageIcon, Sparkles, Video, Music, Mic, MessageSquare, FileText, Eraser } from 'lucide-react';

export default function ToolsPage() {
  const categories = [
    {
      title: "Image & Vision",
      tools: [
        {
          id: "generate",
          name: "AI Image Generation",
          description: "Describe an image and generate it instantly.",
          icon: <Sparkles className="w-6 h-6 text-purple-500" />
        },
        {
          id: "upscale",
          name: "AI Upscaling",
          description: "Upscale images client-side directly in browser.",
          icon: <Zap className="w-6 h-6 text-yellow-500" />
        },
        {
          id: "remove-bg",
          name: "Background Removal",
          description: "Instantly isolate subjects from their backgrounds.",
          icon: <Wand2 className="w-6 h-6 text-pink-500" />
        },
        {
          id: "chat",
          name: "Vision Chat",
          description: "Chat with a multimodal AI about an image.",
          icon: <MessageSquare className="w-6 h-6 text-blue-500" />
        },
        {
          id: "watermark",
          name: "Watermark Remover",
          description: "Paint over watermarks or text to instantly erase them.",
          icon: <Eraser className="w-6 h-6 text-teal-500" />
        }
      ]
    },
    {
      title: "Video",
      tools: [
        {
          id: "video",
          name: "Text to Video",
          description: "Generate short videos from a text prompt.",
          icon: <Video className="w-6 h-6 text-red-500" />
        }
      ]
    },
    {
      title: "Audio",
      tools: [
        {
          id: "tts",
          name: "Text to Speech",
          description: "Synthesize lifelike speech from text.",
          icon: <Music className="w-6 h-6 text-cyan-500" />
        },
        {
          id: "transcribe",
          name: "Audio Transcription",
          description: "Transcribe audio files directly to text.",
          icon: <Mic className="w-6 h-6 text-orange-500" />
        }
      ]
    }
  ];

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold mb-4">Omni AI Studio</h1>
      <p className="text-foreground/70 mb-10 text-lg">Select a tool below to explore the AI capabilities.</p>
      
      <div className="flex flex-col gap-12">
        {categories.map((category, index) => (
          <div key={index}>
            <h2 className="text-2xl font-bold mb-6 text-foreground/90 border-b border-card-border pb-2">{category.title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {category.tools.map(tool => (
                <Link key={tool.id} href={`/tools/${tool.id}`} className="bg-card border border-card-border p-6 rounded-2xl hover:border-primary/50 hover:bg-card-border/30 transition-all group cursor-pointer block">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="bg-background/50 p-3 rounded-lg group-hover:scale-110 transition-transform">
                      {tool.icon}
                    </div>
                    <h3 className="text-xl font-semibold">{tool.name}</h3>
                  </div>
                  <p className="text-foreground/70 text-sm">{tool.description}</p>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
