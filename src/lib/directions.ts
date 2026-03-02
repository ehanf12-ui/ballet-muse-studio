// 8-direction stage direction system
export interface DirectionInfo {
  abbr: string;
  arrow: string;
}

// Map direction names to abbreviation + arrow, considering side (R/L)
export function getDirectionInfo(direction: string | null, side: string | null): DirectionInfo | null {
  if (!direction) return null;

  const d = direction.toLowerCase().replace(/\s+/g, '');
  const isLeft = side?.includes('왼') || side?.includes('L') || side?.includes('left');

  if (d.includes('앙파스') || d.includes('enface')) {
    return { abbr: 'EN', arrow: '↑' };
  }
  if (d.includes('크로아제') || d.includes('croisé') || d.includes('croise')) {
    if (d.includes('뒤') || d.includes('derrière') || d.includes('derriere')) {
      return isLeft ? { abbr: 'CR', arrow: '↘' } : { abbr: 'CR', arrow: '↙' };
    }
    return isLeft ? { abbr: 'CR', arrow: '↗' } : { abbr: 'CR', arrow: '↖' };
  }
  if (d.includes('에파세') || d.includes('effacé') || d.includes('efface')) {
    if (d.includes('뒤') || d.includes('derrière') || d.includes('derriere')) {
      return isLeft ? { abbr: 'EF', arrow: '↙' } : { abbr: 'EF', arrow: '↘' };
    }
    return isLeft ? { abbr: 'EF', arrow: '↖' } : { abbr: 'EF', arrow: '↗' };
  }
  if (d.includes('에카르떼') || d.includes('écarté') || d.includes('ecarte')) {
    return isLeft ? { abbr: 'EC', arrow: '←' } : { abbr: 'EC', arrow: '→' };
  }

  return { abbr: direction.slice(0, 2).toUpperCase(), arrow: '↑' };
}
