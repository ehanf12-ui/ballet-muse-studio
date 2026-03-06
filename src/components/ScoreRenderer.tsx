import { useMemo } from 'react';
import { SectionData, Step, TimeSignature } from '@/lib/types';
import { getDirectionInfo } from '@/lib/directions';
import { Info } from 'lucide-react';
import YouTubeEmbed from './YouTubeEmbed';

type LangMode = 'both' | 'kr' | 'fr';

interface ScoreRendererProps {
  appData: { barre: SectionData[]; center: SectionData[] };
  langMode: LangMode;
  onDurationChange: (category: 'barre' | 'center', sectionId: string, stepIndex: number, delta: number) => void;
}

import { termMapping } from '@/lib/data';

function StepContent({ step, langMode, dirInfo }: { step: Step; langMode: LangMode; dirInfo: ReturnType<typeof getDirectionInfo> }) {
  const translateFr = (text: string) => langMode === 'fr' ? (termMapping[text] || text) : text;

  const meta = [
    step.side ? translateFr(step.side) : null,
    step.pose ? translateFr(step.pose) : null,
    step.repetition > 1 ? `×${step.repetition}` : null
  ].filter(Boolean).join(' ');

  return (
    <>
      {step.description && <div className="text-[7px] font-bold text-muted-foreground leading-none mb-0.5">{translateFr(step.description)}</div>}
      {dirInfo && (
        <div className="text-[7px] font-black text-accent leading-none mb-0.5 flex items-center gap-0.5">
          <span>{dirInfo.abbr}</span><span className="text-[9px]">{dirInfo.arrow}</span>
        </div>
      )}
      {meta && <div className="text-[7px] font-bold text-muted-foreground leading-none mb-0.5">{meta}</div>}
      <div className="font-bold text-[9px] text-foreground leading-tight truncate">
        {langMode === 'fr' ? (step.term_fr || translateFr(step.term_kr)) : step.term_kr}
      </div>
      {langMode === 'both' && step.term_fr && (
        <div className="text-[7px] text-primary font-bold uppercase truncate">{step.term_fr}</div>
      )}
    </>
  );
}

function ScoreGrid({ section, category, langMode, onDurationChange }: {
  section: SectionData; category: 'barre' | 'center'; langMode: LangMode;
  onDurationChange: (category: 'barre' | 'center', sectionId: string, stepIndex: number, delta: number) => void;
}) {
  const isWaltz = section.timeSignature === '3/4';

  const maxBeat = useMemo(() => {
    if (!section.steps.length) return 16;
    if (isWaltz) {
      const maxMeasure = section.steps.reduce((max, s) => Math.max(max, s.measureIndex ?? 1), 1);
      return Math.max(8, Math.ceil(maxMeasure / 8) * 8);
    }
    return Math.max(8, Math.ceil(section.steps.reduce((max, s) => Math.max(max, s.start_beat + s.duration - 1), 0) / 8) * 8);
  }, [section.steps, isWaltz]);

  const totalBeats = isWaltz ? Math.max(8, maxBeat) : maxBeat;
  const beatsArray = Array.from({ length: totalBeats }, (_, i) => i + 1);

  return (
    <div className="mb-8 last:mb-0">
      <div className="flex items-center gap-2 mb-2">
        <h3 className="text-[11px] font-black text-foreground uppercase tracking-tighter">{section.title}</h3>
        {isWaltz && <span className="text-[8px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">🎵 3/4</span>}
      </div>

      {/* YouTube embed (collapsible on small screens) */}
      {section.youtubeUrl && (
        <div className="mb-3">
          <div className="hidden md:block max-w-md"><YouTubeEmbed url={section.youtubeUrl} /></div>
          <div className="md:hidden"><YouTubeEmbed url={section.youtubeUrl} compact /></div>
        </div>
      )}

      <div className="grid grid-cols-8 border-y-[1.5px] border-foreground bg-card shadow-sm overflow-hidden">
        {beatsArray.map((beat) => {
          const isPhraseEnd = beat % 8 === 0;

          if (isWaltz) {
            const measureNum = beat;
            const stepsInMeasure = section.steps.filter(s => (s.measureIndex ?? 1) === measureNum);
            return (
              <div key={beat}
                className={`flex flex-col min-h-[52px] border-l relative ${isPhraseEnd ? 'border-r-2 border-r-foreground' : ''} border-l-border`}
                style={{ backgroundColor: 'hsl(var(--score-bg))' }}>
                <div className="flex justify-end px-1 py-0.5">
                  <span className="text-[7px] font-black text-muted-foreground/30">{beat <= 8 ? beat : ''}</span>
                </div>
                <div className="flex-1 grid grid-cols-3 relative">
                  <div className="absolute top-0 bottom-0 left-1/3 border-l border-dashed border-primary/20" />
                  <div className="absolute top-0 bottom-0 left-2/3 border-l border-dashed border-primary/20" />
                  {stepsInMeasure.length === 0 ? <div className="col-span-3" /> : stepsInMeasure.map((step, idx) => {
                    const bi = Math.max(1, Math.min(3, step.beatIndex ?? 1));
                    const span = Math.min(step.duration, 3 - bi + 1);
                    const stepIdx = section.steps.findIndex(s => s === step);
                    const dirInfo = getDirectionInfo(step.direction, step.side);
                    return (
                      <div key={idx}
                        className="rounded-sm p-1 m-[1px] flex flex-col justify-center group min-h-[38px] relative"
                        style={{ gridColumn: `${bi} / span ${span}`, backgroundColor: 'hsl(var(--score-step-bg))' }}>
                        <StepContent step={step} langMode={langMode} dirInfo={dirInfo} />
                        <div className="absolute right-0.5 bottom-0.5 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={(e) => { e.stopPropagation(); onDurationChange(category, section.id, stepIdx, -1); }} className="w-3 h-3 bg-card border border-primary/30 text-primary rounded flex items-center justify-center text-[8px] hover:bg-primary hover:text-primary-foreground">-</button>
                          <button onClick={(e) => { e.stopPropagation(); onDurationChange(category, section.id, stepIdx, 1); }} className="w-3 h-3 bg-card border border-primary/30 text-primary rounded flex items-center justify-center text-[8px] hover:bg-primary hover:text-primary-foreground">+</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          }

          const stepAtBeat = section.steps.find(s => s.start_beat === beat);
          const isOutbeatBeat = stepAtBeat?.is_outbeat;
          return (
            <div key={beat} className={`flex min-h-[48px] border-l relative transition-all ${isPhraseEnd ? 'border-r-2 border-r-foreground' : ''} border-l-border`}>
              <div className={`transition-all duration-200 flex items-center justify-center bg-primary/5 border-r border-dotted border-primary/30 overflow-hidden ${isOutbeatBeat ? 'w-[18px]' : 'w-0'}`}>
                <span className="text-[7px] font-bold text-primary">&</span>
              </div>
              <div className="flex-1 relative min-h-[48px]">
                <div className="flex justify-end px-1 py-0.5">
                  <span className="text-[7px] font-black text-muted-foreground/30">{beat <= 8 ? beat : ''}</span>
                </div>
                {section.steps.filter(s => s.start_beat === beat || (beat % 8 === 1 && beat > s.start_beat && beat < s.start_beat + s.duration)).map((step, idx) => {
                  const stepIdx = section.steps.findIndex(s => s === step);

                  const isContinuation = beat > step.start_beat;
                  const remainingDuration = step.duration - (beat - step.start_beat);
                  const beatsLeftInRow = 8 - ((beat - 1) % 8);
                  const visibleDuration = Math.min(remainingDuration, beatsLeftInRow);

                  const widthPercent = visibleDuration * 100 - 5;
                  const dirInfo = getDirectionInfo(step.direction, step.side);
                  const leftClass = (step.is_outbeat && !isContinuation) ? 'left-[-17px]' : 'left-[1px]';

                  return (
                    <div key={`${stepIdx}-${beat}`}
                      className={`absolute top-[5px] right-0 rounded-sm p-1 shadow-sm z-10 min-h-[38px] flex flex-col justify-center select-none group ${leftClass}`}
                      style={{ width: `calc(${widthPercent}% + ${(visibleDuration - 1) * 1.5}px)`, zIndex: 30 + beat, backgroundColor: 'hsl(var(--score-step-bg))' }}>
                      <StepContent step={step} langMode={langMode} dirInfo={dirInfo} />
                      <div className="absolute right-1 bottom-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => { e.stopPropagation(); onDurationChange(category, section.id, stepIdx, -1); }} className="w-3 h-3 bg-card border border-primary/30 text-primary rounded flex items-center justify-center text-[8px] hover:bg-primary hover:text-primary-foreground">-</button>
                        <button onClick={(e) => { e.stopPropagation(); onDurationChange(category, section.id, stepIdx, 1); }} className="w-3 h-3 bg-card border border-primary/30 text-primary rounded flex items-center justify-center text-[8px] hover:bg-primary hover:text-primary-foreground">+</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {section.correction && (
        <div className="mt-2 px-3 py-2 rounded-xl text-[10px] font-medium text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800 bg-amber-50/80 dark:bg-amber-900/20">
          <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest mr-2">FEEDBACK</span>
          {section.correction}
        </div>
      )}
    </div>
  );
}

export default function ScoreRenderer({ appData, langMode, onDurationChange }: ScoreRendererProps) {
  const hasAnySteps = ['barre', 'center'].some(cat =>
    appData[cat as keyof typeof appData].some(s => s.steps.length > 0)
  );

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {!hasAnySteps && (
        <div className="flex flex-col items-center justify-center py-40 text-muted-foreground space-y-4">
          <div className="w-16 h-16 rounded-full border-2 border-dashed border-border flex items-center justify-center">
            <Info size={24} className="opacity-50" />
          </div>
          <p className="text-sm font-bold tracking-tight">왼쪽 입력칸에 발레 순서를 적고 Update를 눌러보세요 🩰</p>
        </div>
      )}
      {(['barre', 'center'] as const).map(cat => (
        <div key={cat} className="space-y-10">
          {appData[cat].filter(s => s.steps.length > 0).map(sec => (
            <ScoreGrid key={sec.id} section={sec} category={cat} langMode={langMode} onDurationChange={onDurationChange} />
          ))}
        </div>
      ))}
    </div>
  );
}
