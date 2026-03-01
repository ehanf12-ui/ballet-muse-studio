import { Movement, Exercise, Section, genId } from '@/lib/types';
import { LangMode, t, getMovementName, getMovementKeys, getFootPosition, getDirection } from '@/lib/i18n';
import { Plus, Trash2 } from 'lucide-react';

interface InputPanelProps {
  sections: Section[];
  setSections: React.Dispatch<React.SetStateAction<Section[]>>;
  lang: LangMode;
}

export default function InputPanel({ sections, setSections, lang }: InputPanelProps) {
  const movementKeys = getMovementKeys();

  const addExercise = (sectionId: string) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              exercises: [
                ...s.exercises,
                {
                  id: genId(),
                  movements: [
                    { id: genId(), key: 'plie', beat: 1, duration: 2, hasAnd: false, footPosition: 1, direction: 'right' },
                  ],
                },
              ],
            }
          : s
      )
    );
  };

  const addMovement = (sectionId: string, exerciseId: string) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              exercises: s.exercises.map((ex) => {
                if (ex.id !== exerciseId) return ex;
                const lastMov = ex.movements[ex.movements.length - 1];
                const nextBeat = lastMov ? Math.min(lastMov.beat + lastMov.duration, 8) : 1;
                return {
                  ...ex,
                  movements: [
                    ...ex.movements,
                    { id: genId(), key: 'tendu', beat: nextBeat, duration: 1, hasAnd: false, footPosition: 1, direction: 'right' },
                  ],
                };
              }),
            }
          : s
      )
    );
  };

  const updateMovement = (sectionId: string, exerciseId: string, movId: string, patch: Partial<Movement>) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              exercises: s.exercises.map((ex) => {
                if (ex.id !== exerciseId) return ex;
                const updated = ex.movements.map((m) => (m.id === movId ? { ...m, ...patch } : m));
                // auto-shift logic: recalc beats after duration change
                if (patch.duration !== undefined) {
                  let cursor = 1;
                  for (const m of updated) {
                    m.beat = cursor;
                    cursor = Math.min(cursor + m.duration, 9);
                  }
                }
                return { ...ex, movements: updated };
              }),
            }
          : s
      )
    );
  };

  const deleteMovement = (sectionId: string, exerciseId: string, movId: string) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              exercises: s.exercises.map((ex) =>
                ex.id === exerciseId
                  ? { ...ex, movements: ex.movements.filter((m) => m.id !== movId) }
                  : ex
              ),
            }
          : s
      )
    );
  };

  const deleteExercise = (sectionId: string, exerciseId: string) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? { ...s, exercises: s.exercises.filter((ex) => ex.id !== exerciseId) }
          : s
      )
    );
  };

  return (
    <div className="space-y-6">
      {sections.map((section) => (
        <div key={section.id}>
          <h2 className="ballet-section-title mb-3">{t(section.type, lang)}</h2>

          <div className="space-y-4">
            {section.exercises.map((exercise, exIdx) => (
              <div key={exercise.id} className="ballet-card">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-muted-foreground">
                    {t('exercise', lang)} {exIdx + 1}
                  </span>
                  <button
                    onClick={() => deleteExercise(section.id, exercise.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors p-1"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                <div className="space-y-3">
                  {exercise.movements.map((mov) => (
                    <div key={mov.id} className="border border-border rounded-md p-3 space-y-2">
                      {/* Movement selector */}
                      <div className="flex flex-wrap gap-1.5">
                        {movementKeys.slice(0, 12).map((mk) => (
                          <button
                            key={mk}
                            className={`ballet-tag ${mov.key === mk ? 'active' : ''}`}
                            onClick={() => updateMovement(section.id, exercise.id, mov.id, { key: mk })}
                          >
                            {getMovementName(mk, lang)}
                          </button>
                        ))}
                      </div>

                      {/* Controls row */}
                      <div className="flex items-center gap-3 flex-wrap">
                        {/* Duration */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-muted-foreground">{t('duration', lang) || 'Duration'}</span>
                          <button
                            className="w-5 h-5 rounded border border-border text-xs flex items-center justify-center hover:bg-secondary transition-colors"
                            onClick={() => updateMovement(section.id, exercise.id, mov.id, { duration: Math.max(1, mov.duration - 1) })}
                          >
                            −
                          </button>
                          <span className="text-xs font-medium w-4 text-center">{mov.duration}</span>
                          <button
                            className="w-5 h-5 rounded border border-border text-xs flex items-center justify-center hover:bg-secondary transition-colors"
                            onClick={() => updateMovement(section.id, exercise.id, mov.id, { duration: Math.min(8, mov.duration + 1) })}
                          >
                            +
                          </button>
                        </div>

                        {/* Foot position */}
                        <select
                          className="text-[10px] bg-secondary border border-border rounded px-1.5 py-0.5"
                          value={mov.footPosition ?? 1}
                          onChange={(e) => updateMovement(section.id, exercise.id, mov.id, { footPosition: Number(e.target.value) })}
                        >
                          {[1, 2, 3, 4, 5].map((n) => (
                            <option key={n} value={n}>{getFootPosition(n, lang)}</option>
                          ))}
                        </select>

                        {/* Direction */}
                        <select
                          className="text-[10px] bg-secondary border border-border rounded px-1.5 py-0.5"
                          value={mov.direction ?? 'right'}
                          onChange={(e) =>
                            updateMovement(section.id, exercise.id, mov.id, {
                              direction: e.target.value as Movement['direction'],
                            })
                          }
                        >
                          {(['right', 'left', 'front', 'back'] as const).map((d) => (
                            <option key={d} value={d}>{getDirection(d, lang)}</option>
                          ))}
                        </select>

                        {/* And beat toggle */}
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={mov.hasAnd}
                            onChange={(e) => updateMovement(section.id, exercise.id, mov.id, { hasAnd: e.target.checked })}
                            className="w-3 h-3 accent-primary"
                          />
                          <span className="text-[10px] text-muted-foreground">&</span>
                        </label>

                        {/* Delete */}
                        <button
                          onClick={() => deleteMovement(section.id, exercise.id, mov.id)}
                          className="ml-auto text-muted-foreground hover:text-destructive transition-colors p-0.5"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => addMovement(section.id, exercise.id)}
                  className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Plus size={12} /> {t('addMovement', lang)}
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={() => addExercise(section.id)}
            className="mt-3 flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors font-medium"
          >
            <Plus size={14} /> {t('addExercise', lang)}
          </button>
        </div>
      ))}
    </div>
  );
}
