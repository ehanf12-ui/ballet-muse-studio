import { Settings, Download, Trash2, LogOut, UserX, Palette, MessageSquarePlus, Shield } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useState } from 'react';
import ProfileSettingsDialog from './ProfileSettingsDialog';
import FeedbackDialog from './FeedbackDialog';
import { useTheme, themeLabels, ThemeName } from '@/contexts/ThemeContext';
import { useAdminRole } from '@/hooks/useAdminRole';
import { Link } from 'react-router-dom';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { User } from '@supabase/supabase-js';
import type { UserProfile } from '@/hooks/useAuth';

interface MobileProfileViewProps {
  user: User;
  profile: UserProfile | null;
  onSignOut: () => void;
  onExportNotes: () => void;
  onResetNotes: () => Promise<void>;
  onDeleteAccount: () => Promise<void>;
  onUpdateNickname: (nickname: string) => Promise<boolean>;
  onCheckNickname: (nickname: string) => Promise<boolean>;
}

export default function MobileProfileView({
  user, profile, onSignOut, onExportNotes, onResetNotes, onDeleteAccount, onUpdateNickname, onCheckNickname,
}: MobileProfileViewProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [resetDialog, setResetDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const { theme, setTheme } = useTheme();
  const { isAdmin } = useAdminRole(user.id);

  const avatarUrl = profile?.avatar_url || user.user_metadata?.avatar_url || user.user_metadata?.picture;
  const displayName = profile?.nickname || profile?.display_name || user.user_metadata?.full_name || user.email?.split('@')[0] || '사용자';

  const MenuItem = ({ icon: Icon, label, onClick, destructive }: { icon: typeof Settings; label: string; onClick: () => void; destructive?: boolean }) => (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 w-full px-4 py-3 min-h-[48px] text-left rounded-xl transition-colors ${
        destructive ? 'text-destructive hover:bg-destructive/5' : 'text-foreground hover:bg-muted'
      }`}
    >
      <Icon size={18} />
      <span className="text-sm font-medium">{label}</span>
    </button>
  );

  return (
    <div className="p-4 space-y-4">
      {/* Profile card */}
      <div className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border">
        <Avatar className="h-14 w-14">
          <AvatarImage src={avatarUrl} alt={displayName} />
          <AvatarFallback className="text-lg font-bold bg-primary/10 text-primary">
            {displayName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <div className="text-base font-bold text-foreground truncate">{displayName}</div>
          <div className="text-xs text-muted-foreground truncate">{user.email}</div>
        </div>
      </div>

      {/* Menu items */}
      <div className="bg-card rounded-2xl border border-border divide-y divide-border overflow-hidden">
        <MenuItem icon={Settings} label="프로필 설정" onClick={() => setShowSettings(true)} />
        <MenuItem icon={MessageSquarePlus} label="의견 보내기" onClick={() => setShowFeedback(true)} />
        <MenuItem icon={Download} label="내 노트 백업" onClick={onExportNotes} />
      </div>

      {/* Theme selection */}
      <div className="bg-card rounded-2xl border border-border p-4">
        <div className="flex items-center gap-2 mb-3">
          <Palette size={16} className="text-muted-foreground" />
          <span className="text-sm font-bold text-foreground">테마</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(themeLabels) as ThemeName[]).map(t => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all min-h-[44px] ${
                theme === t ? 'bg-primary/10 text-primary border border-primary/30' : 'bg-muted text-muted-foreground border border-transparent'
              }`}
            >
              {themeLabels[t]}
            </button>
          ))}
        </div>
      </div>

      {isAdmin && (
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <Link to="/admin" className="flex items-center gap-3 w-full px-4 py-3 min-h-[48px] text-foreground hover:bg-muted transition-colors">
            <Shield size={18} />
            <span className="text-sm font-medium">관리자 대시보드</span>
          </Link>
        </div>
      )}

      <div className="bg-card rounded-2xl border border-border divide-y divide-border overflow-hidden">
        <MenuItem icon={Trash2} label="데이터 초기화" onClick={() => setResetDialog(true)} destructive />
        <MenuItem icon={UserX} label="회원 탈퇴" onClick={() => setDeleteDialog(true)} destructive />
        <MenuItem icon={LogOut} label="로그아웃" onClick={onSignOut} />
      </div>

      <ProfileSettingsDialog open={showSettings} onOpenChange={setShowSettings} profile={profile}
        onUpdateNickname={onUpdateNickname} onCheckNickname={onCheckNickname} />
      <FeedbackDialog open={showFeedback} onOpenChange={setShowFeedback} user={user} profile={profile} />

      <AlertDialog open={resetDialog} onOpenChange={setResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>데이터 초기화</AlertDialogTitle>
            <AlertDialogDescription>정말 모든 기록을 삭제하시겠습니까?</AlertDialogDescription>
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
            <AlertDialogDescription>계정을 삭제하면 모든 데이터가 영구 삭제됩니다.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={async () => { await onDeleteAccount(); setDeleteDialog(false); }}>탈퇴하기</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
