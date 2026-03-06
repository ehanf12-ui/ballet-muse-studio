import { Trash2, Loader2, Music, MessageSquare, GripVertical, Mic, MicOff, Youtube } from 'lucide-react';
import { AppData, SectionData, TimeSignature } from '@/lib/types';
import { sectionTags, termMapping } from '@/lib/data';
import { useState } from 'react';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface InputPanelProps {
  appData: AppData;
  setAppData: React.Dispatch<React.SetStateAction<AppData>>;
  onProcess: (category: 'barre' | 'center', sectionId: string) => void;
  activeSection?: { category: 'barre' | 'center'; id: string } | null;
  onSectionFocus?: (category: 'barre' | 'center', id: string) => void;
  langMode?: 'both' | 'kr' | 'fr';
}

function SortableSection({
  sec, cat, isActive, tags, memoOpen, voiceListening, langMode,
  onRemove, onTitleChange, onInputChange, onTimeSignatureChange, onCorrectionChange,
  onToggleMemo, onAppendTag, onProcess, onFocus, onYoutubeChange, onToggleVoice,
}: {
  sec: SectionData; cat: 'barre' | 'center'; isActive: boolean; tags: string[];
  memoOpen: boolean; voiceListening: boolean; langMode?: 'both' | 'kr' | 'fr';
  onRemove: () => void; onTitleChange: (val: string) => void; onInputChange: (val: string) => void;
  onTimeSignatureChange: () => void; onCorrectionChange: (val: string) => void;
  onToggleMemo: () => void; onAppendTag: (tag: string) => void; onProcess: () => void;
  onFocus: () => void; onYoutubeChange: (val: string) => void; onToggleVoice: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: sec.id });
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 50 : undefined, opacity: isDragging ? 0.85 : 1 };

  return (
    <div ref={setNodeRef} style={style} onClick={onFocus}
      className={`group bg-card border rounded-2xl p-3 shadow-sm hover:border-primary/30 transition-all cursor-pointer ${isDragging ? 'ring-2 ring-primary/40 shadow-lg' : ''} ${isActive ? 'border-primary/40 ring-1 ring-primary/10' : 'border-border'}`}>
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-1.5">
          <div {...attributes} {...listeners}
            className={`touch-none p-0.5 rounded text-muted-foreground hover:text-primary transition-colors ${isDragging ? 'cursor-grabbing text-primary' : 'cursor-grab'}`}>
            <GripVertical size={14} />
          </div>
          <span className="text-[13px] font-bold text-foreground max-w-[120px] truncate" title={sec.title}>
            {langMode === 'fr' ? (termMapping[sec.title] || sec.title) : sec.title}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={(e) => { e.stopPropagation(); onTimeSignatureChange(); }}
            className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-bold transition-all border ${sec.timeSignature === '3/4' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-muted text-muted-foreground border-border hover:text-foreground'}`}
            title="박자 변경">
            <Music size={10} />{sec.timeSignature}
          </button>
          <button onClick={(e) => { e.stopPropagation(); onToggleMemo(); }}
            className={`p-1 rounded-md transition-all ${memoOpen || sec.correction ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/20' : 'text-muted-foreground hover:text-foreground'}`}
            title="피드백 메모">
            <MessageSquare size={13} />
          </button>
          <button onClick={onRemove} className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive p-1">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {tags.map(t => (
            <button key={t} onClick={() => onAppendTag(t)}
              className="text-[9px] font-bold px-2 py-0.5 bg-muted text-muted-foreground rounded-md border border-border hover:bg-primary/10 hover:text-primary hover:border-primary/20 transition-all">
              {langMode === 'fr' ? (termMapping[t] || t) : t}
            </button>
          ))}
        </div>
      )}

      <div className="relative">
        <textarea value={sec.input} onChange={(e) => onInputChange(e.target.value)}
          className="w-full h-16 bg-muted border-none rounded-xl text-[11px] p-3 pr-10 focus:ring-1 focus:ring-primary/20 resize-none font-medium text-foreground outline-none"
          placeholder="순서 노트를 입력하세요..." />
        <button onClick={(e) => { e.stopPropagation(); onToggleVoice(); }}
          className={`absolute right-2 top-2 p-1.5 rounded-lg transition-all ${voiceListening ? 'bg-destructive text-destructive-foreground animate-pulse' : 'text-muted-foreground hover:text-primary hover:bg-primary/10'}`}
          title="음성 입력">
          {voiceListening ? <MicOff size={14} /> : <Mic size={14} />}
        </button>
      </div>

      {/* YouTube URL input */}
      <div className="flex items-center gap-1.5 mt-1.5">
        <Youtube size={12} className="text-red-500 shrink-0" />
        <input value={sec.youtubeUrl || ''} onChange={(e) => onYoutubeChange(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          className="flex-1 text-[10px] px-2 py-1 bg-muted border border-border rounded-lg outline-none focus:border-primary/30 font-medium text-foreground"
          placeholder="유튜브 링크 붙여넣기..." />
      </div>

      {memoOpen && (
        <textarea value={sec.correction} onChange={(e) => onCorrectionChange(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          className="w-full h-14 mt-2 rounded-xl text-[11px] p-3 resize-none font-medium text-amber-800 dark:text-amber-200 outline-none border border-amber-200 dark:border-amber-800 focus:ring-1 focus:ring-amber-200 bg-amber-50/80 dark:bg-amber-900/20"
          placeholder="오늘의 피드백 / 교정 메모를 입력하세요..." />
      )}

      <button onClick={onProcess} disabled={sec.loading}
        className={`w-full mt-2 rounded-xl py-2 text-[10px] font-black uppercase tracking-widest active:scale-[0.98] transition-all flex justify-center items-center gap-2 disabled:opacity-50 ${cat === 'barre' ? 'bg-update-barre text-update-barre-foreground hover:opacity-90' : 'bg-update-center text-update-center-foreground hover:opacity-90'}`}>
        {sec.loading ? <Loader2 size={12} className="animate-spin" /> : 'Update'}
      </button>
    </div>
  );
}

export default function InputPanel({ appData, setAppData, onProcess, activeSection, onSectionFocus, langMode }: InputPanelProps) {
  const [openMemos, setOpenMemos] = useState<Set<string>>(new Set());
  const [listeningId, setListeningId] = useState<string | null>(null);
  const { listening, supported, startListening, stopListening } = useVoiceInput();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const removeSection = (category: 'barre' | 'center', id: string) => {
    setAppData(prev => ({ ...prev, [category]: prev[category].filter(s => s.id !== id) }));
  };

  const updateTitle = (category: 'barre' | 'center', id: string, val: string) => {
    setAppData(prev => ({ ...prev, [category]: prev[category].map(s => s.id === id ? { ...s, title: val } : s) }));
  };

  const updateInput = (category: 'barre' | 'center', id: string, val: string) => {
    setAppData(prev => ({ ...prev, [category]: prev[category].map(s => s.id === id ? { ...s, input: val } : s) }));
  };

  const updateYoutubeUrl = (category: 'barre' | 'center', id: string, val: string) => {
    setAppData(prev => ({ ...prev, [category]: prev[category].map(s => s.id === id ? { ...s, youtubeUrl: val } : s) }));
  };

  const updateTimeSignature = (category: 'barre' | 'center', id: string) => {
    setAppData(prev => ({
      ...prev, [category]: prev[category].map(s => s.id === id ? { ...s, timeSignature: (s.timeSignature === '4/4' ? '3/4' : '4/4') as TimeSignature } : s)
    }));
  };

  const updateCorrection = (category: 'barre' | 'center', id: string, val: string) => {
    setAppData(prev => ({ ...prev, [category]: prev[category].map(s => s.id === id ? { ...s, correction: val } : s) }));
  };

  const toggleMemo = (id: string) => {
    setOpenMemos(prev => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  };

  const appendTag = (category: 'barre' | 'center', sec: SectionData, tag: string) => {
    const cur = sec.input.trim();
    updateInput(category, sec.id, (cur ? cur + ", " : "") + tag);
  };

  const handleToggleVoice = (category: 'barre' | 'center', secId: string) => {
    if (!supported) return;
    if (listening && listeningId === secId) {
      stopListening();
      setListeningId(null);
    } else {
      if (listening) stopListening();
      setListeningId(secId);
      startListening((text) => {
        setAppData(prev => ({
          ...prev,
          [category]: prev[category].map(s => {
            if (s.id !== secId) return s;
            const cur = s.input.trim();
            return { ...s, input: cur ? cur + ", " + text : text };
          })
        }));
      });
    }
  };

  const handleDragEnd = (cat: 'barre' | 'center') => (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setAppData(prev => {
      const sections = prev[cat];
      const oldIndex = sections.findIndex(s => s.id === active.id);
      const newIndex = sections.findIndex(s => s.id === over.id);
      return { ...prev, [cat]: arrayMove(sections, oldIndex, newIndex) };
    });
  };

  const renderCategory = (cat: 'barre' | 'center') => {
    const sections = appData?.[cat] ?? [];
    return (
      <div key={cat} className="space-y-3">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${cat === 'barre' ? 'bg-primary/10 border border-primary/20' : 'bg-muted border border-border'}`}>
          <div className={`w-2 h-2 rounded-full ${cat === 'barre' ? 'bg-primary' : 'bg-muted-foreground'}`} />
          <span className={`text-[10px] font-black uppercase tracking-widest ${cat === 'barre' ? 'text-primary' : 'text-muted-foreground'}`}>
            {cat === 'barre' ? '🩰 Barre' : '💃 Center'}
          </span>
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd(cat)}>
          <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {sections.map(sec => {
                const tags = (sectionTags[sec.title] || []).slice(0, 5);
                return (
                  <SortableSection key={sec.id} sec={sec} cat={cat}
                    isActive={activeSection?.category === cat && activeSection?.id === sec.id}
                    tags={tags} memoOpen={openMemos.has(sec.id)}
                    voiceListening={listening && listeningId === sec.id}
                    langMode={langMode}
                    onRemove={() => removeSection(cat, sec.id)}
                    onTitleChange={(val) => updateTitle(cat, sec.id, val)}
                    onInputChange={(val) => updateInput(cat, sec.id, val)}
                    onTimeSignatureChange={() => updateTimeSignature(cat, sec.id)}
                    onCorrectionChange={(val) => updateCorrection(cat, sec.id, val)}
                    onToggleMemo={() => toggleMemo(sec.id)}
                    onAppendTag={(tag) => appendTag(cat, sec, tag)}
                    onProcess={() => onProcess(cat, sec.id)}
                    onFocus={() => onSectionFocus?.(cat, sec.id)}
                    onYoutubeChange={(val) => updateYoutubeUrl(cat, sec.id, val)}
                    onToggleVoice={() => handleToggleVoice(cat, sec.id)}
                  />
                );
              })}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    );
  };

  return (
    <div className="space-y-3">
      {renderCategory('barre')}
      {renderCategory('center')}
    </div>
  );
}
