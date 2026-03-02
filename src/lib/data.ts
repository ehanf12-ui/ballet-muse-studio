export const termMapping: Record<string, string> = {
  "플리에": "Plié", "드미 플리에": "Demi-plié", "그랑 플리에": "Grand plié", "포르 드 브라": "Port de bras", "를르베": "Relevé", "캄브레": "Cambré",
  "탄듀": "Tendu", "탄듀 앞": "Tendu devant", "탄듀 옆": "Tendu à la seconde", "탄듀 뒤": "Tendu derrière", "데가제": "Dégagé", "쿠뻬": "Coupé",
  "줴떼": "Jeté", "줴떼 앞": "Jeté devant", "줴떼 옆": "Jeté de côté", "줴떼 뒤": "Jeté derrière", "삐케": "Piqué", "쁘띠 바뜨망": "Petit battement",
  "롱드잠": "Rond de jambe", "롱드잠 아떼르": "Rond de jambe à terre", "롱드잠 앙 레르": "Rond de jambe en l'air", "그랑 롱드잠": "Grand rond de jambe", "파 드 바스크": "Pas de basque",
  "아다지오": "Adagio", "드벨로뻬 앞": "Développé devant", "드벨로뻬 옆": "Développé à la seconde", "드벨로뻬 뒤": "Développé derrière", "아라베스크": "Arabesque", "애티튜드": "Attitude",
  "그랑바뜨망": "Grand battement", "그랑 바뜨망 앞": "Grand battement devant", "그랑 바뜨망 옆": "Grand battement de côté", "그랑 바뜨망 뒤": "Grand battement derrière", "클로쉬": "En cloche",
  "왈츠": "Waltz", "발랑세": "Balancé", "왈츠 스텝": "Pas de valse", "피루엣": "Pirouette", "쉐네": "Chaînés",
  "스몰 알레그로": "Petit Allegro", "그랑 알레그로": "Grand Allegro", "알레그로": "Allegro", "쏘떼": "Sauté", "샹즈망": "Changement", "에샤뻬": "Échappé", "아쌈블레": "Assemblé", "주떼": "Jeté", "시쏜": "Sissonne", "그랑 제떼": "Grand jeté",
  "1번발": "1st Pos.", "2번발": "2nd Pos.", "4번발": "4th Pos.", "5번발": "5th Pos.",
  "오른쪽": "Right", "왼쪽": "Left", "오른": "R", "왼": "L"
};

export const sectionTags: Record<string, string[]> = {
  "플리에": ["드미 플리에", "그랑 플리에", "포르 드 브라", "를르베", "캄브레", "1번발", "2번발", "4번발", "5번발"],
  "탄듀": ["탄듀 앞", "탄듀 옆", "탄듀 뒤", "데가제", "를르베", "쿠뻬", "&", "오른", "왼"],
  "줴떼": ["줴떼 앞", "줴떼 옆", "줴떼 뒤", "삐케", "쁘띠 바뜨망", "&", "오른", "왼"],
  "롱드잠": ["롱드잠 아떼르", "롱드잠 앙 레르", "그랑 롱드잠", "파 드 바스크"],
  "아다지오": ["드벨로뻬 앞", "드벨로뻬 옆", "드벨로뻬 뒤", "아라베스크", "애티튜드"],
  "그랑바뜨망": ["그랑 바뜨망 앞", "그랑 바뜨망 옆", "그랑 바뜨망 뒤", "클로쉬"],
  "왈츠": ["발랑세", "왈츠 스텝", "피루엣", "쉐네"],
  "스몰 알레그로": ["쏘떼", "샹즈망", "에샤뻬", "아쌈블레", "주떼", "&"],
  "그랑 알레그로": ["그랑 제떼", "쏘 드 샤", "그랑 제떼 앙 투르낭", "&"]
};

export const tips = [
  { title: "앤박자(&) 입력법", desc: "동작 바로 앞에 '&'를 적으세요 (예: '& 플리에'). 해당 박자만 앤박자 칸이 확장됩니다." },
  { title: "지능형 오타 보정", desc: "'프리에'나 '뿌리에'라고 적어도 AI가 'Plié'로 정확히 변환합니다." },
  { title: "발 번호 기입", desc: "동작 앞에 '5번발'을 붙이면 상단 설명란에 자동으로 위치가 표기됩니다." },
  { title: "박자 자동 조절", desc: "동작 블록의 +/- 버튼을 누르면 뒤에 오는 모든 순서가 자동으로 밀려 정렬됩니다." },
  { title: "🎵 왈츠 모드", desc: "음표 아이콘을 눌러 3/4 왈츠 모드로 변경해 보세요. 3박자 단위로 그리드가 강조됩니다." },
  { title: "↖ 몸 방향 표시", desc: "'크로아제'나 '에파세'를 입력하면 악보에 몸의 방향이 화살표 아이콘과 함께 표시됩니다." },
  { title: "💬 피드백 메모", desc: "말풍선 아이콘을 눌러 오늘 수업에서 지적받은 나만의 피드백을 기록해 보세요." },
];

export const initBarreTitles = ["플리에", "탄듀", "줴떼", "롱드잠", "아다지오", "그랑바뜨망"];
export const initCenterTitles = ["아다지오", "탄듀", "왈츠", "스몰 알레그로", "그랑 알레그로"];
