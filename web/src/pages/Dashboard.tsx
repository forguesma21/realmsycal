import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react';
import { loadCoords } from '../loadCoords';
import { getPlaceTypeColor, matchPlaceType, PLACE_TYPES } from '../placeTypes';
import type { Pin, Realm } from '../types';
import { PinsMap } from '../components/PinsMap';
import { PlanetIcon } from '../components/PlanetIcon';

type View = 'places' | 'map';

export function Dashboard() {
  const [realms, setRealms] = useState<Realm[]>([]);
  const [pinsByRealm, setPinsByRealm] = useState<Record<string, Pin[]>>({});
  const [realmId, setRealmId] = useState('');
  const [view, setView] = useState<View>('places');
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const selectedRealm = realms.find((r) => r.id === realmId) ?? null;
  const allPins = realmId ? (pinsByRealm[realmId] ?? []) : [];

  const typesWithPins = useMemo(() => {
    const set = new Set<string>();
    PLACE_TYPES.forEach((t) => {
      if (allPins.some((p) => matchPlaceType(p.type, t))) set.add(t);
    });
    return set;
  }, [allPins]);

  const { typesAvailable, typesUnavailable } = useMemo(() => {
    const available: string[] = [];
    const unavailable: string[] = [];
    PLACE_TYPES.forEach((t) => {
      if (typesWithPins.has(t)) available.push(t);
      else unavailable.push(t);
    });
    return { typesAvailable: available, typesUnavailable: unavailable };
  }, [typesWithPins]);

  function renderTypeChip(t: string, hasPins: boolean) {
    const { fill } = getPlaceTypeColor(t);
    return (
      <button
        key={t}
        type="button"
        className={`type-chip ${typeFilter === t ? 'on' : ''} ${!hasPins ? 'type-chip--empty' : ''}`}
        onClick={() => hasPins && setTypeFilter(t)}
        disabled={!hasPins}
        aria-disabled={!hasPins}
        title={hasPins ? undefined : 'Aucun lieu de ce type dans ce realm'}
        style={{ '--type-color': fill } as CSSProperties}
      >
        <span className="type-chip-dot" aria-hidden />
        {t}
      </button>
    );
  }

  const pins = useMemo(() => {
    if (typeFilter === null) return allPins;
    return allPins.filter((p) => matchPlaceType(p.type, typeFilter));
  }, [allPins, typeFilter]);

  const mapPins = typeFilter === null ? allPins : pins;

  const reload = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    const res = await loadCoords();
    setLoading(false);
    if (!res.ok) {
      setLoadError(res.error);
      setRealms([]);
      setPinsByRealm({});
      setRealmId('');
      return;
    }
    setRealms(res.realms);
    setPinsByRealm(res.pinsByRealm);
    setRealmId((cur) => {
      if (cur && res.realms.some((r) => r.id === cur)) return cur;
      return res.realms[0]?.id ?? '';
    });
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => {
    setTypeFilter(null);
  }, [realmId]);

  useEffect(() => {
    if (typeFilter !== null && !typesWithPins.has(typeFilter)) setTypeFilter(null);
  }, [typesWithPins, typeFilter]);

  const mapEmpty =
    !realmId || (mapPins.length === 0 && (allPins.length === 0 || typeFilter !== null));

  return (
    <div className="app-shell">
      <header className="topbar glass-bar">
        <div className="topbar-left">
          <h1 className="brand">Pins</h1>
          {loading ? <span className="status-dot" aria-label="Loading" /> : null}
        </div>
        <div className="topbar-right">
          {realms.length > 0 ? (
            <label className="realm-picker">
              <span className="sr-only">Realm</span>
              <select
                value={realmId}
                onChange={(e) => setRealmId(e.target.value)}
                className="realm-select"
              >
                {realms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <button type="button" className="icon-btn" onClick={() => void reload()} disabled={loading} title="Reload coords.json">
            ↻
          </button>
        </div>
      </header>

      {loadError ? <p className="error-banner">{loadError}</p> : null}

      <div className="app-layout">
        <section className="places-panel" aria-label="Places">
          {realmId ? (
            <div className="type-filters glass-bar" role="group" aria-label="Filter by type">
              <div className="type-filters-available">
                <button
                  type="button"
                  className={`type-chip ${typeFilter === null ? 'on' : ''}`}
                  onClick={() => setTypeFilter(null)}
                >
                  Tous
                </button>
                {typesAvailable.map((t) => renderTypeChip(t, true))}
              </div>
              {typesUnavailable.length > 0 ? (
                <div className="type-filters-unavailable" aria-label="Types sans lieu">
                  {typesUnavailable.map((t) => renderTypeChip(t, false))}
                </div>
              ) : null}
            </div>
          ) : null}

          {!realmId && !loading ? (
            <p className="empty-msg glass-card">Add realms in web/public/coords.json</p>
          ) : null}

          {realmId ? (
            <ul className="place-list">
              {pins.length === 0 ? (
                <li className="empty-card glass-card">
                  <p className="muted">
                    {allPins.length === 0 ? 'No places for this realm.' : 'No places match this type.'}
                  </p>
                </li>
              ) : (
                pins.map((p) => (
                  <li key={p.id} className="place-card glass-card">
                    <div className="place-card-top">
                      <strong>{p.label}</strong>
                      {p.type ? (
                        <span
                          className="type-badge"
                          style={{ '--type-color': getPlaceTypeColor(p.type).fill } as CSSProperties}
                        >
                          {p.type}
                        </span>
                      ) : null}
                    </div>
                    <span className="coords mono">
                      {p.x}, {p.y != null ? `${p.y}, ` : ''}
                      {p.z}
                    </span>
                    {p.notes ? <p className="place-notes">{p.notes}</p> : null}
                  </li>
                ))
              )}
            </ul>
          ) : null}
        </section>

        <section
          className={`map-panel ${view === 'map' ? 'map-panel--open' : ''}`}
          aria-label="Map"
        >
          <div className="map-panel-header glass-bar map-panel-header--mobile">
            <h2 className="map-title">{selectedRealm?.name ?? 'Map'}</h2>
            <button type="button" className="icon-btn" onClick={() => setView('places')} aria-label="Close map">
              ✕
            </button>
          </div>
          <div className="map-panel-header glass-bar map-panel-header--desktop">
            <h2 className="map-title">Map</h2>
            <p className="map-subtitle muted">{selectedRealm?.name ?? '—'}</p>
          </div>
          <div className="map-panel-body glass-card">
            {mapEmpty ? (
              <p className="muted map-empty">
                {!realmId
                  ? 'Select a realm.'
                  : allPins.length === 0
                    ? 'No places for this realm.'
                    : 'No places match this filter.'}
              </p>
            ) : (
              <PinsMap pins={mapPins} />
            )}
          </div>
        </section>
      </div>

      <button
        type="button"
        className={`fab-map ${view === 'map' ? 'fab-map--active' : ''}`}
        onClick={() => setView((v) => (v === 'map' ? 'places' : 'map'))}
        aria-label={view === 'map' ? 'Close map' : 'Open map'}
      >
        {view === 'map' ? (
          <span className="fab-icon-text">✕</span>
        ) : (
          <PlanetIcon className="fab-planet" />
        )}
      </button>
    </div>
  );
}
