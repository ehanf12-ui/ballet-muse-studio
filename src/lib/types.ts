export interface Movement {
  id: string;
  key: string; // movement dictionary key
  beat: number; // 1-8
  duration: number; // how many beats
  hasAnd: boolean; // & beat before this
  footPosition?: number; // 1-5
  direction?: 'right' | 'left' | 'front' | 'back';
}

export interface Exercise {
  id: string;
  movements: Movement[];
}

export interface Section {
  id: string;
  type: 'barre' | 'centre';
  exercises: Exercise[];
}

let _idCounter = 0;
export function genId(): string {
  return `id_${++_idCounter}_${Date.now()}`;
}
