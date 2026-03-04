import { useState, useRef } from 'react';
import { FileText, Star, Trash2 } from 'lucide-react';
import { NoteItem } from '@/hooks/useNotes';

interface SwipeableNoteCardProps {
  note: NoteItem;
  isActive: boolean;
  onLoad: (note: NoteItem) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

export default function SwipeableNoteCard({ note, isActive, onLoad, onDelete, onToggleFavorite }: SwipeableNoteCardProps) {
  const [offsetX, setOffsetX] = useState(0);
  const startX = useRef(0);
  const isDragging = useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    isDragging.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    const diff = e.touches[0].clientX - startX.current;
    // Only allow left swipe
    if (diff < 0) setOffsetX(Math.max(diff, -120));
    else setOffsetX(0);
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
    if (offsetX < -60) setOffsetX(-120);
    else setOffsetX(0);
  };

  return (
    <div className="relative overflow-hidden rounded-xl">
      {/* Action buttons behind */}
      <div className="absolute right-0 top-0 bottom-0 flex items-stretch">
        <button
          onClick={() => { onToggleFavorite(note.id); setOffsetX(0); }}
          className="w-[60px] flex items-center justify-center bg-amber-400 dark:bg-amber-500 text-card min-h-[48px]"
        >
          <Star size={18} fill={note.is_favorite ? 'currentColor' : 'none'} />
        </button>
        <button
          onClick={() => { onDelete(note.id); setOffsetX(0); }}
          className="w-[60px] flex items-center justify-center bg-destructive text-destructive-foreground min-h-[48px]"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* Card content */}
      <div
        className={`relative flex items-center gap-3 px-4 py-3 border transition-all min-h-[56px] ${
          isActive ? 'border-primary/40 bg-primary/5' : 'border-border bg-card'
        }`}
        style={{ transform: `translateX(${offsetX}px)`, transition: isDragging.current ? 'none' : 'transform 0.2s ease' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={() => { if (offsetX === 0) onLoad(note); }}
      >
        <FileText size={16} className="text-muted-foreground/50 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-foreground truncate">{note.title}</div>
          <div className="text-[11px] text-muted-foreground">
            {new Date(note.updated_at).toLocaleDateString('ko-KR')}
          </div>
        </div>
        {note.is_favorite && <Star size={14} className="text-amber-400 shrink-0" fill="currentColor" />}
      </div>
    </div>
  );
}
