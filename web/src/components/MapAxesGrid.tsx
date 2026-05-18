import { useCallback, useEffect, useState } from 'react';
import { Pane, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

function niceStep(span: number): number {
  if (!Number.isFinite(span) || span <= 0) return 100;
  const raw = span / 10;
  const pow10 = 10 ** Math.floor(Math.log10(raw));
  const frac = raw / pow10;
  let n = 1;
  if (frac > 5) n = 10;
  else if (frac > 2) n = 5;
  else if (frac > 1) n = 2;
  return n * pow10;
}

function viewToMcBounds(map: L.Map) {
  const b = map.getBounds();
  const xMin = b.getWest();
  const xMax = b.getEast();
  const zNorth = -b.getNorth();
  const zSouth = -b.getSouth();
  const zMin = Math.min(zNorth, zSouth);
  const zMax = Math.max(zNorth, zSouth);
  return { xMin, xMax, zMin, zMax };
}

type GridLine = { key: string; positions: L.LatLngTuple[]; pathOptions: L.PathOptions };

export function MapAxesGrid() {
  const map = useMap();
  const [lines, setLines] = useState<GridLine[]>([]);

  const rebuild = useCallback(() => {
    const { xMin, xMax, zMin, zMax } = viewToMcBounds(map);
    const span = Math.max(xMax - xMin, zMax - zMin, 16);
    let step = niceStep(span);
    while (span / step > 44) step *= 2;

    const muted: L.PathOptions = { color: '#c7c7cc', weight: 1, opacity: 0.85, dashArray: '4 6' };
    const axis: L.PathOptions = { color: '#007aff', weight: 2, opacity: 0.85 };

    const next: GridLine[] = [];

    if (xMin <= 0 && xMax >= 0) {
      next.push({
        key: 'axis-x0',
        positions: [
          [-zMax, 0],
          [-zMin, 0],
        ],
        pathOptions: axis,
      });
    }
    if (zMin <= 0 && zMax >= 0) {
      next.push({
        key: 'axis-z0',
        positions: [
          [0, xMin],
          [0, xMax],
        ],
        pathOptions: axis,
      });
    }

    const eps = step * 1e-9;
    const xStart = Math.ceil(xMin / step) * step;
    for (let x = xStart; x <= xMax; x += step) {
      if (Math.abs(x) < eps) continue;
      next.push({
        key: `grid-x-${x}`,
        positions: [
          [-zMax, x],
          [-zMin, x],
        ],
        pathOptions: muted,
      });
    }

    const zStart = Math.ceil(zMin / step) * step;
    for (let z = zStart; z <= zMax; z += step) {
      if (Math.abs(z) < eps) continue;
      next.push({
        key: `grid-z-${z}`,
        positions: [
          [-z, xMin],
          [-z, xMax],
        ],
        pathOptions: muted,
      });
    }

    setLines(next);
  }, [map]);

  useEffect(() => {
    rebuild();
    map.on('moveend', rebuild);
    map.on('zoomend', rebuild);
    return () => {
      map.off('moveend', rebuild);
      map.off('zoomend', rebuild);
    };
  }, [map, rebuild]);

  return (
    <Pane name="axes-grid" style={{ zIndex: 350 }}>
      {lines.map((line) => (
        <Polyline key={line.key} positions={line.positions} pathOptions={line.pathOptions} interactive={false} />
      ))}
    </Pane>
  );
}
