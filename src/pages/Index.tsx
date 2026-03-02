import { useState, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { AppData, genId } from '@/lib/types';
import { initBarreTitles, initCenterTitles } from '@/lib/data';
import TipRotator from '@/components/TipRotator';
import InputPanel from '@/components/InputPanel';
import ScoreRenderer from '@/components/ScoreRenderer';

type LangMode = 'both' | 'kr' | 'fr';

const Index = () => {
  const [langMode, setLangMode] = useState<LangMode>('both');
  const [apiKey, setApiKey] = useState('');
  const [appData, setAppData] = useState<AppData>({ barre: [], center: [] });

  // Initialize sections
  useEffect(() => {
    setAppData({
      barre: initBarreTitles.map(t => ({
        id: genId(),
        title: t,
        input: t === "플리에" ? "(1번발)\n(2번발)\n(4번발)\n(5번발)" : "",
        steps: [],
        loading: false,
      })),
      center: initCenterTitles.map(t => ({
        id: genId(),
        title: t,
        input: "",
        steps: [],
        loading: false,
      })),
    });
  }, []);

  // AI processing
  const processAI = useCallback(async (category: 'barre' | 'center', sectionId: string) => {
    const section = appData[category].find(s => s.id === sectionId);
    if (!section || !section.input.trim()) return;
    if (!apiKey.trim()) {
      alert('Gemini API 키를 입력해주세요.');
      return;
    }

    setAppData(prev => ({
      ...prev,
      [category]: prev[category].map(s => s.id === sectionId ? { ...s, loading: true } : s)
    }));

    const systemPrompt = `당신은 발레 전문가입니다. 사용자의 입력을 분석해 JSON 배열로만 응답하세요. 
    - 'side': 직접 언급된 방향(오른쪽/왼쪽/오른/왼)만 기록.
    - 'pose': 직접 언급된 발 번호(1~5번발)만 기록.
    - 'is_outbeat': 동작 바로 앞에 '&' 기호가 있는 경우 true.
    - 'duration': 명시된 횟수나 일반적인 발레 박자를 따름.
    JSON 구조: [{"term_kr":"명칭", "term_fr":"French", "start_beat":1, "duration":1, "side": "방향"|null, "pose": "발포지션"|null, "is_outbeat": boolean}]`;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: section.input }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
            generationConfig: { responseMimeType: "application/json" }
          })
        }
      );

      const resData = await response.json();
      const steps = JSON.parse(resData.candidates[0].content.parts[0].text);

      setAppData(prev => ({
        ...prev,
        [category]: prev[category].map(s => s.id === sectionId ? { ...s, steps, loading: false } : s)
      }));
    } catch (error) {
      console.error("AI Analysis Error:", error);
      setAppData(prev => ({
        ...prev,
        [category]: prev[category].map(s => s.id === sectionId ? { ...s, loading: false } : s)
      }));
    }
  }, [appData, apiKey]);

  // Duration change
  const handleDurationChange = useCallback((category: 'barre' | 'center', sectionId: string, stepIndex: number, delta: number) => {
    setAppData(prev => {
      const newData = JSON.parse(JSON.stringify(prev));
      const section = newData[category].find((s: any) => s.id === sectionId);
      if (!section) return prev;
      const targetStep = section.steps[stepIndex];
      targetStep.duration = Math.max(1, targetStep.duration + delta);
      for (let i = stepIndex + 1; i < section.steps.length; i++) {
        const prevStep = section.steps[i - 1];
        section.steps[i].start_beat = prevStep.start_beat + prevStep.duration;
      }
      return newData;
    });
  }, []);

  const addSection = (category: 'barre' | 'center') => {
    setAppData(prev => ({
      ...prev,
      [category]: [...prev[category], {
        id: genId(),
        title: `새 ${category === 'barre' ? '바' : '센터'} 순서`,
        input: "",
        steps: [],
        loading: false,
      }]
    }));
  };

  return (
    <div className="flex h-screen w-full flex-col bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {/* Header */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b bg-white px-6 z-50 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-pink-500 rounded-lg flex items-center justify-center text-white font-black text-sm">B</div>
            <h1 className="text-lg font-black tracking-tighter font-sans">
              Ballet Score <span className="text-pink-500">Studio</span>
            </h1>
          </div>
          <div className="h-4 w-[1px] bg-slate-200" />
          <div className="flex bg-slate-100 p-0.5 rounded-lg">
            {(['both', 'kr', 'fr'] as const).map(m => (
              <button
                key={m}
                onClick={() => setLangMode(m)}
                className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${langMode === m ? 'bg-white shadow-sm text-pink-500' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {m.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2 items-center">
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Gemini API Key"
            className="text-[10px] px-3 py-1.5 border border-slate-200 rounded-lg w-48 outline-none focus:border-pink-300"
          />
          <button
            onClick={() => addSection('barre')}
            className="flex items-center gap-1.5 bg-white border border-pink-100 text-pink-600 px-4 py-1.5 rounded-xl text-xs font-bold hover:bg-pink-50 transition-all shadow-sm"
          >
            <Plus size={14} /> BARRE
          </button>
          <button
            onClick={() => addSection('center')}
            className="flex items-center gap-1.5 bg-slate-800 text-white px-4 py-1.5 rounded-xl text-xs font-bold hover:bg-slate-700 transition-all shadow-md"
          >
            <Plus size={14} /> CENTER
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="flex flex-1 overflow-hidden">
        {/* Left: Input */}
        <aside className="w-[35%] overflow-y-auto border-r bg-white p-4 space-y-3">
          <TipRotator />
          <InputPanel appData={appData} setAppData={setAppData} onProcess={processAI} />
        </aside>

        {/* Right: Score */}
        <section className="w-[65%] overflow-y-auto p-8 bg-[#fdfafb]">
          <ScoreRenderer appData={appData} langMode={langMode} onDurationChange={handleDurationChange} />
        </section>
      </main>
    </div>
  );
};

export default Index;
