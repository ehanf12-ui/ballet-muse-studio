import { Folder, Trash2, Loader2, FileText } from 'lucide-react';
import { NoteItem } from '@/hooks/useNotes';

interface NotesVaultProps {
  notes: NoteItem[];
  loading: boolean;
  currentNoteId: string | null;
  onLoad: (note: NoteItem) => void;
  onDelete: (noteId: string) => void;
}

export default function NotesVault({ notes, loading, currentNoteId, onLoad, onDelete }: NotesVaultProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-1">
        <Folder size={10} className="text-slate-400" />
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          내 보관함
        </span>
        <span className="text-[9px] text-slate-300 font-bold">{notes.length}</span>
      </div>

      {loading && (
        <div className="flex justify-center py-4">
          <Loader2 size={16} className="animate-spin text-slate-300" />
        </div>
      )}

      {!loading && notes.length === 0 && (
        <div className="text-center py-4">
          <p className="text-[10px] text-slate-300 font-medium">저장된 노트가 없습니다.</p>
        </div>
      )}

      <div className="space-y-1 max-h-36 overflow-y-auto">
        {notes.map(note => (
          <div
            key={note.id}
            className={`group flex items-center gap-2 px-3 py-2 rounded-xl border transition-all cursor-pointer ${
              currentNoteId === note.id
                ? 'border-pink-200 bg-pink-50/50'
                : 'border-slate-100 bg-white hover:border-pink-200'
            }`}
            onClick={() => onLoad(note)}
          >
            <FileText size={12} className="text-slate-300 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-bold text-slate-700 truncate">{note.title}</div>
              <div className="text-[9px] text-slate-300">
                {new Date(note.updated_at).toLocaleDateString('ko-KR')}
              </div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(note.id); }}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 hover:text-red-400"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
