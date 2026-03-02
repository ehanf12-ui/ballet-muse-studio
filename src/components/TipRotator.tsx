import { useState, useEffect } from 'react';
import { HelpCircle } from 'lucide-react';
import { tips } from '@/lib/data';

export default function TipRotator() {
  const [currentTip, setCurrentTip] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTip(p => (p + 1) % tips.length), 10000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-2xl p-4 shadow-sm min-h-[75px] flex flex-col justify-center">
      <div className="flex items-center gap-2 mb-1 text-blue-700">
        <span className="flex items-center justify-center bg-blue-100 w-5 h-5 rounded-full">
          <HelpCircle size={12} />
        </span>
        <span className="text-[11px] font-black uppercase tracking-wider">
          {tips[currentTip]?.title}
        </span>
      </div>
      <p className="text-[11px] text-blue-600 leading-relaxed font-medium transition-opacity duration-500">
        {tips[currentTip]?.desc}
      </p>
    </div>
  );
}
