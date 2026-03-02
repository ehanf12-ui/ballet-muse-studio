import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AppData } from '@/lib/types';
import { toast } from 'sonner';
import type { Json } from '@/integrations/supabase/types';

export interface NoteItem {
  id: string;
  title: string;
  data: AppData;
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

  return { notes, loading, fetchNotes, saveNote, deleteNote };
}
