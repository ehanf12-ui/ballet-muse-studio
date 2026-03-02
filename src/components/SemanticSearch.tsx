import { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SearchResult {
  term_kr: string;
  term_fr: string;
  reason: string;
}

interface SemanticSearchProps {
  onSelect: (termKr: string) => void;
}

export default function SemanticSearch({ onSelect }: SemanticSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResults([]);

    try {
      const { data, error } = await supabase.functions.invoke('ballet-search', {
        body: { query: query.trim() },
      });

      if (error) throw error;
      setResults(data.results || []);
      if (!data.results?.length) toast.info('검색 결과가 없습니다.');
    } catch (err) {
      console.error('Search error:', err);
      toast.error('검색 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-1">
        <Search size={10} className="text-slate-400" />
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          동작 검색
        </span>
      </div>

      <div className="flex gap-1.5">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="점프, 회전, 가위차기..."
          className="flex-1 text-[11px] px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-pink-200 font-medium text-slate-600"
        />
        <button
          onClick={handleSearch}
          disabled={loading || !query.trim()}
          className="px-3 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-bold hover:bg-pink-600 transition-all disabled:opacity-50"
        >
          {loading ? <Loader2 size={12} className="animate-spin" /> : <Search size={12} />}
        </button>
      </div>

      {results.length > 0 && (
        <div className="space-y-1 max-h-40 overflow-y-auto">
          {results.map((r, i) => (
            <button
              key={i}
              onClick={() => {
                onSelect(r.term_kr);
                toast.success(`"${r.term_kr}" 추가됨`);
              }}
              className="w-full text-left px-3 py-2 bg-white border border-slate-100 rounded-xl hover:border-pink-200 hover:bg-pink-50/50 transition-all group"
            >
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold text-slate-800">{r.term_kr}</span>
                <span className="text-[9px] font-bold text-pink-400 uppercase">{r.term_fr}</span>
              </div>
              <p className="text-[9px] text-slate-400 mt-0.5 truncate">{r.reason}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
