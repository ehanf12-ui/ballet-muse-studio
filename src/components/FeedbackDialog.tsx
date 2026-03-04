import { useState } from 'react';
import { MessageSquarePlus, Loader2 } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { User } from '@supabase/supabase-js';
import type { UserProfile } from '@/hooks/useAuth';

interface FeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
  profile: UserProfile | null;
}

export default function FeedbackDialog({ open, onOpenChange, user, profile }: FeedbackDialogProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error('제목과 내용을 모두 입력해주세요.');
      return;
    }
    setSending(true);
    try {
      // Save to DB
      const { error: dbError } = await supabase.from('feedback').insert({
        user_id: user.id,
        title: title.trim(),
        content: content.trim(),
      });
      if (dbError) throw dbError;

      // Send email
      const { error: fnError } = await supabase.functions.invoke('send-feedback-email', {
        body: {
          title: title.trim(),
          content: content.trim(),
          userEmail: user.email,
          userNickname: profile?.nickname || profile?.display_name || user.email,
        },
      });
      if (fnError) console.error('Email send failed:', fnError);

      toast.success('의견이 관리자에게 전달되었습니다!');
      setTitle('');
      setContent('');
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      toast.error('피드백 전송에 실패했습니다.');
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquarePlus size={18} className="text-primary" /> 의견 보내기
          </DialogTitle>
          <DialogDescription>관리자에게 피드백이나 개선 요청을 보낼 수 있습니다.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <Input
            placeholder="제목"
            value={title}
            onChange={e => setTitle(e.target.value)}
            maxLength={100}
          />
          <Textarea
            placeholder="의견을 자유롭게 작성해주세요..."
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={5}
            maxLength={1000}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={sending}>취소</Button>
          <Button onClick={handleSubmit} disabled={sending || !title.trim() || !content.trim()}>
            {sending ? <Loader2 size={14} className="animate-spin mr-1" /> : null}
            보내기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
