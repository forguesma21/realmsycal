import { useEffect, useMemo } from 'react';
import { MapContainer, CircleMarker, Popup, useMap, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { getPlaceTypeColor, resolvePlaceType } from '../placeTypes';
import type { Pin } from '../types';
import { MapAxesGrid } from './MapAxesGrid';
import 'leaflet/dist/leaflet.css';

/** Minecraft X → map horizontal, Z → vertical (south down). */
function toMapLatLng(p: Pin): L.LatLngTuple {
  return [-p.z, p.x];
}

function FitBounds({ pins }: { pins: Pin[] }) {
  const map = useMap();
  useEffect(() => {
    if (pins.length === 0) {
      map.setView([0, 0], 0);
      return;
    }
    const pts = pins.map((p) => toMapLatLng(p));
    const b = L.latLngBounds(pts);
    map.fitBounds(b, { padding: [48, 48], maxZoom: 6 });
  }, [map, pins]);
  return null;
}

type Props = {
  pins: Pin[];
};

export function PinsMap({ pins }: Props) {
  const center = useMemo((): L.LatLngTuple => {
    if (pins.length === 0) return [0, 0];
    const x = pins.reduce((s, p) => s + p.x, 0) / pins.length;
    const z = pins.reduce((s, p) => s + p.z, 0) / pins.length;
    return [-z, x];
  }, [pins]);

  const legendTypes = useMemo(() => {
    const seen = new Set<string>();
    const items: { type: string; fill: string }[] = [];
    for (const p of pins) {
      const key = resolvePlaceType(p.type) ?? p.type.trim();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      items.push({ type: key, fill: getPlaceTypeColor(p.type).fill });
    }
    return items;
  }, [pins]);

  return (
    <div className="map-wrap">
      <MapContainer
        crs={L.CRS.Simple}
        center={center}
        zoom={0}
        minZoom={-4}
        maxZoom={8}
        className="map-instance"
        zoomControl
        attributionControl={false}
      >
        <MapAxesGrid />
        <FitBounds pins={pins} />
        {pins.map((p) => {
          const { fill, stroke } = getPlaceTypeColor(p.type);
          return (
            <CircleMarker
              key={p.id}
              center={toMapLatLng(p)}
              radius={9}
              pathOptions={{ color: stroke, weight: 2, fillColor: fill, fillOpacity: 0.95 }}
            >
              <Tooltip direction="top" offset={[0, -6]} opacity={1} permanent={false}>
                {p.label}
              </Tooltip>
              <Popup>
                <strong>{p.label}</strong>
                {p.type ? (
                  <div className="popup-type" style={{ color: fill }}>
                    {p.type}
                  </div>
                ) : null}
                <div className="mono small">
                  {p.x}, {p.y != null ? `${p.y}, ` : ''}
                  {p.z}
                </div>
                {p.notes ? <p className="small popup-notes">{p.notes}</p> : null}
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
      <div className="map-legend">
        <div className="map-legend-axes">
          <span className="map-legend-axis map-legend-x">— X (east →)</span>
          <span className="map-legend-axis map-legend-z">| Z (south ↓)</span>
        </div>
        {legendTypes.length > 0 ? (
          <ul className="map-legend-colors">
            {legendTypes.map(({ type, fill }) => (
              <li key={type}>
                <span className="map-legend-swatch" style={{ background: fill }} aria-hidden />
                {type}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
