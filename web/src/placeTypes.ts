/** All place types shown in filters (order preserved). */
export const PLACE_TYPES = [
  'spawn',
  'village',
  'ancient city',
  'stronghold',
  'lushcave',
  'base',
  'ocean monument',
  'pillager',
  'shipwreck',
  'jungle temple',
  'desert temple',
  'mineshaft',
  'divers',
  'trial chambers',
  'ruined portal',
  'mine',
] as const;

export type PlaceType = (typeof PLACE_TYPES)[number];

export type PlaceTypeColor = {
  /** Marker fill / badge accent */
  fill: string;
  /** Marker outline */
  stroke: string;
};

/** Color code per place type (map markers + UI). */
export const PLACE_TYPE_COLORS: Record<PlaceType, PlaceTypeColor> = {
  spawn: { fill: '#34c759', stroke: '#ffffff' },
  village: { fill: '#30b0c7', stroke: '#ffffff' },
  'ancient city': { fill: '#5e5ce6', stroke: '#ffffff' },
  stronghold: { fill: '#8b5cf6', stroke: '#ffffff' },
  lushcave: { fill: '#3ddc84', stroke: '#ffffff' },
  base: { fill: '#007aff', stroke: '#ffffff' },
  'ocean monument': { fill: '#00c7be', stroke: '#ffffff' },
  pillager: { fill: '#ff9500', stroke: '#ffffff' },
  shipwreck: { fill: '#5ac8fa', stroke: '#ffffff' },
  'jungle temple': { fill: '#2d6a4f', stroke: '#ffffff' },
  'desert temple': { fill: '#d4a017', stroke: '#ffffff' },
  mineshaft: { fill: '#8e8e93', stroke: '#ffffff' },
  divers: { fill: '#ac8e68', stroke: '#ffffff' },
  'trial chambers': { fill: '#bf5af2', stroke: '#ffffff' },
  'ruined portal': { fill: '#ff2d55', stroke: '#ffffff' },
  mine: { fill: '#a2845e', stroke: '#ffffff' },
};

const DEFAULT_TYPE_COLOR: PlaceTypeColor = { fill: '#8e8e93', stroke: '#ffffff' };

export function normalizePlaceType(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function matchPlaceType(pinType: string, canonical: string): boolean {
  if (!pinType.trim()) return false;
  return normalizePlaceType(pinType) === normalizePlaceType(canonical);
}

/** Map JSON value to a known type, or keep trimmed original if unknown. */
export function canonicalPlaceType(raw: string): string {
  const n = normalizePlaceType(raw);
  if (!n) return '';
  const found = PLACE_TYPES.find((t) => normalizePlaceType(t) === n);
  return found ?? raw.trim();
}

export function resolvePlaceType(type: string): PlaceType | null {
  const n = normalizePlaceType(type);
  if (!n) return null;
  return PLACE_TYPES.find((t) => normalizePlaceType(t) === n) ?? null;
}

export function getPlaceTypeColor(type: string): PlaceTypeColor {
  const key = resolvePlaceType(type);
  if (key) return PLACE_TYPE_COLORS[key];
  return DEFAULT_TYPE_COLOR;
}
