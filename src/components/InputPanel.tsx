import { Trash2, Loader2, Music, MessageSquare } from 'lucide-react';
import { AppData, SectionData, TimeSignature } from '@/lib/types';
import { sectionTags } from '@/lib/data';
import { useState } from 'react';

interface InputPanelProps {
  appData: AppData;
  setAppData: React.Dispatch<React.SetStateAction<AppData>>;
  onProcess: (category: 'barre' | 'center', sectionId: string) => void;
  activeSection?: { category: 'barre' | 'center'; id: string } | null;
  onSectionFocus?: (category: 'barre' | 'center', id: string) => void;
}

export default function InputPanel({ appData, setAppData, onProcess, activeSection, onSectionFocus }: InputPanelProps) {
  const [openMemos, setOpenMemos] = useState<Set<string>>(new Set());

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

  const updateTimeSignature = (category: 'barre' | 'center', id: string, ts: TimeSignature) => {
    setAppData(prev => ({
      ...prev,
      [category]: prev[category].map(s => s.id === id ? { ...s, timeSignature: ts } : s)
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

  const renderCategory = (cat: 'barre' | 'center') => {
    const sections = appData?.[cat] ?? [];
    return (
    <div key={cat} className="space-y-3">
      <div className="flex items-center gap-2 px-1">
        <div className={`w-1.5 h-1.5 rounded-full ${cat === 'barre' ? 'bg-pink-500' : 'bg-slate-800'}`} />
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          {cat} SECTIONS
        </span>
      </div>

      {sections.map(sec => {
        const tags = (sectionTags[sec.title] || []).slice(0, 5);
        const memoOpen = openMemos.has(sec.id);

        return (
          <div key={sec.id} onClick={() => onSectionFocus?.(cat, sec.id)} className={`group bg-white border rounded-2xl p-3 shadow-sm hover:border-pink-200 transition-all cursor-pointer ${activeSection?.category === cat && activeSection?.id === sec.id ? 'border-pink-300 ring-1 ring-pink-100' : 'border-slate-100'}`}>
            <div className="flex justify-between items-center mb-2">
              <input
                value={sec.title}
                onChange={(e) => updateTitle(cat, sec.id, e.target.value)}
                className="text-[13px] font-bold border-none p-0 focus:ring-0 w-1/2 bg-transparent group-hover:text-pink-600 transition-colors outline-none"
              />
              <div className="flex items-center gap-1">
                {/* Time signature toggle */}
                <button
                  onClick={(e) => { e.stopPropagation(); updateTimeSignature(cat, sec.id, sec.timeSignature === '4/4' ? '3/4' : '4/4'); }}
                  className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-bold transition-all border ${sec.timeSignature === '3/4' ? 'bg-pink-50 text-pink-500 border-pink-200' : 'bg-slate-50 text-slate-400 border-slate-100 hover:text-slate-600'}`}
                  title="박자 변경"
                >
                  <Music size={10} />
                  {sec.timeSignature}
                </button>
                {/* Correction memo toggle */}
                <button
                  onClick={(e) => { e.stopPropagation(); toggleMemo(sec.id); }}
                  className={`p-1 rounded-md transition-all ${memoOpen || sec.correction ? 'text-amber-500 bg-amber-50' : 'text-slate-300 hover:text-slate-500'}`}
                  title="피드백 메모"
                >
                  <MessageSquare size={13} />
                </button>
                <button
                  onClick={() => removeSection(cat, sec.id)}
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
                    onClick={() => appendTag(cat, sec, t)}
                    className="text-[9px] font-bold px-2 py-0.5 bg-slate-50 text-slate-400 rounded-md border border-slate-100 hover:bg-pink-50 hover:text-pink-500 hover:border-pink-200 transition-all"
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}

            <textarea
              value={sec.input}
              onChange={(e) => updateInput(cat, sec.id, e.target.value)}
              className="w-full h-16 bg-slate-50 border-none rounded-xl text-[11px] p-3 focus:ring-1 focus:ring-pink-100 resize-none font-medium text-slate-600 outline-none"
              placeholder="순서 노트를 입력하세요..."
            />

            {/* Correction memo area */}
            {memoOpen && (
              <textarea
                value={sec.correction}
                onChange={(e) => updateCorrection(cat, sec.id, e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="w-full h-14 mt-2 rounded-xl text-[11px] p-3 resize-none font-medium text-amber-800 outline-none border border-amber-200 focus:ring-1 focus:ring-amber-200"
                style={{ backgroundColor: '#fffbeb' }}
                placeholder="오늘의 피드백 / 교정 메모를 입력하세요..."
              />
            )}

            <button
              onClick={() => onProcess(cat, sec.id)}
              disabled={sec.loading}
              className="w-full mt-2 bg-slate-900 text-white rounded-xl py-2 text-[10px] font-black uppercase tracking-widest hover:bg-pink-600 active:scale-[0.98] transition-all flex justify-center items-center gap-2 disabled:opacity-50"
            >
              {sec.loading ? <Loader2 size={12} className="animate-spin" /> : 'Update Score'}
            </button>
          </div>
        );
      })}
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
