import { useMemo } from 'react';
import { Star, Target, Sparkles } from 'lucide-react';
import { NoteItem } from '@/hooks/useNotes';
import { Progress } from '@/components/ui/progress';

interface QuickWidgetsProps {
  notes: NoteItem[];
  onLoadNote: (note: NoteItem) => void;
}

const missions = [
  "오늘은 플리에 3세트 어때요? 🩰",
  "탕뒤를 깔끔하게 연습해보세요!",
  "아다지오에 집중하는 하루 💫",
  "그랑 바뜨망으로 에너지를 채워요!",
  "오늘의 목표: 피루엣 연습 🌀",
  "발레는 매일의 루틴이 중요해요 ✨",
  "퐁뒤로 근력 훈련 어때요?",
  "프라페로 순발력을 키워보세요!",
  "롱드 잠브로 우아함을 더해봐요 🦢",
  "알레그로 점프 연습 가즈아! 🚀",
];

export default function QuickWidgets({ notes, onLoadNote }: QuickWidgetsProps) {
  const favorites = useMemo(() =>
    notes.filter(n => n.is_favorite)
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 3),
    [notes]
  );

  const weeklyProgress = useMemo(() => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
    monday.setHours(0, 0, 0, 0);

    const daysSet = new Set<string>();
    notes.forEach(n => {
      const d = new Date(n.updated_at);
      if (d >= monday) daysSet.add(d.toDateString());
    });
    return daysSet.size;
  }, [notes]);

  const todayMission = useMemo(() => {
    const dayIndex = new Date().getDate() % missions.length;
    return missions[dayIndex];
  }, []);

  return (
    <div className="space-y-3 px-1">
      {/* Favorites */}
      {favorites.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <Star size={14} className="text-amber-400" fill="currentColor" />
            <span className="text-xs font-bold text-foreground">즐겨찾기</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
            {favorites.map(note => (
              <button
                key={note.id}
                onClick={() => onLoadNote(note)}
                className="shrink-0 w-36 p-3 rounded-xl border border-amber-200/50 bg-amber-50/30 dark:bg-amber-900/10 dark:border-amber-800/30 text-left hover:border-amber-300 transition-all min-h-[48px]"
              >
                <div className="text-xs font-bold text-foreground truncate">{note.title}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  {new Date(note.updated_at).toLocaleDateString('ko-KR')}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Weekly Progress */}
      <div className="p-3 rounded-xl border border-border bg-card">
        <div className="flex items-center gap-1.5 mb-2">
          <Target size={14} className="text-primary" />
          <span className="text-xs font-bold text-foreground">주간 연습 달성도</span>
        </div>
        <div className="flex items-center gap-3">
          <Progress value={(weeklyProgress / 7) * 100} className="flex-1 h-2" />
          <span className="text-xs font-extrabold text-primary shrink-0">{weeklyProgress}/7일</span>
        </div>
        <p className="text-[11px] text-muted-foreground mt-1.5 font-medium">
          {weeklyProgress === 0 && "이번 주 첫 연습을 시작해보세요! 💪"}
          {weeklyProgress > 0 && weeklyProgress < 4 && `이번 주 ${weeklyProgress}일 완료! 계속 가보자고요 🔥`}
          {weeklyProgress >= 4 && weeklyProgress < 7 && `이번 주 ${weeklyProgress}일 완료! 대단해요! 🌟`}
          {weeklyProgress === 7 && "7일 연속 완료! 완벽한 한 주예요! 🏆"}
        </p>
      </div>

      {/* Daily Mission */}
      <div className="p-3 rounded-xl border border-primary/20 bg-primary/5">
        <div className="flex items-center gap-1.5 mb-1">
          <Sparkles size={14} className="text-primary" />
          <span className="text-xs font-bold text-foreground">오늘의 미션</span>
        </div>
        <p className="text-sm font-medium text-foreground">{todayMission}</p>
      </div>
    </div>
  );
}
