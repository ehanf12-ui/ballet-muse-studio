export type TimeSignature = '4/4' | '3/4';

export interface Step {
  term_kr: string;
  term_fr: string;
  start_beat: number;
  duration: number;
  repetition: number;
  side: string | null;
  pose: string | null;
  is_outbeat: boolean;
  direction: string | null;
  measureIndex?: number;
  beatIndex?: number;
  description?: string | null;
}

export interface SectionData {
  id: string;
  title: string;
  input: string;
  steps: Step[];
  loading: boolean;
  timeSignature: TimeSignature;
  correction: string;
}

export interface AppData {
  barre: SectionData[];
  center: SectionData[];
}

export function genId(): string {
  return Math.random().toString(36).substr(2, 9);
}
