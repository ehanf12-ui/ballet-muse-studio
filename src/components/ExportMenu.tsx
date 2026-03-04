import { useState, useRef } from 'react';
import { Download, Image, Printer, Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';

interface ExportMenuProps {
  scoreRef: React.RefObject<HTMLElement | null>;
  noteTitle?: string;
}

export default function ExportMenu({ scoreRef, noteTitle = '발레 노트' }: ExportMenuProps) {
  const [exporting, setExporting] = useState(false);

  const handleImageExport = async () => {
    if (!scoreRef.current) {
      toast.error('내보낼 콘텐츠가 없습니다.');
      return;
    }

    setExporting(true);
    try {
      // Create a wrapper with watermark for capture
      const wrapper = document.createElement('div');
      wrapper.style.cssText = 'position:absolute;left:-9999px;top:0;background:#fff;padding:40px 32px 60px;';
      
      const clone = scoreRef.current.cloneNode(true) as HTMLElement;
      clone.style.background = '#fff';
      wrapper.appendChild(clone);

      // Watermark
      const watermark = document.createElement('div');
      watermark.style.cssText = 'text-align:center;padding-top:24px;font-size:10px;color:#d1d5db;font-family:Inter,sans-serif;letter-spacing:0.05em;';
      watermark.textContent = 'Created by Ballet Muse Studio';
      wrapper.appendChild(watermark);

      document.body.appendChild(wrapper);

      const canvas = await html2canvas(wrapper, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        logging: false,
      });

      document.body.removeChild(wrapper);

      const link = document.createElement('a');
      link.download = `${noteTitle}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      toast.success('이미지가 저장되었습니다.');
    } catch (err) {
      console.error('Export error:', err);
      toast.error('이미지 저장 중 오류가 발생했습니다.');
    } finally {
      setExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          disabled={exporting}
          className="flex items-center gap-1.5 bg-white border border-border text-muted-foreground px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-secondary transition-all shadow-sm disabled:opacity-50"
        >
          {exporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
          내보내기
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem onClick={handleImageExport} disabled={exporting}>
          <Image size={14} className="mr-2" />
          이미지로 저장
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handlePrint}>
          <Printer size={14} className="mr-2" />
          인쇄하기
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
