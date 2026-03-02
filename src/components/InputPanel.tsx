import { Trash2, Loader2 } from 'lucide-react';
import { AppData, SectionData } from '@/lib/types';
import { sectionTags } from '@/lib/data';

interface InputPanelProps {
  appData: AppData;
  setAppData: React.Dispatch<React.SetStateAction<AppData>>;
  onProcess: (category: 'barre' | 'center', sectionId: string) => void;
  activeSection?: { category: 'barre' | 'center'; id: string } | null;
  onSectionFocus?: (category: 'barre' | 'center', id: string) => void;
}

export default function InputPanel({ appData, setAppData, onProcess, activeSection, onSectionFocus }: InputPanelProps) {
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

        return (
          <div key={sec.id} onClick={() => onSectionFocus?.(cat, sec.id)} className={`group bg-white border rounded-2xl p-3 shadow-sm hover:border-pink-200 transition-all cursor-pointer ${activeSection?.category === cat && activeSection?.id === sec.id ? 'border-pink-300 ring-1 ring-pink-100' : 'border-slate-100'}`}>
            <div className="flex justify-between items-center mb-2">
              <input
                value={sec.title}
                onChange={(e) => updateTitle(cat, sec.id, e.target.value)}
                className="text-[13px] font-bold border-none p-0 focus:ring-0 w-3/4 bg-transparent group-hover:text-pink-600 transition-colors outline-none"
              />
              <button
                onClick={() => removeSection(cat, sec.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 hover:text-red-400"
              >
                <Trash2 size={14} />
              </button>
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
