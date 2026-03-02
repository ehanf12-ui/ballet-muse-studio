import { useState, useEffect, useCallback } from 'react';
import { Plus, Save, Loader2, Music } from 'lucide-react';
import { AppData, genId } from '@/lib/types';
import { initBarreTitles, initCenterTitles } from '@/lib/data';
import TipRotator from '@/components/TipRotator';
import InputPanel from '@/components/InputPanel';
import MusicPlayer from '@/components/MusicPlayer';
import ScoreRenderer from '@/components/ScoreRenderer';
import SemanticSearch from '@/components/SemanticSearch';
import NotesVault from '@/components/NotesVault';
import { useAuth } from '@/hooks/useAuth';
import { useNotes, NoteItem } from '@/hooks/useNotes';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type LangMode = 'both' | 'kr' | 'fr';

function createInitialData(): AppData {
  return {
    barre: initBarreTitles.map(t => ({
      id: genId(),
      title: t,
      input: t === "플리에" ? "(1번발)\n(2번발)\n(4번발)\n(5번발)" : "",
      steps: [],
      loading: false,
      timeSignature: '4/4' as const,
      correction: '',
    })),
    center: initCenterTitles.map(t => ({
      id: genId(),
      title: t,
      input: "",
      steps: [],
      loading: false,
      timeSignature: t === "왈츠" ? '3/4' as const : '4/4' as const,
      correction: '',
    })),
  };
}

const Index = () => {
  const [langMode, setLangMode] = useState<LangMode>('both');
  const [appData, setAppData] = useState<AppData>(createInitialData);
  const [noteTitle, setNoteTitle] = useState('새 노트');
  const [currentNoteId, setCurrentNoteId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<{ category: 'barre' | 'center'; id: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const { user, loading: authLoading, signInAnonymously } = useAuth();
  const { notes, loading: notesLoading, fetchNotes, saveNote, deleteNote } = useNotes(user?.id);

  // Auto sign-in anonymously
  useEffect(() => {
    if (!authLoading && !user) {
      signInAnonymously();
    }
  }, [authLoading, user, signInAnonymously]);

  // Fetch notes on auth
  useEffect(() => {
    if (user) fetchNotes();
  }, [user, fetchNotes]);

  // Track active section (first section by default)
  useEffect(() => {
    if (!activeSection && appData.barre.length > 0) {
      setActiveSection({ category: 'barre', id: appData.barre[0].id });
    }
  }, [appData, activeSection]);

  // AI processing via edge function
  const processAI = useCallback(async (category: 'barre' | 'center', sectionId: string) => {
    const section = appData[category].find(s => s.id === sectionId);
    if (!section || !section.input.trim()) return;

    setAppData(prev => ({
      ...prev,
      [category]: prev[category].map(s => s.id === sectionId ? { ...s, loading: true } : s)
    }));

    try {
      const { data, error } = await supabase.functions.invoke('ballet-ai', {
        body: { input: section.input, sectionTitle: section.title },
      });

      if (error) throw error;

      setAppData(prev => ({
        ...prev,
        [category]: prev[category].map(s => s.id === sectionId ? { ...s, steps: data.steps || [], loading: false } : s)
      }));
    } catch (error) {
      console.error("AI Analysis Error:", error);
      toast.error('AI 분석 중 오류가 발생했습니다.');
      setAppData(prev => ({
        ...prev,
        [category]: prev[category].map(s => s.id === sectionId ? { ...s, loading: false } : s)
      }));
    }
  }, [appData]);

  // Duration change
  const handleDurationChange = useCallback((category: 'barre' | 'center', sectionId: string, stepIndex: number, delta: number) => {
    setAppData(prev => {
      const newData = JSON.parse(JSON.stringify(prev));
      const section = newData[category].find((s: any) => s.id === sectionId);
      if (!section) return prev;
      const targetStep = section.steps[stepIndex];
      targetStep.duration = Math.max(1, targetStep.duration + delta);
      for (let i = stepIndex + 1; i < section.steps.length; i++) {
        const prevStep = section.steps[i - 1];
        section.steps[i].start_beat = prevStep.start_beat + prevStep.duration;
      }
      return newData;
    });
  }, []);

  const addSection = (category: 'barre' | 'center') => {
    setAppData(prev => ({
      ...prev,
      [category]: [...prev[category], {
        id: genId(),
        title: `새 ${category === 'barre' ? '바' : '센터'} 순서`,
        input: "",
        steps: [],
        loading: false,
        timeSignature: '4/4' as const,
        correction: '',
      }]
    }));
  };

  // Save note
  const handleSave = async () => {
    setSaving(true);
    const id = await saveNote(noteTitle, appData, currentNoteId ?? undefined);
    if (id) setCurrentNoteId(id);
    setSaving(false);
  };

  // Load note
  const handleLoadNote = (note: NoteItem) => {
    setAppData(note.data);
    setNoteTitle(note.title);
    setCurrentNoteId(note.id);
    setActiveSection(null);
  };

  // New note
  const handleNewNote = () => {
    setAppData(createInitialData());
    setNoteTitle('새 노트');
    setCurrentNoteId(null);
    setActiveSection(null);
  };

  // Semantic search result handler
  const handleSearchSelect = (termKr: string) => {
    if (!activeSection) {
      toast.info('입력할 섹션을 먼저 선택하세요.');
      return;
    }
    const { category, id } = activeSection;
    setAppData(prev => ({
      ...prev,
      [category]: prev[category].map(s => {
        if (s.id !== id) return s;
        const cur = s.input.trim();
        return { ...s, input: cur ? cur + ", " + termKr : termKr };
      })
    }));
  };

  return (
    <div className="flex h-screen w-full flex-col bg-background font-sans text-foreground overflow-hidden">
      {/* Header */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b bg-white px-6 z-50 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-pink-500 rounded-lg flex items-center justify-center text-white">
              <Music size={15} strokeWidth={2.5} />
            </div>
            <h1 className="text-lg font-black tracking-tighter font-sans">
              Ballet Sequence <span className="text-pink-500">Note</span>
            </h1>
          </div>
          <div className="h-4 w-[1px] bg-slate-200" />
          <div className="flex bg-slate-100 p-0.5 rounded-lg">
            {(['both', 'kr', 'fr'] as const).map(m => (
              <button
                key={m}
                onClick={() => setLangMode(m)}
                className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${langMode === m ? 'bg-white shadow-sm text-pink-500' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {m.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={noteTitle}
            onChange={(e) => setNoteTitle(e.target.value)}
            className="text-[11px] px-3 py-1.5 border border-slate-200 rounded-lg w-36 outline-none focus:border-pink-300 font-bold"
          />
          <button
            onClick={handleSave}
            disabled={saving || !user}
            className="flex items-center gap-1.5 bg-pink-500 text-white px-4 py-1.5 rounded-xl text-xs font-bold hover:bg-pink-600 transition-all shadow-sm disabled:opacity-50"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            저장
          </button>
          <button
            onClick={handleNewNote}
            className="flex items-center gap-1.5 bg-white border border-slate-200 text-slate-600 px-4 py-1.5 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all"
          >
            새 노트
          </button>
          <div className="h-4 w-[1px] bg-slate-200" />
          <button
            onClick={() => addSection('barre')}
            className="flex items-center gap-1.5 bg-white border border-pink-100 text-pink-600 px-4 py-1.5 rounded-xl text-xs font-bold hover:bg-pink-50 transition-all shadow-sm"
          >
            <Plus size={14} /> BARRE
          </button>
          <button
            onClick={() => addSection('center')}
            className="flex items-center gap-1.5 bg-slate-800 text-white px-4 py-1.5 rounded-xl text-xs font-bold hover:bg-slate-700 transition-all shadow-md"
          >
            <Plus size={14} /> CENTER
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="flex flex-1 overflow-hidden pb-14">
        {/* Left: Vault + Search + Input */}
        <aside className="w-[32%] overflow-y-auto border-r bg-white p-4 space-y-3">
          <NotesVault
            notes={notes}
            loading={notesLoading}
            currentNoteId={currentNoteId}
            onLoad={handleLoadNote}
            onDelete={deleteNote}
          />
          <div className="h-[1px] bg-slate-100" />
          <SemanticSearch onSelect={handleSearchSelect} />
          <div className="h-[1px] bg-slate-100" />
          <TipRotator />
          <InputPanel
            appData={appData}
            setAppData={setAppData}
            onProcess={processAI}
            activeSection={activeSection}
            onSectionFocus={(category, id) => setActiveSection({ category, id })}
          />
        </aside>

        {/* Right: Score */}
        <section className="w-[68%] overflow-y-auto p-8 bg-[#fdfafb]">
          <ScoreRenderer appData={appData} langMode={langMode} onDurationChange={handleDurationChange} />
        </section>
      </main>

      {/* Music Player */}
      <MusicPlayer
        activeSectionTitle={activeSection ? appData[activeSection.category].find(s => s.id === activeSection.id)?.title : undefined}
        activeMeter={activeSection ? appData[activeSection.category].find(s => s.id === activeSection.id)?.timeSignature : undefined}
      />
    </div>
  );
};

export default Index;
