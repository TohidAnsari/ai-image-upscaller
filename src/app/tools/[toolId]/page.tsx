import { ToolUI } from '@/components/ToolUI';
import { GenerateImageUI } from '@/components/GenerateImageUI';
import { GenerateVideoUI } from '@/components/GenerateVideoUI';
import { AudioSuiteUI } from '@/components/AudioSuiteUI';
import { VisionUI } from '@/components/VisionUI';
import { WatermarkRemoverUI } from '@/components/WatermarkRemoverUI';
import { notFound } from 'next/navigation';

export function generateStaticParams() {
  return [
    { toolId: 'generate' },
    { toolId: 'upscale' },
    { toolId: 'remove-bg' },
    { toolId: 'watermark' },
    { toolId: 'chat' },
    { toolId: 'ocr' },
    { toolId: 'video' },
    { toolId: 'tts' },
    { toolId: 'transcribe' },
  ];
}

const toolsData: Record<string, { title: string; description: string }> = {
  'generate': {
    title: 'AI Image Generation',
    description: 'Describe an image and let Puter.js generate it instantly for free.',
  },
  'upscale': {
    title: 'AI Upscaling',
    description: 'Enhance your images resolution client-side without losing quality.',
  },
  'remove-bg': {
    title: 'Background Removal',
    description: 'Instantly isolate the main subject of your image locally in your browser.',
  },
  'watermark': {
    title: 'Watermark Remover',
    description: 'Paint over any watermark or text to seamlessly erase it from your image locally.',
  },
  'chat': {
    title: 'Vision Chat',
    description: 'Upload an image and chat with an AI about its contents.',
  },
  'ocr': {
    title: 'Text Extractor (OCR)',
    description: 'Instantly extract written text from any uploaded image.',
  },
  'video': {
    title: 'Text to Video',
    description: 'Generate stunning short videos from a text prompt.',
  },
  'tts': {
    title: 'Text to Speech',
    description: 'Synthesize highly realistic speech from text.',
  },
  'transcribe': {
    title: 'Audio Transcription',
    description: 'Transcribe your audio files directly to text using AI.',
  }
};

export default async function ToolPage({ params }: { params: Promise<{ toolId: string }> }) {
  const { toolId } = await params;
  
  const tool = toolsData[toolId];

  if (!tool) {
    notFound();
  }

  let ToolComponent;

  if (toolId === 'generate') {
    ToolComponent = <GenerateImageUI toolId={toolId} title={tool.title} description={tool.description} />;
  } else if (toolId === 'video') {
    ToolComponent = <GenerateVideoUI toolId={toolId} title={tool.title} description={tool.description} />;
  } else if (toolId === 'tts' || toolId === 'transcribe') {
    ToolComponent = <AudioSuiteUI toolId={toolId} title={tool.title} description={tool.description} />;
  } else if (toolId === 'chat' || toolId === 'ocr') {
    ToolComponent = <VisionUI toolId={toolId} title={tool.title} description={tool.description} />;
  } else if (toolId === 'watermark') {
    ToolComponent = <WatermarkRemoverUI toolId={toolId} title={tool.title} description={tool.description} />;
  } else {
    ToolComponent = <ToolUI toolId={toolId} title={tool.title} description={tool.description} />;
  }

  return (
    <div className="flex-1 w-full py-12 px-4 sm:px-6 lg:px-8">
      {ToolComponent}
    </div>
  );
}
