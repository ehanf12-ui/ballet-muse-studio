import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AppData } from '@/lib/types';
import { toast } from 'sonner';
import type { Json } from '@/integrations/supabase/types';

export interface NoteItem {
  id: string;
  title: string;
  data: AppData;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export function useNotes(userId: string | undefined) {
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotes = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });
    
    if (error) {
      console.error('Fetch notes error:', error);
      toast.error('노트를 불러오지 못했습니다.');
    } else {
      setNotes((data || []).map(d => ({
        id: d.id,
        title: d.title,
        data: d.data as unknown as AppData,
        is_favorite: (d as any).is_favorite ?? false,
        created_at: d.created_at,
        updated_at: d.updated_at,
      })));
    }
    setLoading(false);
  }, [userId]);

  const saveNote = useCallback(async (title: string, appData: AppData, noteId?: string) => {
    if (!userId) return null;

    if (noteId) {
      const { error } = await supabase
        .from('notes')
        .update({ title, data: appData as unknown as Json })
        .eq('id', noteId)
        .eq('user_id', userId);
      if (error) {
        toast.error('저장 실패');
        return null;
      }
      toast.success('저장되었습니다.');
      await fetchNotes();
      return noteId;
    } else {
      const { data, error } = await supabase
        .from('notes')
        .insert({ user_id: userId, title, data: appData as unknown as Json })
        .select('id')
        .single();
      if (error) {
        toast.error('저장 실패');
        return null;
      }
      toast.success('새 노트가 저장되었습니다.');
      await fetchNotes();
      return data?.id ?? null;
    }
  }, [userId, fetchNotes]);

  const toggleFavorite = useCallback(async (noteId: string) => {
    if (!userId) return;
    const note = notes.find(n => n.id === noteId);
    if (!note) return;
    const newVal = !note.is_favorite;
    // Optimistic update
    setNotes(prev => prev.map(n => n.id === noteId ? { ...n, is_favorite: newVal } : n));
    const { error } = await supabase
      .from('notes')
      .update({ is_favorite: newVal } as any)
      .eq('id', noteId)
      .eq('user_id', userId);
    if (error) {
      toast.error('즐겨찾기 변경 실패');
      setNotes(prev => prev.map(n => n.id === noteId ? { ...n, is_favorite: !newVal } : n));
    }
  }, [userId, notes]);

  const deleteNote = useCallback(async (noteId: string) => {
    if (!userId) return;
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', noteId)
      .eq('user_id', userId);
    if (error) {
      toast.error('삭제 실패');
    } else {
      toast.success('노트가 삭제되었습니다.');
      await fetchNotes();
    }
  }, [userId, fetchNotes]);

  const exportNotes = useCallback(() => {
    if (notes.length === 0) {
      toast.info('백업할 노트가 없습니다.');
      return;
    }
    const blob = new Blob([JSON.stringify(notes, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ballet-notes-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('노트가 백업되었습니다.');
  }, [notes]);

  const resetAllNotes = useCallback(async () => {
    if (!userId) return;
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('user_id', userId);
    if (error) {
      toast.error('초기화 실패');
    } else {
      toast.success('모든 노트가 삭제되었습니다.');
      setNotes([]);
    }
  }, [userId]);

  return { notes, loading, fetchNotes, saveNote, deleteNote, toggleFavorite, exportNotes, resetAllNotes };
}
