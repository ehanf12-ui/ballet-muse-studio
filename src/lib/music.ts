export interface BalletTrack {
  id: string;
  title: string;
  composer: string;
  /** Matches section titles from initBarreTitles / initCenterTitles */
  sectionHint: string[];
  /** Time signature this track suits */
  meter: '4/4' | '3/4';
  /** Public-domain audio URL (Wikimedia Commons / Orange Free Sounds) */
  url: string;
  /** Duration label for display */
  durationLabel: string;
}

/**
 * Curated list of public-domain / CC0 classical piano recordings
 * suitable for ballet class accompaniment.
 *
 * Sources:
 *  - Wikimedia Commons (CC0 / Public Domain)
 *  - These are recordings whose copyright has expired or were released under CC0.
 */
export const balletTracks: BalletTrack[] = [
  {
    id: 'chopin-nocturne-op9-2',
    title: 'Nocturne Op.9 No.2',
    composer: 'F. Chopin',
    sectionHint: ['플리에', '아다지오'],
    meter: '4/4',
    url: 'https://upload.wikimedia.org/wikipedia/commons/e/e4/Chopin_-_Nocturne_Op._9_No._2_%28Bernd_Krueger%29.ogg',
    durationLabel: '4:33',
  },
  {
    id: 'chopin-waltz-a-minor',
    title: 'Waltz in A minor, B.150',
    composer: 'F. Chopin',
    sectionHint: ['왈츠', '발랑세'],
    meter: '3/4',
    url: 'https://upload.wikimedia.org/wikipedia/commons/1/18/Chopin_-_Waltz_in_A_minor%2C_B_150.ogg',
    durationLabel: '2:11',
  },
  {
    id: 'beethoven-fur-elise',
    title: 'Für Elise',
    composer: 'L.v. Beethoven',
    sectionHint: ['탄듀', '줴떼'],
    meter: '4/4',
    url: 'https://upload.wikimedia.org/wikipedia/commons/7/7e/F%C3%BCr_Elise_-_Ludwig_van_Beethoven.ogg',
    durationLabel: '2:56',
  },
  {
    id: 'tchaikovsky-swan-lake-waltz',
    title: 'Swan Lake – Waltz',
    composer: 'P.I. Tchaikovsky',
    sectionHint: ['왈츠', '그랑 알레그로'],
    meter: '3/4',
    url: 'https://upload.wikimedia.org/wikipedia/commons/5/55/Tchaikovsky-Swan_Lake-Waltz.ogg',
    durationLabel: '6:46',
  },
  {
    id: 'chopin-waltz-op64-2',
    title: 'Waltz Op.64 No.2',
    composer: 'F. Chopin',
    sectionHint: ['롱드잠', '왈츠'],
    meter: '3/4',
    url: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Chopin_Waltz_Op._64_No._2.ogg',
    durationLabel: '3:42',
  },
  {
    id: 'mozart-sonata-k545',
    title: 'Sonata K.545 – I. Allegro',
    composer: 'W.A. Mozart',
    sectionHint: ['스몰 알레그로', '그랑바뜨망'],
    meter: '4/4',
    url: 'https://upload.wikimedia.org/wikipedia/commons/6/69/Mozart_Piano_Sonata_in_C_K545_1st_mov.ogg',
    durationLabel: '3:36',
  },
];

/** Find the best-matching track for a given section title and time signature */
export function findTrackForSection(sectionTitle: string, meter: '4/4' | '3/4'): BalletTrack | null {
  // Exact section match + meter match first
  const exactMeter = balletTracks.find(t => t.sectionHint.includes(sectionTitle) && t.meter === meter);
  if (exactMeter) return exactMeter;
  // Section match only
  const sectionMatch = balletTracks.find(t => t.sectionHint.includes(sectionTitle));
  if (sectionMatch) return sectionMatch;
  // Meter match fallback
  return balletTracks.find(t => t.meter === meter) ?? balletTracks[0];
}
