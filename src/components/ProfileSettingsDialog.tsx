import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, Check, X } from 'lucide-react';
import type { UserProfile } from '@/hooks/useAuth';

interface ProfileSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: UserProfile | null;
  onUpdateNickname: (nickname: string) => Promise<boolean>;
  onCheckNickname: (nickname: string) => Promise<boolean>;
}

export default function ProfileSettingsDialog({
  open,
  onOpenChange,
  profile,
  onUpdateNickname,
  onCheckNickname,
}: ProfileSettingsDialogProps) {
  const [nickname, setNickname] = useState('');
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setNickname(profile?.nickname || '');
      setAvailable(null);
    }
  }, [open, profile]);

  useEffect(() => {
    if (!nickname.trim() || nickname === profile?.nickname) {
      setAvailable(null);
      return;
    }
    const timer = setTimeout(async () => {
      setChecking(true);
      const ok = await onCheckNickname(nickname.trim());
      setAvailable(ok);
      setChecking(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [nickname, profile?.nickname, onCheckNickname]);

  const handleSave = async () => {
    if (!nickname.trim() || available === false) return;
    setSaving(true);
    const ok = await onUpdateNickname(nickname.trim());
    setSaving(false);
    if (ok) onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>프로필 설정</DialogTitle>
          <DialogDescription>닉네임을 설정하세요.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={profile?.avatar_url || ''} />
            <AvatarFallback className="text-lg font-bold bg-pink-100 text-pink-600">
              {(profile?.display_name || '?').charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <p className="text-sm text-muted-foreground">{profile?.email}</p>

          <div className="w-full space-y-2">
            <Label htmlFor="nickname">닉네임</Label>
            <div className="relative">
              <Input
                id="nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="닉네임을 입력하세요"
                maxLength={20}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {checking && <Loader2 size={14} className="animate-spin text-muted-foreground" />}
                {!checking && available === true && <Check size={14} className="text-green-500" />}
                {!checking && available === false && <X size={14} className="text-destructive" />}
              </div>
            </div>
            {available === false && (
              <p className="text-xs text-destructive">이미 사용 중인 닉네임입니다.</p>
            )}
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving || !nickname.trim() || available === false} className="w-full">
          {saving ? <Loader2 size={14} className="animate-spin mr-2" /> : null}
          저장
        </Button>
      </DialogContent>
    </Dialog>
  );
}
