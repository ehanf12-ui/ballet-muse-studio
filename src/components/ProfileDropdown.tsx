import { useState } from 'react';
import { Settings, Download, Trash2, LogOut, UserX, Palette } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import ProfileSettingsDialog from './ProfileSettingsDialog';
import { useTheme, themeLabels, ThemeName } from '@/contexts/ThemeContext';
import type { User } from '@supabase/supabase-js';
import type { UserProfile } from '@/hooks/useAuth';

interface ProfileDropdownProps {
  user: User;
  profile: UserProfile | null;
  onSignOut: () => void;
  onExportNotes: () => void;
  onResetNotes: () => Promise<void>;
  onDeleteAccount: () => Promise<void>;
  onUpdateNickname: (nickname: string) => Promise<boolean>;
  onCheckNickname: (nickname: string) => Promise<boolean>;
}

export default function ProfileDropdown({
  user, profile, onSignOut, onExportNotes, onResetNotes, onDeleteAccount, onUpdateNickname, onCheckNickname,
}: ProfileDropdownProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [resetDialog, setResetDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const { theme, setTheme } = useTheme();

  const avatarUrl = profile?.avatar_url || user.user_metadata?.avatar_url || user.user_metadata?.picture;
  const displayName = profile?.nickname || profile?.display_name || user.user_metadata?.full_name || user.email?.split('@')[0] || '사용자';

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 rounded-xl px-2 py-1 hover:bg-muted transition-colors outline-none">
            <Avatar className="h-7 w-7">
              <AvatarImage src={avatarUrl} alt={displayName} />
              <AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary">
                {displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs font-bold text-foreground max-w-[80px] truncate hidden sm:inline">{displayName}</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel className="text-xs text-muted-foreground truncate">{user.email}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowSettings(true)}>
            <Settings size={14} className="mr-2" /> 프로필 설정
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Palette size={14} className="mr-2" /> 테마
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              {(Object.keys(themeLabels) as ThemeName[]).map(t => (
                <DropdownMenuItem key={t} onClick={() => setTheme(t)} className={theme === t ? 'bg-primary/10 text-primary' : ''}>
                  {themeLabels[t]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuItem onClick={onExportNotes}>
            <Download size={14} className="mr-2" /> 내 노트 백업
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setResetDialog(true)} className="text-destructive focus:text-destructive">
            <Trash2 size={14} className="mr-2" /> 데이터 초기화
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setDeleteDialog(true)} className="text-destructive focus:text-destructive">
            <UserX size={14} className="mr-2" /> 회원 탈퇴
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onSignOut}>
            <LogOut size={14} className="mr-2" /> 로그아웃
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ProfileSettingsDialog open={showSettings} onOpenChange={setShowSettings} profile={profile}
        onUpdateNickname={onUpdateNickname} onCheckNickname={onCheckNickname} />

      <AlertDialog open={resetDialog} onOpenChange={setResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>데이터 초기화</AlertDialogTitle>
            <AlertDialogDescription>정말 모든 기록을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={async () => { await onResetNotes(); setResetDialog(false); }}>삭제</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>회원 탈퇴</AlertDialogTitle>
            <AlertDialogDescription>계정을 삭제하면 모든 노트와 프로필 정보가 영구적으로 삭제됩니다.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={async () => { await onDeleteAccount(); setDeleteDialog(false); }}>탈퇴하기</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
