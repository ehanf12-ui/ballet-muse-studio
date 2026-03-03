import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';
import { toast } from 'sonner';

export interface UserProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  nickname: string | null;
  avatar_url: string | null;
  email: string | null;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (!error && data) {
      setProfile(data as unknown as UserProfile);
    }
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (session?.user) {
        setTimeout(() => fetchProfile(session.user.id), 0);
      } else {
        setProfile(null);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (session?.user) fetchProfile(session.user.id);
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const updateNickname = useCallback(async (nickname: string) => {
    if (!user) return false;
    const { error } = await supabase
      .from('profiles')
      .update({ nickname })
      .eq('user_id', user.id);
    if (error) {
      if (error.code === '23505') {
        toast.error('이미 사용 중인 닉네임입니다.');
      } else {
        toast.error('닉네임 저장에 실패했습니다.');
      }
      return false;
    }
    toast.success('닉네임이 저장되었습니다.');
    await fetchProfile(user.id);
    return true;
  }, [user, fetchProfile]);

  const checkNicknameAvailable = useCallback(async (nickname: string): Promise<boolean> => {
    const { data } = await supabase
      .from('profiles')
      .select('id')
      .eq('nickname', nickname)
      .neq('user_id', user?.id ?? '')
      .limit(1);
    return !data || data.length === 0;
  }, [user]);

  const deleteAccount = useCallback(async () => {
    if (!user) return;
    // Delete all notes
    await supabase.from('notes').delete().eq('user_id', user.id);
    // Delete profile
    await supabase.from('profiles').delete().eq('user_id', user.id);
    // Sign out
    await supabase.auth.signOut();
    toast.success('계정이 삭제되었습니다.');
  }, [user]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { user, profile, loading, signOut, updateNickname, checkNicknameAvailable, deleteAccount, fetchProfile };
}
