import { useState, useEffect } from 'react';
import { getTips, LangMode } from '@/lib/i18n';

export default function TipRotator({ lang }: { lang: LangMode }) {
  const tips = getTips(lang);
  const [idx, setIdx] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIdx((prev) => (prev + 1) % tips.length);
        setFade(true);
      }, 300);
    }, 10000);
    return () => clearInterval(interval);
  }, [tips.length]);

  useEffect(() => {
    setIdx(0);
    setFade(true);
  }, [lang]);

  return (
    <div
      className={`tip-card transition-opacity duration-300 ${fade ? 'opacity-100' : 'opacity-0'}`}
    >
      {tips[idx]}
    </div>
  );
}
