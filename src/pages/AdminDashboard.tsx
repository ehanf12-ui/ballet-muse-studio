import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Users, FileText, MessageSquare, ChevronRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import ScoreRenderer from '@/components/ScoreRenderer';
import type { AppData } from '@/lib/types';
import type { Json } from '@/integrations/supabase/types';

interface AdminProfile {
  user_id: string;
  display_name: string | null;
  nickname: string | null;
  email: string | null;
  avatar_url: string | null;
}

interface AdminNote {
  id: string;
  title: string;
  data: Json;
  created_at: string;
  updated_at: string;
  user_id: string;
}

interface AdminFeedback {
  id: string;
  user_id: string;
  title: string;
  content: string;
  created_at: string;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<AdminProfile[]>([]);
  const [selectedUser, setSelectedUser] = useState<AdminProfile | null>(null);
  const [userNotes, setUserNotes] = useState<AdminNote[]>([]);
  const [selectedNote, setSelectedNote] = useState<AdminNote | null>(null);
  const [feedbacks, setFeedbacks] = useState<AdminFeedback[]>([]);
  const [tab, setTab] = useState<'users' | 'feedback'>('users');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [{ data: p }, { data: f }] = await Promise.all([
        supabase.from('profiles').select('user_id, display_name, nickname, email, avatar_url'),
        supabase.from('feedback').select('*').order('created_at', { ascending: false }),
      ]);
      if (p) setProfiles(p as AdminProfile[]);
      if (f) setFeedbacks(f as AdminFeedback[]);
      setLoading(false);
    };
    load();
  }, []);

  const loadUserNotes = useCallback(async (profile: AdminProfile) => {
    setSelectedUser(profile);
    setSelectedNote(null);
    const { data } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', profile.user_id)
      .order('updated_at', { ascending: false });
    if (data) setUserNotes(data as AdminNote[]);
  }, []);

  const getFeedbackUserName = (userId: string) => {
    const p = profiles.find(pr => pr.user_id === userId);
    return p?.nickname || p?.display_name || p?.email || '알 수 없음';
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-muted-foreground" size={24} />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card flex flex-col">
        <div className="p-4 border-b">
          <Link to="/" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={14} /> 메인으로 돌아가기
          </Link>
          <h2 className="text-sm font-black mt-2">관리자 대시보드</h2>
        </div>
        <div className="flex border-b">
          <button
            onClick={() => { setTab('users'); setSelectedNote(null); }}
            className={`flex-1 py-2 text-xs font-bold transition-colors ${tab === 'users' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}
          >
            <Users size={12} className="inline mr-1" /> 사용자
          </button>
          <button
            onClick={() => { setTab('feedback'); setSelectedUser(null); setSelectedNote(null); }}
            className={`flex-1 py-2 text-xs font-bold transition-colors ${tab === 'feedback' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}
          >
            <MessageSquare size={12} className="inline mr-1" /> 피드백
            {feedbacks.length > 0 && (
              <span className="ml-1 bg-destructive text-destructive-foreground text-[9px] px-1.5 py-0.5 rounded-full">{feedbacks.length}</span>
            )}
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {tab === 'users' && profiles.map(p => (
            <button
              key={p.user_id}
              onClick={() => loadUserNotes(p)}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all ${
                selectedUser?.user_id === p.user_id ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
              }`}
            >
              <div className="font-bold truncate">{p.nickname || p.display_name || '이름 없음'}</div>
              <div className="text-[10px] text-muted-foreground truncate">{p.email}</div>
            </button>
          ))}
          {tab === 'feedback' && feedbacks.map(f => (
            <div key={f.id} className="px-3 py-2 rounded-lg border border-border bg-card space-y-1">
              <div className="text-[10px] text-muted-foreground">{getFeedbackUserName(f.user_id)} · {new Date(f.created_at).toLocaleDateString('ko-KR')}</div>
              <div className="text-xs font-bold">{f.title}</div>
              <div className="text-[11px] text-foreground/80 whitespace-pre-wrap">{f.content}</div>
            </div>
          ))}
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {tab === 'users' && selectedUser && !selectedNote && (
          <div className="p-6">
            <h3 className="text-sm font-bold mb-4">
              {selectedUser.nickname || selectedUser.display_name || '이름 없음'}의 노트 ({userNotes.length})
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {userNotes.map(note => (
                <button
                  key={note.id}
                  onClick={() => setSelectedNote(note)}
                  className="text-left p-4 rounded-xl border border-border bg-card hover:border-primary/40 transition-all"
                >
                  <FileText size={14} className="text-muted-foreground mb-1" />
                  <div className="text-xs font-bold truncate">{note.title}</div>
                  <div className="text-[10px] text-muted-foreground mt-1">
                    {new Date(note.updated_at).toLocaleDateString('ko-KR')}
                  </div>
                </button>
              ))}
              {userNotes.length === 0 && (
                <p className="text-xs text-muted-foreground col-span-full">노트가 없습니다.</p>
              )}
            </div>
          </div>
        )}

        {tab === 'users' && selectedNote && (
          <div className="p-6">
            <button onClick={() => setSelectedNote(null)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-4">
              <ArrowLeft size={12} /> 목록으로
            </button>
            <h3 className="text-sm font-bold mb-2">{selectedNote.title}</h3>
            <p className="text-[10px] text-muted-foreground mb-4">읽기 전용 · {new Date(selectedNote.updated_at).toLocaleDateString('ko-KR')}</p>
            <div className="border rounded-xl p-6" style={{ backgroundColor: 'hsl(var(--score-bg))' }}>
              <ScoreRenderer appData={selectedNote.data as unknown as AppData} langMode="both" onDurationChange={() => {}} />
            </div>
          </div>
        )}

        {tab === 'users' && !selectedUser && (
          <div className="flex items-center justify-center h-full text-muted-foreground text-xs">
            왼쪽에서 사용자를 선택하세요
          </div>
        )}

        {tab === 'feedback' && (
          <div className="flex items-center justify-center h-full text-muted-foreground text-xs">
            왼쪽에서 피드백을 확인하세요
          </div>
        )}
      </main>
    </div>
  );
}
