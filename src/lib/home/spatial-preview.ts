import {
  createEmptyTipoCounts,
  ESPEACIO_TIPOS,
  ESPEACIO_TIPO_COLORS,
  ESPEACIO_TIPO_LABELS,
  type Espacio,
  type EspacioTipo,
} from "@/lib/domain/mapa";
import type {
  SpatialExplorerPreviewData,
  SpatialPreviewLegendItem,
  SpatialPreviewPin,
} from "@/lib/domain/home";

export const CDMX_BOUNDS = {
  latMin: 19.0,
  latMax: 19.7,
  lngMin: -99.4,
  lngMax: -98.9,
} as const;

const LEGEND_DOT_CLASSES: Record<EspacioTipo, string> = {
  auditorios: "bg-violet-500",
  bibliotecas: "bg-blue-500",
  bibliotecasDgb: "bg-sky-400",
  casasArtesanias: "bg-amber-500",
  casasCentrosCulturales: "bg-emerald-400",
  centrosPueblosIndigenas: "bg-teal-400",
  complejosCinematograficos: "bg-indigo-400",
  galerias: "bg-pink-400",
  libreriasPuntosVenta: "bg-orange-400",
  museos: "bg-geo-navy",
  teatros: "bg-geo-pink",
  universidades: "bg-slate-400",
};

export function espacioToPreviewPin(espacio: Espacio): SpatialPreviewPin {
  const lngSpan = CDMX_BOUNDS.lngMax - CDMX_BOUNDS.lngMin;
  const latSpan = CDMX_BOUNDS.latMax - CDMX_BOUNDS.latMin;
  const x = ((espacio.lng - CDMX_BOUNDS.lngMin) / lngSpan) * 100;
  const y = ((CDMX_BOUNDS.latMax - espacio.lat) / latSpan) * 100;

  return {
    id: espacio.id,
    nombre: espacio.nombre,
    tipo: espacio.tipo,
    top: `${Math.min(82, Math.max(18, y)).toFixed(2)}%`,
    left: `${Math.min(88, Math.max(12, x)).toFixed(2)}%`,
  };
}

function pickSpreadPins(espacios: Espacio[], limit: number): Espacio[] {
  if (espacios.length <= limit) return espacios;

  const sorted = [...espacios].sort((a, b) => a.id.localeCompare(b.id));
  const step = sorted.length / limit;
  const picked: Espacio[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < limit; i += 1) {
    const candidate = sorted[Math.floor(i * step)];
    if (candidate && !seen.has(candidate.id)) {
      seen.add(candidate.id);
      picked.push(candidate);
    }
  }

  if (picked.length < limit) {
    for (const espacio of sorted) {
      if (seen.has(espacio.id)) continue;
      picked.push(espacio);
      seen.add(espacio.id);
      if (picked.length >= limit) break;
    }
  }

  return picked;
}

function countByTipo(espacios: Espacio[]): Record<EspacioTipo, number> {
  const counts = createEmptyTipoCounts();
  for (const espacio of espacios) {
    counts[espacio.tipo] += 1;
  }
  return counts;
}

function buildLegend(counts: Record<EspacioTipo, number>): SpatialPreviewLegendItem[] {
  return ESPEACIO_TIPOS.filter((tipo) => counts[tipo] > 0)
    .sort((a, b) => counts[b] - counts[a])
    .slice(0, 6)
    .map((tipo) => ({
      tipo,
      label: ESPEACIO_TIPO_LABELS[tipo],
      count: counts[tipo],
      dotClassName: LEGEND_DOT_CLASSES[tipo],
    }));
}

export function buildSpatialExplorerPreviewData(input: {
  espacios: Espacio[];
  totalGeoref: number;
  maxPins?: number;
}): SpatialExplorerPreviewData {
  const maxPins = input.maxPins ?? 10;
  const pins = pickSpreadPins(input.espacios, maxPins).map(espacioToPreviewPin);
  const countsByTipo = countByTipo(input.espacios);

  return {
    pins,
    totalGeoref: input.totalGeoref,
    legend: buildLegend(countsByTipo),
    subtitle:
      input.totalGeoref > 0
        ? `${input.totalGeoref.toLocaleString("es-MX")} espacios georreferenciados`
        : "Sin espacios georreferenciados",
  };
}

export function emptySpatialExplorerPreviewData(): SpatialExplorerPreviewData {
  return {
    pins: [],
    totalGeoref: 0,
    legend: [],
    subtitle: "Sin espacios georreferenciados",
  };
}

export { ESPEACIO_TIPO_COLORS };
