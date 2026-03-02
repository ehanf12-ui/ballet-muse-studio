import { useMemo } from 'react';
import { SectionData, TimeSignature } from '@/lib/types';
import { getDirectionInfo } from '@/lib/directions';
import { Info } from 'lucide-react';

type LangMode = 'both' | 'kr' | 'fr';

interface ScoreRendererProps {
  appData: { barre: SectionData[]; center: SectionData[] };
  langMode: LangMode;
  onDurationChange: (category: 'barre' | 'center', sectionId: string, stepIndex: number, delta: number) => void;
}

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
  const ts: TimeSignature = section.timeSignature || '4/4';
  const beatsPerMeasure = ts === '3/4' ? 3 : 4;

  const maxBeat = useMemo(() => {
    if (!section.steps.length) return beatsPerMeasure * 2;
    return section.steps.reduce((max, s) => Math.max(max, s.start_beat + s.duration - 1), 0);
  }, [section.steps, beatsPerMeasure]);

  // Always use 8 columns for visual grid, but overlay measure lines
  const totalBeats = Math.max(8, Math.ceil(maxBeat / 8) * 8);
  const beatsArray = Array.from({ length: totalBeats }, (_, i) => i + 1);

  return (
    <div className="mb-8 last:mb-0">
      <div className="flex items-center gap-2 mb-2">
        <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-tighter">
          {section.title}
        </h3>
        <span className="text-[9px] text-slate-300 font-bold tracking-widest">
          {totalBeats} BEATS
        </span>
        {ts === '3/4' && (
          <span className="text-[8px] font-bold text-pink-400 bg-pink-50 px-1.5 py-0.5 rounded">
            🎵 3/4
          </span>
        )}
      </div>

      <div className="grid grid-cols-8 border-y-[1.5px] border-slate-900 bg-white shadow-sm overflow-hidden">
        {beatsArray.map((beat) => {
          const stepAtBeat = section.steps.find(s => s.start_beat === beat);
          const isOutbeatBeat = stepAtBeat?.is_outbeat;
          const isPhraseEnd = beat % 8 === 0;
          // 3/4 measure highlight: beats that start a new waltz measure (1, 4, 7, 10...)
          const isWaltzMeasureStart = ts === '3/4' && ((beat - 1) % beatsPerMeasure === 0);
          const isWaltzMeasureLine = ts === '3/4' && beat > 1 && ((beat - 1) % beatsPerMeasure === 0);

          return (
            <div
              key={beat}
              className={`flex min-h-[60px] border-l relative transition-all ${isPhraseEnd ? 'border-r-2 border-r-slate-900' : ''} ${isWaltzMeasureLine ? 'border-l-[2px] border-l-pink-200' : 'border-l-slate-100'}`}
              style={isWaltzMeasureStart ? { backgroundColor: 'rgba(244, 114, 182, 0.04)' } : undefined}
            >
              {/* & marker column */}
              <div
                className={`transition-all duration-200 flex items-center justify-center bg-pink-50/50 border-r border-dotted border-pink-200 overflow-hidden ${isOutbeatBeat ? 'w-[18px]' : 'w-0'}`}
              >
                <span className="text-[7px] font-bold text-pink-500">&</span>
              </div>

              {/* Main beat cell */}
              <div className="flex-1 relative pb-2 min-h-[55px]">
                <div className="flex justify-end px-1 py-0.5">
                  <span className="text-[7px] font-black text-slate-200">
                    {beat <= 8 ? beat : ''}
                  </span>
                </div>

                {section.steps.filter(s => s.start_beat === beat).map((step, idx) => {
                  const stepIdx = section.steps.findIndex(s => s === step);
                  const widthPercent = step.duration * 100 - 5;
                  const meta = [step.side, step.pose].filter(Boolean).join(' ');
                  const dirInfo = getDirectionInfo(step.direction, step.side);

                  return (
                    <div
                      key={idx}
                      className={`absolute top-[12px] right-0 bg-[#fff5f7] border-l-[3px] border-pink-500 rounded-sm p-1 shadow-sm z-10 min-h-[38px] flex flex-col justify-center select-none group ${step.is_outbeat ? 'left-[-17px]' : 'left-[1px]'}`}
                      style={{
                        width: `calc(${widthPercent}% + ${(step.duration - 1) * 1.5}px)`,
                        zIndex: 30 + beat,
                      }}
                    >
                      {/* Direction arrow */}
                      {dirInfo && (
                        <div className="text-[7px] font-black text-indigo-500 leading-none mb-0.5 flex items-center gap-0.5">
                          <span>{dirInfo.abbr}</span>
                          <span className="text-[9px]">{dirInfo.arrow}</span>
                        </div>
                      )}
                      {meta && (
                        <div className="text-[7px] font-bold text-slate-400 leading-none mb-0.5">
                          {meta}
                        </div>
                      )}
                      <div className="font-bold text-[9px] text-slate-800 leading-tight truncate">
                        {langMode === 'fr' ? (step.term_fr || step.term_kr) : step.term_kr}
                      </div>
                      {langMode === 'both' && step.term_fr && (
                        <div className="text-[7px] text-pink-400 font-bold uppercase truncate">
                          {step.term_fr}
                        </div>
                      )}

                      {/* Duration controls */}
                      <div className="absolute right-1 bottom-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => { e.stopPropagation(); onDurationChange(category, section.id, stepIdx, -1); }}
                          className="w-3 h-3 bg-white border border-pink-200 text-pink-500 rounded flex items-center justify-center text-[8px] hover:bg-pink-500 hover:text-white"
                        >
                          -
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); onDurationChange(category, section.id, stepIdx, 1); }}
                          className="w-3 h-3 bg-white border border-pink-200 text-pink-500 rounded flex items-center justify-center text-[8px] hover:bg-pink-500 hover:text-white"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Correction / Feedback note */}
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
