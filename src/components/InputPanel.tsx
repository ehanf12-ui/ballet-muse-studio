import { Trash2, Loader2, Music, MessageSquare, GripVertical } from 'lucide-react';
import { AppData, SectionData, TimeSignature } from '@/lib/types';
import { sectionTags } from '@/lib/data';
import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface InputPanelProps {
  appData: AppData;
  setAppData: React.Dispatch<React.SetStateAction<AppData>>;
  onProcess: (category: 'barre' | 'center', sectionId: string) => void;
  activeSection?: { category: 'barre' | 'center'; id: string } | null;
  onSectionFocus?: (category: 'barre' | 'center', id: string) => void;
}

function SortableSection({
  sec,
  cat,
  isActive,
  tags,
  memoOpen,
  onRemove,
  onTitleChange,
  onInputChange,
  onTimeSignatureChange,
  onCorrectionChange,
  onToggleMemo,
  onAppendTag,
  onProcess,
  onFocus,
}: {
  sec: SectionData;
  cat: 'barre' | 'center';
  isActive: boolean;
  tags: string[];
  memoOpen: boolean;
  onRemove: () => void;
  onTitleChange: (val: string) => void;
  onInputChange: (val: string) => void;
  onTimeSignatureChange: () => void;
  onCorrectionChange: (val: string) => void;
  onToggleMemo: () => void;
  onAppendTag: (tag: string) => void;
  onProcess: () => void;
  onFocus: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: sec.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.85 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onFocus}
      className={`group bg-white border rounded-2xl p-3 shadow-sm hover:border-pink-200 transition-all cursor-pointer ${isDragging ? 'ring-2 ring-pink-300 shadow-lg' : ''} ${isActive ? 'border-pink-300 ring-1 ring-pink-100' : 'border-slate-100'}`}
    >
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-1.5">
          <div
            {...attributes}
            {...listeners}
            className={`touch-none p-0.5 rounded text-slate-300 hover:text-pink-400 transition-colors ${isDragging ? 'cursor-grabbing text-pink-500' : 'cursor-grab'}`}
          >
            <GripVertical size={14} />
          </div>
          <input
            value={sec.title}
            onChange={(e) => onTitleChange(e.target.value)}
            className="text-[13px] font-bold border-none p-0 focus:ring-0 w-1/2 bg-transparent group-hover:text-pink-600 transition-colors outline-none"
          />
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); onTimeSignatureChange(); }}
            className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-bold transition-all border ${sec.timeSignature === '3/4' ? 'bg-pink-50 text-pink-500 border-pink-200' : 'bg-slate-50 text-slate-400 border-slate-100 hover:text-slate-600'}`}
            title="박자 변경"
          >
            <Music size={10} />
            {sec.timeSignature}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onToggleMemo(); }}
            className={`p-1 rounded-md transition-all ${memoOpen || sec.correction ? 'text-amber-500 bg-amber-50' : 'text-slate-300 hover:text-slate-500'}`}
            title="피드백 메모"
          >
            <MessageSquare size={13} />
          </button>
          <button
            onClick={onRemove}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 hover:text-red-400 p-1"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {tags.map(t => (
            <button
              key={t}
              onClick={() => onAppendTag(t)}
              className="text-[9px] font-bold px-2 py-0.5 bg-slate-50 text-slate-400 rounded-md border border-slate-100 hover:bg-pink-50 hover:text-pink-500 hover:border-pink-200 transition-all"
            >
              {t}
            </button>
          ))}
        </div>
      )}

      <textarea
        value={sec.input}
        onChange={(e) => onInputChange(e.target.value)}
        className="w-full h-16 bg-slate-50 border-none rounded-xl text-[11px] p-3 focus:ring-1 focus:ring-pink-100 resize-none font-medium text-slate-600 outline-none"
        placeholder="순서 노트를 입력하세요..."
      />

      {memoOpen && (
        <textarea
          value={sec.correction}
          onChange={(e) => onCorrectionChange(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          className="w-full h-14 mt-2 rounded-xl text-[11px] p-3 resize-none font-medium text-amber-800 outline-none border border-amber-200 focus:ring-1 focus:ring-amber-200"
          style={{ backgroundColor: '#fffbeb' }}
          placeholder="오늘의 피드백 / 교정 메모를 입력하세요..."
        />
      )}

      <button
        onClick={onProcess}
        disabled={sec.loading}
        className={`w-full mt-2 text-white rounded-xl py-2 text-[10px] font-black uppercase tracking-widest active:scale-[0.98] transition-all flex justify-center items-center gap-2 disabled:opacity-50 ${cat === 'barre' ? 'bg-rose-400 hover:bg-rose-500' : 'bg-indigo-400 hover:bg-indigo-500'}`}
      >
        {sec.loading ? <Loader2 size={12} className="animate-spin" /> : 'Update'}
      </button>
    </div>
  );
}

export default function InputPanel({ appData, setAppData, onProcess, activeSection, onSectionFocus }: InputPanelProps) {
  const [openMemos, setOpenMemos] = useState<Set<string>>(new Set());

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const removeSection = (category: 'barre' | 'center', id: string) => {
    setAppData(prev => ({
      ...prev,
      [category]: prev[category].filter(s => s.id !== id)
    }));
  };

  const updateTitle = (category: 'barre' | 'center', id: string, val: string) => {
    setAppData(prev => ({
      ...prev,
      [category]: prev[category].map(s => s.id === id ? { ...s, title: val } : s)
    }));
  };

  const updateInput = (category: 'barre' | 'center', id: string, val: string) => {
    setAppData(prev => ({
      ...prev,
      [category]: prev[category].map(s => s.id === id ? { ...s, input: val } : s)
    }));
  };

  const updateTimeSignature = (category: 'barre' | 'center', id: string) => {
    setAppData(prev => ({
      ...prev,
      [category]: prev[category].map(s => s.id === id ? { ...s, timeSignature: (s.timeSignature === '4/4' ? '3/4' : '4/4') as TimeSignature } : s)
    }));
  };

  const updateCorrection = (category: 'barre' | 'center', id: string, val: string) => {
    setAppData(prev => ({
      ...prev,
      [category]: prev[category].map(s => s.id === id ? { ...s, correction: val } : s)
    }));
  };

  const toggleMemo = (id: string) => {
    setOpenMemos(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const appendTag = (category: 'barre' | 'center', sec: SectionData, tag: string) => {
    const cur = sec.input.trim();
    const newVal = (cur ? cur + ", " : "") + tag;
    updateInput(category, sec.id, newVal);
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
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${cat === 'barre' ? 'bg-pink-50 border border-pink-100' : 'bg-slate-50 border border-slate-200'}`}>
          <div className={`w-2 h-2 rounded-full ${cat === 'barre' ? 'bg-pink-400' : 'bg-slate-400'}`} />
          <span className={`text-[10px] font-black uppercase tracking-widest ${cat === 'barre' ? 'text-pink-500' : 'text-slate-500'}`}>
            {cat === 'barre' ? '🩰 Barre' : '💃 Center'}
          </span>
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd(cat)}>
          <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {sections.map(sec => {
                const tags = (sectionTags[sec.title] || []).slice(0, 5);
                return (
                  <SortableSection
                    key={sec.id}
                    sec={sec}
                    cat={cat}
                    isActive={activeSection?.category === cat && activeSection?.id === sec.id}
                    tags={tags}
                    memoOpen={openMemos.has(sec.id)}
                    onRemove={() => removeSection(cat, sec.id)}
                    onTitleChange={(val) => updateTitle(cat, sec.id, val)}
                    onInputChange={(val) => updateInput(cat, sec.id, val)}
                    onTimeSignatureChange={() => updateTimeSignature(cat, sec.id)}
                    onCorrectionChange={(val) => updateCorrection(cat, sec.id, val)}
                    onToggleMemo={() => toggleMemo(sec.id)}
                    onAppendTag={(tag) => appendTag(cat, sec, tag)}
                    onProcess={() => onProcess(cat, sec.id)}
                    onFocus={() => onSectionFocus?.(cat, sec.id)}
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
