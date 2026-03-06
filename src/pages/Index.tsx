import { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Save, Loader2, Music } from 'lucide-react';
import { AppData, genId } from '@/lib/types';
import { initBarreTitles, initCenterTitles } from '@/lib/data';
import TipRotator from '@/components/TipRotator';
import InputPanel from '@/components/InputPanel';
import MusicPlayer from '@/components/MusicPlayer';
import ScoreRenderer from '@/components/ScoreRenderer';
import SemanticSearch from '@/components/SemanticSearch';
import ExportMenu from '@/components/ExportMenu';
import NotesVault from '@/components/NotesVault';
import ProfileDropdown from '@/components/ProfileDropdown';
import YouTubeEmbed from '@/components/YouTubeEmbed';
import MobileBottomNav, { MobileTab } from '@/components/MobileBottomNav';
import QuickWidgets from '@/components/QuickWidgets';
import SwipeableNoteCard from '@/components/SwipeableNoteCard';
import MobileProfileView from '@/components/MobileProfileView';
import { useAuth } from '@/hooks/useAuth';
import { useNotes, NoteItem } from '@/hooks/useNotes';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type LangMode = 'both' | 'kr' | 'fr';

function createInitialData(): AppData {
  return {
    barre: initBarreTitles.map(t => ({
      id: genId(), title: t,
      input: t === "플리에" ? "(1번발)\n(2번발)\n(4번발)\n(5번발)" : "",
      steps: [], loading: false, timeSignature: '4/4' as const, correction: '', youtubeUrl: '',
    })),
    center: initCenterTitles.map(t => ({
      id: genId(), title: t, input: "", steps: [], loading: false,
      timeSignature: t === "왈츠" ? '3/4' as const : '4/4' as const, correction: '', youtubeUrl: '',
    })),
  };
}

const Index = () => {
  const [langMode, setLangMode] = useState<LangMode>('both');
  const [appData, setAppData] = useState<AppData>(createInitialData);
  const scoreRef = useRef<HTMLDivElement>(null);
  const [noteTitle, setNoteTitle] = useState('새 노트');
  const [currentNoteId, setCurrentNoteId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<{ category: 'barre' | 'center'; id: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [mobileTab, setMobileTab] = useState<MobileTab>('home');
  const isMobile = useIsMobile();

  const { user, profile, signOut, updateProfile, checkNicknameAvailable, deleteAccount } = useAuth();
  const { notes, loading: notesLoading, fetchNotes, saveNote, deleteNote, toggleFavorite, exportNotes, resetAllNotes } = useNotes(user?.id);

  useEffect(() => { if (user) fetchNotes(); }, [user, fetchNotes]);

  useEffect(() => {
    if (!activeSection && appData.barre.length > 0) {
      setActiveSection({ category: 'barre', id: appData.barre[0].id });
    }
  }, [appData, activeSection]);

  const processAI = useCallback(async (category: 'barre' | 'center', sectionId: string) => {
    const section = appData[category].find(s => s.id === sectionId);
    if (!section || !section.input.trim()) return;
    setAppData(prev => ({ ...prev, [category]: prev[category].map(s => s.id === sectionId ? { ...s, loading: true } : s) }));
    try {
      const { data, error } = await supabase.functions.invoke('ballet-ai', {
        body: { input: section.input, sectionTitle: section.title, timeSignature: section.timeSignature },
      });
      if (error) throw error;
      setAppData(prev => ({ ...prev, [category]: prev[category].map(s => s.id === sectionId ? { ...s, steps: data.steps || [], loading: false } : s) }));
    } catch (error) {
      console.error("AI Analysis Error:", error);
      toast.error('AI 분석 중 오류가 발생했습니다.');
      setAppData(prev => ({ ...prev, [category]: prev[category].map(s => s.id === sectionId ? { ...s, loading: false } : s) }));
    }
  }, [appData]);

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
        id: genId(), title: `새 ${category === 'barre' ? '바' : '센터'} 순서`,
        input: "", steps: [], loading: false, timeSignature: '4/4' as const, correction: '', youtubeUrl: '',
      }]
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    const id = await saveNote(noteTitle, appData, currentNoteId ?? undefined);
    if (id) setCurrentNoteId(id);
    setSaving(false);
  };

  const handleLoadNote = (note: NoteItem) => {
    setAppData(note.data);
    setNoteTitle(note.title);
    setCurrentNoteId(note.id);
    setActiveSection(null);
    if (isMobile) setMobileTab('home');
  };

  const handleNewNote = () => {
    setAppData(createInitialData());
    setNoteTitle('새 노트');
    setCurrentNoteId(null);
    setActiveSection(null);
    if (isMobile) setMobileTab('home');
  };

  const handleSearchSelect = (termKr: string) => {
    if (!activeSection) { toast.info('입력할 섹션을 먼저 선택하세요.'); return; }
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

  const activeSec = activeSection ? appData[activeSection.category].find(s => s.id === activeSection.id) : null;
  const activeYoutubeUrl = activeSec?.youtubeUrl || '';

  // ─── Mobile layout ───
  if (isMobile) {
    return (
      <div className="flex flex-col h-screen w-full bg-background font-sans text-foreground overflow-hidden">
        {/* Mobile header */}
        <header className="flex h-12 shrink-0 items-center justify-between border-b bg-card px-4 z-50">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
              <Music size={13} strokeWidth={2.5} />
            </div>
            <h1 className="text-sm font-black tracking-tighter">Ballet Muse</h1>
          </div>
          <div className="flex items-center gap-2">
            <input type="text" value={noteTitle} onChange={e => setNoteTitle(e.target.value)}
              className="text-[11px] px-2 py-1 border border-border rounded-lg w-24 outline-none focus:border-primary font-bold bg-card text-foreground" />
            <button onClick={handleSave} disabled={saving || !user}
              className="flex items-center gap-1 bg-primary text-primary-foreground px-3 py-1.5 rounded-xl text-[11px] font-bold min-h-[36px] min-w-[44px] justify-center disabled:opacity-50">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            </button>
          </div>
        </header>

        {/* Tab content */}
        <main className="flex-1 overflow-y-auto pb-20">
          {mobileTab === 'home' && (
            <div className="space-y-4 p-4">
              <QuickWidgets notes={notes} onLoadNote={handleLoadNote} />
              <div className="flex gap-2">
                <button onClick={() => addSection('barre')}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-primary/10 border border-primary/20 text-primary px-3 py-2.5 rounded-xl text-xs font-bold min-h-[44px]">
                  <Plus size={14} /> BARRE
                </button>
                <button onClick={() => addSection('center')}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-secondary border border-border text-secondary-foreground px-3 py-2.5 rounded-xl text-xs font-bold min-h-[44px]">
                  <Plus size={14} /> CENTER
                </button>
              </div>
              <div className="flex bg-muted p-0.5 rounded-lg w-fit">
                {(['both', 'kr', 'fr'] as const).map(m => (
                  <button key={m} onClick={() => setLangMode(m)}
                    className={`px-3 py-1.5 rounded-md text-[11px] font-bold min-h-[36px] transition-all ${langMode === m ? 'bg-card shadow-sm text-primary' : 'text-muted-foreground'}`}>
                    {m.toUpperCase()}
                  </button>
                ))}
              </div>
              <InputPanel appData={appData} setAppData={setAppData} onProcess={processAI}
                activeSection={activeSection} onSectionFocus={(category, id) => setActiveSection({ category, id })} langMode={langMode} />
              <div className="flex justify-end">
                <ExportMenu scoreRef={scoreRef} noteTitle={noteTitle} />
              </div>
              <div id="print-area" ref={scoreRef}>
                <ScoreRenderer appData={appData} langMode={langMode} onDurationChange={handleDurationChange} />
              </div>
            </div>
          )}

          {mobileTab === 'vault' && (
            <div className="p-4 space-y-3">
              <NotesVault notes={notes} loading={notesLoading} currentNoteId={currentNoteId}
                onLoad={handleLoadNote} onDelete={deleteNote} onToggleFavorite={toggleFavorite} />
              {/* Swipeable list for mobile */}
              <div className="space-y-2 mt-4">
                {notes.map(note => (
                  <SwipeableNoteCard key={note.id} note={note} isActive={currentNoteId === note.id}
                    onLoad={handleLoadNote} onDelete={deleteNote} onToggleFavorite={toggleFavorite} />
                ))}
              </div>
            </div>
          )}

          {mobileTab === 'dictionary' && (
            <div className="p-4 space-y-4">
              <SemanticSearch onSelect={handleSearchSelect} />
              <TipRotator />
            </div>
          )}

          {mobileTab === 'profile' && user && (
            <MobileProfileView user={user} profile={profile} onSignOut={signOut} onExportNotes={exportNotes}
              onResetNotes={async () => { await resetAllNotes(); handleNewNote(); }}
              onDeleteAccount={deleteAccount} onUpdateProfile={updateProfile} onCheckNickname={checkNicknameAvailable} />
          )}
        </main>

        <MusicPlayer activeSectionTitle={activeSec?.title} activeMeter={activeSec?.timeSignature} />
        <MobileBottomNav activeTab={mobileTab} onTabChange={setMobileTab} onNewNote={handleNewNote} />
      </div>
    );
  }

  // ─── Desktop layout ───
  return (
    <div className="flex h-screen w-full flex-col bg-background font-sans text-foreground overflow-hidden">
      {/* Header */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b bg-card px-6 z-50 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
              <Music size={15} strokeWidth={2.5} />
            </div>
            <h1 className="text-lg font-black tracking-tighter font-sans">
              Ballet Sequence <span className="text-primary">Note</span>
            </h1>
          </div>
          <div className="h-4 w-[1px] bg-border" />
          <div className="flex bg-muted p-0.5 rounded-lg">
            {(['both', 'kr', 'fr'] as const).map(m => (
              <button key={m} onClick={() => setLangMode(m)}
                className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${langMode === m ? 'bg-card shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
                {m.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2 items-center">
          <input type="text" value={noteTitle} onChange={(e) => setNoteTitle(e.target.value)}
            className="text-[11px] px-3 py-1.5 border border-border rounded-lg w-36 outline-none focus:border-primary font-bold bg-card text-foreground" />
          <button onClick={handleSave} disabled={saving || !user}
            className="flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-1.5 rounded-xl text-xs font-bold hover:opacity-90 transition-all shadow-sm disabled:opacity-50">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} 저장
          </button>
          <button onClick={handleNewNote}
            className="flex items-center gap-1.5 bg-card border border-border text-foreground px-4 py-1.5 rounded-xl text-xs font-bold hover:bg-muted transition-all">
            새 노트
          </button>
          <div className="h-4 w-[1px] bg-border" />
          <button onClick={() => addSection('barre')}
            className="flex items-center gap-1.5 bg-primary/10 border border-primary/20 text-primary px-4 py-1.5 rounded-xl text-xs font-bold hover:bg-primary/20 transition-all shadow-sm">
            <Plus size={14} /> BARRE
          </button>
          <button onClick={() => addSection('center')}
            className="flex items-center gap-1.5 bg-secondary border border-border text-secondary-foreground px-4 py-1.5 rounded-xl text-xs font-bold hover:bg-muted transition-all shadow-sm">
            <Plus size={14} /> CENTER
          </button>
          <div className="h-4 w-[1px] bg-border" />
          {user && (
            <ProfileDropdown user={user} profile={profile} onSignOut={signOut} onExportNotes={exportNotes}
              onResetNotes={async () => { await resetAllNotes(); handleNewNote(); }}
              onDeleteAccount={deleteAccount} onUpdateProfile={updateProfile} onCheckNickname={checkNicknameAvailable} />
          )}
        </div>
      </header>

      {/* Main */}
      <main className="flex flex-1 overflow-hidden pb-14">
        {activeYoutubeUrl && (
          <div className="hidden landscape-tablet:flex w-full">
            <div className="w-1/2 p-4 flex items-start justify-center overflow-y-auto bg-card border-r border-border">
              <div className="w-full max-w-xl">
                <YouTubeEmbed url={activeYoutubeUrl} />
              </div>
            </div>
            <div className="w-1/2 overflow-y-auto p-6" style={{ backgroundColor: 'hsl(var(--score-bg))' }}>
              <div id="print-area" ref={scoreRef}>
                <ScoreRenderer appData={appData} langMode={langMode} onDurationChange={handleDurationChange} />
              </div>
            </div>
          </div>
        )}

        <div className={`flex w-full ${activeYoutubeUrl ? 'landscape-tablet:hidden' : ''}`}>
          <aside className="w-[32%] overflow-y-auto border-r border-border bg-card p-4 space-y-3">
            <NotesVault notes={notes} loading={notesLoading} currentNoteId={currentNoteId}
              onLoad={handleLoadNote} onDelete={deleteNote} onToggleFavorite={toggleFavorite} />
            <div className="h-[1px] bg-border" />
            <SemanticSearch onSelect={handleSearchSelect} />
            <div className="h-[1px] bg-border" />
            <TipRotator />
            <InputPanel appData={appData} setAppData={setAppData} onProcess={processAI}
              activeSection={activeSection} onSectionFocus={(category, id) => setActiveSection({ category, id })} langMode={langMode} />
          </aside>

          <section className="w-[68%] overflow-y-auto p-8" style={{ backgroundColor: 'hsl(var(--score-bg))' }}>
            <div className="flex justify-end mb-4">
              <ExportMenu scoreRef={scoreRef} noteTitle={noteTitle} />
            </div>
            <div id="print-area" ref={scoreRef}>
              <ScoreRenderer appData={appData} langMode={langMode} onDurationChange={handleDurationChange} />
            </div>
          </section>
        </div>
      </main>

      <MusicPlayer activeSectionTitle={activeSec?.title} activeMeter={activeSec?.timeSignature} />
    </div>
  );
};

export default Index;
