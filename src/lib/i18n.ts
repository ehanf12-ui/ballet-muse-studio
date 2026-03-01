export type LangMode = 'KR+FR' | 'KR' | 'FR';

interface Translations {
  barre: string;
  centre: string;
  addExercise: string;
  addMovement: string;
  right: string;
  left: string;
  position: string;
  duration: string;
  beat: string;
  andBeat: string;
  score: string;
  input: string;
  tips: string[];
  movements: Record<string, { kr: string; fr: string }>;
  sections: { barre: string; centre: string };
  footPositions: string[];
  directions: { right: string; left: string; front: string; back: string };
}

const movementDict: Record<string, { kr: string; fr: string }> = {
  plie: { kr: '플리에', fr: 'Plié' },
  tendu: { kr: '탕뒤', fr: 'Tendu' },
  degage: { kr: '데가제', fr: 'Dégagé' },
  rondDeJambe: { kr: '롱드잠브', fr: 'Rond de Jambe' },
  fondu: { kr: '퐁뒤', fr: 'Fondu' },
  frappe: { kr: '프라페', fr: 'Frappé' },
  adagio: { kr: '아다지오', fr: 'Adagio' },
  grandBattement: { kr: '그랑바뜨망', fr: 'Grand Battement' },
  releve: { kr: '르르베', fr: 'Relevé' },
  balance: { kr: '발란세', fr: 'Balancé' },
  pirouette: { kr: '피루엣', fr: 'Pirouette' },
  assemble: { kr: '아상블레', fr: 'Assemblé' },
  jete: { kr: '주떼', fr: 'Jeté' },
  changement: { kr: '샹쥬망', fr: 'Changement' },
  echappe: { kr: '에샤페', fr: 'Échappé' },
  sissonne: { kr: '시손느', fr: 'Sissonne' },
  chasse: { kr: '샤세', fr: 'Chassé' },
  tombe: { kr: '통베', fr: 'Tombé' },
  pasDeBourree: { kr: '파드부레', fr: 'Pas de Bourrée' },
  sousSus: { kr: '수쉬', fr: 'Sous-sus' },
  portDeBras: { kr: '포르드브라', fr: 'Port de Bras' },
  cambre: { kr: '캉브레', fr: 'Cambré' },
};

export function getMovementName(key: string, lang: LangMode): string {
  const m = movementDict[key];
  if (!m) return key;
  if (lang === 'KR') return m.kr;
  if (lang === 'FR') return m.fr;
  return `${m.kr} ${m.fr}`;
}

export function getMovementKeys(): string[] {
  return Object.keys(movementDict);
}

const tipsKR = [
  '💡 플리에는 항상 무릎이 발끝 방향을 향하게 하세요.',
  '💡 탕뒤에서 발바닥이 바닥을 스치듯 밀어내세요.',
  '💡 롱드잠브는 골반이 흔들리지 않도록 주의하세요.',
  '💡 아다지오에서 호흡을 동작과 함께 사용하세요.',
  '💡 그랑바뜨망은 컨트롤된 힘으로 올리세요.',
  '💡 피루엣은 스팟팅이 핵심입니다.',
];

const tipsFR = [
  '💡 En plié, les genoux suivent la direction des orteils.',
  '💡 En tendu, brossez le sol avec la plante du pied.',
  '💡 En rond de jambe, gardez le bassin stable.',
  '💡 En adagio, respirez avec le mouvement.',
  '💡 En grand battement, montez avec contrôle.',
  '💡 En pirouette, le spotting est essentiel.',
];

export function getTips(lang: LangMode): string[] {
  if (lang === 'FR') return tipsFR;
  return tipsKR;
}

export function t(key: string, lang: LangMode): string {
  const dict: Record<string, Record<LangMode, string>> = {
    barre: { 'KR+FR': '바 Barre', KR: '바', FR: 'Barre' },
    centre: { 'KR+FR': '센터 Centre', KR: '센터', FR: 'Centre' },
    addExercise: { 'KR+FR': '운동 추가', KR: '운동 추가', FR: 'Ajouter exercice' },
    addMovement: { 'KR+FR': '동작 추가', KR: '동작 추가', FR: 'Ajouter mouvement' },
    right: { 'KR+FR': '오른쪽 Droite', KR: '오른쪽', FR: 'Droite' },
    left: { 'KR+FR': '왼쪽 Gauche', KR: '왼쪽', FR: 'Gauche' },
    front: { 'KR+FR': '앞 Devant', KR: '앞', FR: 'Devant' },
    back: { 'KR+FR': '뒤 Derrière', KR: '뒤', FR: 'Derrière' },
    score: { 'KR+FR': '악보 Score', KR: '악보', FR: 'Score' },
    input: { 'KR+FR': '입력 Saisie', KR: '입력', FR: 'Saisie' },
    delete: { 'KR+FR': '삭제', KR: '삭제', FR: 'Suppr.' },
    exercise: { 'KR+FR': '운동', KR: '운동', FR: 'Exercice' },
  };
  return dict[key]?.[lang] ?? key;
}

export function getFootPosition(n: number, lang: LangMode): string {
  const kr = `${n}번발`;
  const fr = `${n}ème pos.`;
  if (lang === 'KR') return kr;
  if (lang === 'FR') return fr;
  return `${kr} / ${fr}`;
}

export function getDirection(dir: string, lang: LangMode): string {
  return t(dir, lang);
}
