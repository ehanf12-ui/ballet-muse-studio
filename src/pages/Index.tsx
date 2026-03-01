import { useState } from 'react';
import { Section, genId } from '@/lib/types';
import { LangMode, t } from '@/lib/i18n';
import TipRotator from '@/components/TipRotator';
import InputPanel from '@/components/InputPanel';
import ScoreRenderer from '@/components/ScoreRenderer';

const initialSections: Section[] = [
  { id: genId(), type: 'barre', exercises: [] },
  { id: genId(), type: 'centre', exercises: [] },
];

const langOptions: LangMode[] = ['KR+FR', 'KR', 'FR'];

const Index = () => {
  const [lang, setLang] = useState<LangMode>('KR+FR');
  const [sections, setSections] = useState<Section[]>(initialSections);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Top bar */}
      <header className="flex items-center justify-between px-5 py-3 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-xl tracking-tight">Ballet Score Studio</h1>
        </div>
        <div className="flex items-center gap-1.5">
          {langOptions.map((lo) => (
            <button
              key={lo}
              onClick={() => setLang(lo)}
              className={`ballet-tag ${lang === lo ? 'active' : ''}`}
            >
              {lo}
            </button>
          ))}
        </div>
      </header>

      {/* Split view */}
      <div className="flex flex-1 min-h-0">
        {/* Left: Input */}
        <div className="w-[35%] border-r border-border overflow-y-auto p-5 space-y-5">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              {t('input', lang)}
            </span>
          </div>
          <TipRotator lang={lang} />
          <InputPanel sections={sections} setSections={setSections} lang={lang} />
        </div>

        {/* Right: Score */}
        <div className="flex-1 overflow-y-auto p-6 bg-background">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              {t('score', lang)}
            </span>
          </div>
          <ScoreRenderer sections={sections} lang={lang} />
        </div>
      </div>
    </div>
  );
};

export default Index;
