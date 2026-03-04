import { useMemo } from 'react';
import { SectionData, Step, TimeSignature } from '@/lib/types';
import { getDirectionInfo } from '@/lib/directions';
import { Info } from 'lucide-react';

type LangMode = 'both' | 'kr' | 'fr';

interface ScoreRendererProps {
  appData: { barre: SectionData[]; center: SectionData[] };
  langMode: LangMode;
  onDurationChange: (category: 'barre' | 'center', sectionId: string, stepIndex: number, delta: number) => void;
}

/* Step card content shared between both modes */
function StepContent({
  step,
  langMode,
  dirInfo,
}: {
  step: Step;
  langMode: LangMode;
  dirInfo: ReturnType<typeof getDirectionInfo>;
}) {
  const meta = [step.side, step.pose, step.repetition > 1 ? `×${step.repetition}` : null].filter(Boolean).join(' ');
  return (
    <>
      {step.description && (
        <div className="text-[7px] font-bold text-slate-400 leading-none mb-0.5">{step.description}</div>
      )}
      {dirInfo && (
        <div className="text-[7px] font-black text-indigo-500 leading-none mb-0.5 flex items-center gap-0.5">
          <span>{dirInfo.abbr}</span>
          <span className="text-[9px]">{dirInfo.arrow}</span>
        </div>
      )}
      {meta && <div className="text-[7px] font-bold text-slate-400 leading-none mb-0.5">{meta}</div>}
      <div className="font-bold text-[9px] text-slate-800 leading-tight truncate">
        {langMode === 'fr' ? (step.term_fr || step.term_kr) : step.term_kr}
      </div>
      {langMode === 'both' && step.term_fr && (
        <div className="text-[7px] text-pink-400 font-bold uppercase truncate">{step.term_fr}</div>
      )}
    </>
  );
}

/* ── ScoreGrid: handles both 4/4 and 3/4 ── */
function ScoreGrid({
  section,
  category,
  langMode,
  onDurationChange,
}: {
  section: SectionData;
  category: 'barre' | 'center';
  langMode: LangMode;
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
        <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-tighter">
          {section.title}
        </h3>
        <span className="text-[9px] text-slate-300 font-bold tracking-widest">
          {totalBeats} {isWaltz ? 'MEASURES' : 'BEATS'}
        </span>
        {isWaltz && (
          <span className="text-[8px] font-bold text-pink-400 bg-pink-50 px-1.5 py-0.5 rounded">🎵 3/4</span>
        )}
      </div>

      <div className="grid grid-cols-8 border-y-[1.5px] border-slate-900 bg-white shadow-sm overflow-hidden">
        {beatsArray.map((beat) => {
          const isPhraseEnd = beat % 8 === 0;

          if (isWaltz) {
            // Each column = 1 measure. Inside: 3 sub-slots for 3 beats.
            const measureNum = beat;
            const stepsInMeasure = section.steps.filter(s => (s.measureIndex ?? 1) === measureNum);

            return (
              <div
                key={beat}
                className={`flex flex-col min-h-[70px] border-l relative ${isPhraseEnd ? 'border-r-2 border-r-slate-900' : ''} border-l-slate-200`}
                style={{ backgroundColor: 'rgba(244, 114, 182, 0.02)' }}
              >
                {/* Beat number */}
                <div className="flex justify-end px-1 py-0.5">
                  <span className="text-[7px] font-black text-slate-200">{beat <= 8 ? beat : ''}</span>
                </div>

                {/* 3 sub-slot grid */}
                <div className="flex-1 grid grid-cols-3 relative">
                  {/* Dotted vertical dividers */}
                  <div className="absolute top-0 bottom-0 left-1/3 border-l border-dashed" style={{ borderColor: 'rgba(244,114,182,0.25)' }} />
                  <div className="absolute top-0 bottom-0 left-2/3 border-l border-dashed" style={{ borderColor: 'rgba(244,114,182,0.25)' }} />

                  {stepsInMeasure.length === 0 ? (
                    <div className="col-span-3" />
                  ) : (
                    stepsInMeasure.map((step, idx) => {
                      const bi = Math.max(1, Math.min(3, step.beatIndex ?? 1));
                      const span = Math.min(step.duration, 3 - bi + 1);
                      const stepIdx = section.steps.findIndex(s => s === step);
                      const dirInfo = getDirectionInfo(step.direction, step.side);

                      return (
                        <div
                          key={idx}
                          className="bg-[#fff5f7] border-l-[3px] border-pink-500 rounded-sm p-1 m-[1px] flex flex-col justify-center group min-h-[40px] relative"
                          style={{ gridColumn: `${bi} / span ${span}` }}
                        >
                          <StepContent step={step} langMode={langMode} dirInfo={dirInfo} />
                          {step.duration > 1 && (
                            <div className="text-[6px] font-black text-pink-300 mt-0.5">{step.duration}beats</div>
                          )}
                          {/* Duration controls */}
                          <div className="absolute right-0.5 bottom-0.5 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={(e) => { e.stopPropagation(); onDurationChange(category, section.id, stepIdx, -1); }} className="w-3 h-3 bg-white border border-pink-200 text-pink-500 rounded flex items-center justify-center text-[8px] hover:bg-pink-500 hover:text-white">-</button>
                            <button onClick={(e) => { e.stopPropagation(); onDurationChange(category, section.id, stepIdx, 1); }} className="w-3 h-3 bg-white border border-pink-200 text-pink-500 rounded flex items-center justify-center text-[8px] hover:bg-pink-500 hover:text-white">+</button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          }

          // ── 4/4 mode (unchanged) ──
          const stepAtBeat = section.steps.find(s => s.start_beat === beat);
          const isOutbeatBeat = stepAtBeat?.is_outbeat;

          return (
            <div
              key={beat}
              className={`flex min-h-[60px] border-l relative transition-all ${isPhraseEnd ? 'border-r-2 border-r-slate-900' : ''} border-l-slate-100`}
            >
              <div className={`transition-all duration-200 flex items-center justify-center bg-pink-50/50 border-r border-dotted border-pink-200 overflow-hidden ${isOutbeatBeat ? 'w-[18px]' : 'w-0'}`}>
                <span className="text-[7px] font-bold text-pink-500">&</span>
              </div>
              <div className="flex-1 relative pb-2 min-h-[55px]">
                <div className="flex justify-end px-1 py-0.5">
                  <span className="text-[7px] font-black text-slate-200">{beat <= 8 ? beat : ''}</span>
                </div>
                {section.steps.filter(s => s.start_beat === beat).map((step, idx) => {
                  const stepIdx = section.steps.findIndex(s => s === step);
                  const widthPercent = step.duration * 100 - 5;
                  const dirInfo = getDirectionInfo(step.direction, step.side);

                  return (
                    <div
                      key={idx}
                      className={`absolute top-[12px] right-0 bg-[#fff5f7] border-l-[3px] border-pink-500 rounded-sm p-1 shadow-sm z-10 min-h-[38px] flex flex-col justify-center select-none group ${step.is_outbeat ? 'left-[-17px]' : 'left-[1px]'}`}
                      style={{ width: `calc(${widthPercent}% + ${(step.duration - 1) * 1.5}px)`, zIndex: 30 + beat }}
                    >
                      <StepContent step={step} langMode={langMode} dirInfo={dirInfo} />
                      <div className="absolute right-1 bottom-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => { e.stopPropagation(); onDurationChange(category, section.id, stepIdx, -1); }} className="w-3 h-3 bg-white border border-pink-200 text-pink-500 rounded flex items-center justify-center text-[8px] hover:bg-pink-500 hover:text-white">-</button>
                        <button onClick={(e) => { e.stopPropagation(); onDurationChange(category, section.id, stepIdx, 1); }} className="w-3 h-3 bg-white border border-pink-200 text-pink-500 rounded flex items-center justify-center text-[8px] hover:bg-pink-500 hover:text-white">+</button>
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
        <div className="mt-2 px-3 py-2 rounded-xl text-[10px] font-medium text-amber-800 border border-amber-200" style={{ backgroundColor: '#fffbeb' }}>
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
        <div className="flex flex-col items-center justify-center py-40 text-slate-300 space-y-4">
          <div className="w-16 h-16 rounded-full border-2 border-dashed border-slate-200 flex items-center justify-center">
            <Info size={24} className="opacity-50" />
          </div>
          <p className="text-sm font-bold tracking-tight">
            왼쪽 입력칸에 발레 순서를 적고 Update를 눌러보세요 🩰
          </p>
        </div>
      )}

      {(['barre', 'center'] as const).map(cat => (
        <div key={cat} className="space-y-10">
          {appData[cat].filter(s => s.steps.length > 0).map(sec => (
            <ScoreGrid
              key={sec.id}
              section={sec}
              category={cat}
              langMode={langMode}
              onDurationChange={onDurationChange}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
