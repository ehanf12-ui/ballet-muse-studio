import { useState } from 'react';
import { ChevronDown, ChevronUp, Youtube } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

function extractVideoId(url: string): string | null {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/);
  return match?.[1] ?? null;
}

interface YouTubeEmbedProps {
  url: string;
  compact?: boolean;
}

export default function YouTubeEmbed({ url, compact }: YouTubeEmbedProps) {
  const videoId = extractVideoId(url);
  const [open, setOpen] = useState(false);

  if (!videoId) return null;

  const iframe = (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-border bg-black">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`}
        className="absolute inset-0 w-full h-full"
        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title="YouTube video"
      />
    </div>
  );

  if (compact) {
    return (
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger className="flex items-center gap-1.5 text-[10px] font-bold text-red-500 hover:text-red-600 transition-colors py-1">
          <Youtube size={14} />
          영상 {open ? '접기' : '펼치기'}
          {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-1">
          {iframe}
        </CollapsibleContent>
      </Collapsible>
    );
  }

  return iframe;
}

export { extractVideoId };
