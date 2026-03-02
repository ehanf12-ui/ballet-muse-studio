export interface Step {
  term_kr: string;
  term_fr: string;
  start_beat: number;
  duration: number;
  side: string | null;
  pose: string | null;
  is_outbeat: boolean;
}

export interface SectionData {
  id: string;
  title: string;
  input: string;
  steps: Step[];
  loading: boolean;
}

export interface AppData {
  barre: SectionData[];
  center: SectionData[];
}

export function genId(): string {
  return Math.random().toString(36).substr(2, 9);
}
