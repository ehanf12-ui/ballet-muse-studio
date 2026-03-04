import { useState, useCallback, useRef } from 'react';

interface UseVoiceInputReturn {
  listening: boolean;
  supported: boolean;
  startListening: (onResult: (text: string) => void) => void;
  stopListening: () => void;
}

export function useVoiceInput(): UseVoiceInputReturn {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const supported = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const startListening = useCallback((onResult: (text: string) => void) => {
    if (!supported) return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'ko-KR';
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      const last = event.results[event.results.length - 1];
      if (last.isFinal) {
        onResult(last[0].transcript);
      }
    };

    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);

    recognition.start();
    recognitionRef.current = recognition;
    setListening(true);
  }, [supported]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  return { listening, supported, startListening, stopListening };
}
