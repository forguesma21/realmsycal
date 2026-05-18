import { canonicalPlaceType } from './placeTypes';
import type { Pin, Realm } from './types';

export const COORDS_URL = `${import.meta.env.BASE_URL}coords.json`;

/** Shape of `web/public/coords.json` — edit this file to add realms and places. */
export type CoordsFile = {
  realms?: CoordsRealmJson[];
};

export type CoordsRealmJson = {
  id?: string;
  name?: string;
  places?: CoordsPlaceJson[];
};

export type CoordsPlaceJson = {
  id?: string;
  name?: string;
  label?: string;
  type?: string;
  x?: number;
  y?: number | null;
  z?: number;
  notes?: string;
};

function slug(s: string, fallback: string) {
  const base = s
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return base || fallback;
}

function parsePlace(raw: CoordsPlaceJson, realmId: string, index: number): Pin | null {
  const label = String(raw.name ?? raw.label ?? '').trim();
  const x = Number(raw.x);
  const z = Number(raw.z);
  if (!label || !Number.isFinite(x) || !Number.isFinite(z)) return null;
  const yRaw = raw.y;
  const y = yRaw === undefined || yRaw === null ? null : Number(yRaw);
  const id = raw.id?.trim() || `${realmId}-place-${index}`;
  return {
    id,
    label,
    type: canonicalPlaceType(String(raw.type ?? '')),
    x,
    y: y !== null && Number.isFinite(y) ? y : null,
    z,
    notes: String(raw.notes ?? '').trim(),
  };
}

export function parseCoordsFile(data: CoordsFile): { realms: Realm[]; pinsByRealm: Record<string, Pin[]> } {
  const realms: Realm[] = [];
  const pinsByRealm: Record<string, Pin[]> = {};
  const list = Array.isArray(data.realms) ? data.realms : [];

  list.forEach((raw, realmIndex) => {
    const name = String(raw.name ?? '').trim();
    if (!name) return;
    const id = raw.id?.trim() || slug(name, `realm-${realmIndex}`);
    realms.push({ id, name });
    const places = Array.isArray(raw.places) ? raw.places : [];
    pinsByRealm[id] = places
      .map((p, i) => parsePlace(p, id, i))
      .filter((p): p is Pin => p !== null);
  });

  return { realms, pinsByRealm };
}

export async function loadCoords(): Promise<
  { ok: true; realms: Realm[]; pinsByRealm: Record<string, Pin[]> } | { ok: false; error: string }
> {
  try {
    const res = await fetch(`${COORDS_URL}?t=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) return { ok: false, error: `Could not load coords.json (${res.status})` };
    const data = (await res.json()) as CoordsFile;
    const { realms, pinsByRealm } = parseCoordsFile(data);
    return { ok: true, realms, pinsByRealm };
  } catch {
    return { ok: false, error: 'Invalid coords.json — check JSON syntax.' };
  }
}
