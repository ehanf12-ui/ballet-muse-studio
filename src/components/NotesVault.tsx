import { useState, useMemo } from 'react';
import { Folder, Trash2, Loader2, FileText, Star, List, CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { NoteItem } from '@/hooks/useNotes';
import { Calendar } from '@/components/ui/calendar';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '@/components/ui/carousel';

interface NotesVaultProps {
  notes: NoteItem[];
  loading: boolean;
  currentNoteId: string | null;
  onLoad: (note: NoteItem) => void;
  onDelete: (noteId: string) => void;
  onToggleFavorite: (noteId: string) => void;
}

type ViewMode = 'list' | 'calendar';

export default function NotesVault({ notes, loading, currentNoteId, onLoad, onDelete, onToggleFavorite }: NotesVaultProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  // Favorites (best 5)
  const favorites = useMemo(() =>
    notes.filter(n => n.is_favorite).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5),
    [notes]
  );

  // Dates with notes
  const noteDates = useMemo(() => {
    const dates = new Set<string>();
    notes.forEach(n => dates.add(new Date(n.created_at).toDateString()));
    return dates;
  }, [notes]);

  // Filter notes by selected date
  const filteredNotes = useMemo(() => {
    if (viewMode === 'calendar' && selectedDate) {
      return notes.filter(n => new Date(n.created_at).toDateString() === selectedDate.toDateString());
    }
    return notes;
  }, [notes, viewMode, selectedDate]);

  const renderNoteCard = (note: NoteItem) => (
    <div
      key={note.id}
      className={`group flex items-center gap-2 px-3 py-2 rounded-xl border transition-all cursor-pointer ${
        currentNoteId === note.id
          ? 'border-primary/40 bg-primary/5'
          : 'border-border bg-card hover:border-primary/30'
      }`}
      onClick={() => onLoad(note)}
    >
      <FileText size={12} className="text-muted-foreground/50 shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-[11px] font-bold text-foreground truncate">{note.title}</div>
        <div className="text-[9px] text-muted-foreground">
          {new Date(note.updated_at).toLocaleDateString('ko-KR')}
        </div>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onToggleFavorite(note.id); }}
        className={`transition-all ${note.is_favorite ? 'text-amber-400' : 'opacity-0 group-hover:opacity-100 text-muted-foreground/40 hover:text-amber-400'}`}
      >
        <Star size={12} fill={note.is_favorite ? 'currentColor' : 'none'} />
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(note.id); }}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground/40 hover:text-destructive"
      >
        <Trash2 size={12} />
      </button>
    </div>
  );

  return (
    <div className="space-y-2">
      {/* Header + View Toggle */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Folder size={10} className="text-muted-foreground" />
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">내 보관함</span>
          <span className="text-[9px] text-muted-foreground/60 font-bold">{notes.length}</span>
        </div>
        <div className="flex bg-muted p-0.5 rounded-lg">
          <button
            onClick={() => setViewMode('list')}
            className={`p-1 rounded transition-all ${viewMode === 'list' ? 'bg-card shadow-sm text-primary' : 'text-muted-foreground'}`}
          >
            <List size={12} />
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`p-1 rounded transition-all ${viewMode === 'calendar' ? 'bg-card shadow-sm text-primary' : 'text-muted-foreground'}`}
          >
            <CalendarDays size={12} />
          </button>
        </div>
      </div>

      {/* Best 5 Favorites Carousel */}
      {favorites.length > 0 && (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 px-1">
            <Star size={9} className="text-amber-400" fill="currentColor" />
            <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">즐겨찾는 순서</span>
          </div>
          <Carousel opts={{ align: 'start' }} className="w-full">
            <CarouselContent className="-ml-1">
              {favorites.map(note => (
                <CarouselItem key={note.id} className="pl-1 basis-[45%]">
                  <div
                    onClick={() => onLoad(note)}
                    className="p-2 rounded-lg border border-amber-200/50 bg-amber-50/30 dark:bg-amber-900/10 dark:border-amber-800/30 cursor-pointer hover:border-amber-300 transition-all"
                  >
                    <div className="text-[10px] font-bold text-foreground truncate">{note.title}</div>
                    <div className="text-[8px] text-muted-foreground mt-0.5">
                      {new Date(note.created_at).toLocaleDateString('ko-KR')}
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-4">
          <Loader2 size={16} className="animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Calendar View */}
      {viewMode === 'calendar' && !loading && (
        <div className="flex justify-center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="p-2 pointer-events-auto text-[10px] scale-90 origin-top"
            modifiers={{ hasNote: (date) => noteDates.has(date.toDateString()) }}
            modifiersStyles={{ hasNote: { backgroundColor: 'hsl(var(--primary) / 0.15)', borderRadius: '50%' } }}
          />
        </div>
      )}

      {/* Notes List */}
      {!loading && filteredNotes.length === 0 && (
        <div className="text-center py-4">
          <p className="text-[10px] text-muted-foreground font-medium">
            {viewMode === 'calendar' && selectedDate ? '이 날짜에 노트가 없습니다.' : '저장된 노트가 없습니다.'}
          </p>
        </div>
      )}

      <div className="space-y-1 max-h-36 overflow-y-auto">
        {filteredNotes.map(renderNoteCard)}
      </div>
    </div>
  );
}
