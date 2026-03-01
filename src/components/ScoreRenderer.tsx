import { Section } from '@/lib/types';
import { LangMode, t, getMovementName, getFootPosition, getDirection } from '@/lib/i18n';

interface ScoreRendererProps {
  sections: Section[];
  lang: LangMode;
}

const BEATS = [1, 2, 3, 4, 5, 6, 7, 8];

export default function ScoreRenderer({ sections, lang }: ScoreRendererProps) {
  return (
    <div className="space-y-8">
      {sections.map((section) => (
        <div key={section.id}>
          <h2 className="ballet-section-title mb-4">{t(section.type, lang)}</h2>

          {section.exercises.length === 0 && (
            <p className="text-xs text-muted-foreground italic">
              {lang === 'FR' ? 'Aucun exercice ajouté.' : '운동이 없습니다.'}
            </p>
          )}

          {section.exercises.map((exercise, exIdx) => (
            <div key={exercise.id} className="mb-6">
              <div className="text-[10px] text-muted-foreground mb-1.5 font-medium">
                {t('exercise', lang)} {exIdx + 1}
              </div>

              {/* Grid header */}
              <div className="flex border-b border-border">
                {BEATS.map((beat) => {
                  const hasAnd = exercise.movements.some((m) => m.beat === beat && m.hasAnd);
                  return (
                    <div key={beat} className="flex-1 min-w-0 relative">
                      {hasAnd && (
                        <div className="absolute right-full top-0 bottom-0 w-[18px] flex items-center justify-center">
                          <span className="text-[9px] text-muted-foreground font-medium">&</span>
                        </div>
                      )}
                      <div className="score-grid-header border-r border-border last:border-r-0">
                        {beat}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Grid body — single row per exercise */}
              <div className="flex border border-t-0 border-border rounded-b-md min-h-[60px]">
                {BEATS.map((beat) => {
                  const mov = exercise.movements.find((m) => m.beat === beat);
                  const isSpan = exercise.movements.find(
                    (m) => m.beat < beat && m.beat + m.duration > beat
                  );
                  const hasAnd = mov?.hasAnd;

                  // If this beat is covered by a previous movement's span, don't render
                  if (isSpan && !mov) return null;

                  // Find how many columns this cell spans
                  const span = mov ? mov.duration : 1;

                  return (
                    <div
                      key={beat}
                      className="relative border-r border-border last:border-r-0 px-1.5 py-2"
                      style={{ flex: span, minWidth: 0 }}
                    >
                      {/* & marker */}
                      {hasAnd && (
                        <div className="and-marker">
                          &
                        </div>
                      )}

                      {mov ? (
                        <div className="animate-fade-in">
                          {/* Meta info */}
                          <div className="movement-meta">
                            {mov.footPosition && getFootPosition(mov.footPosition, lang)}
                            {mov.direction && ` · ${getDirection(mov.direction, lang)}`}
                          </div>
                          {/* Movement name */}
                          <div className="text-[11px] font-medium leading-tight">
                            {getMovementName(mov.key, lang)}
                          </div>
                          {span > 1 && (
                            <div className="text-[8px] text-muted-foreground mt-0.5">
                              {span} {lang === 'FR' ? 'temps' : '박'}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-[10px] text-muted-foreground/30 text-center">·</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ))}

      {sections.every((s) => s.exercises.length === 0) && (
        <div className="flex items-center justify-center h-48 text-muted-foreground text-sm italic">
          {lang === 'FR'
            ? 'Ajoutez des exercices à gauche pour voir la partition.'
            : '왼쪽에서 운동을 추가하면 악보가 표시됩니다.'}
        </div>
      )}
    </div>
  );
}
