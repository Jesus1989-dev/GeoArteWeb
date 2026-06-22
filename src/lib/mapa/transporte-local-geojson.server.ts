import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { TransporteCapaData, TransporteGeoFeature } from "@/lib/domain/transporte-capa";

type RawGeoFeature = {
  type: "Feature";
  properties?: Record<string, unknown>;
  geometry?: {
    type: string;
    coordinates?: unknown;
  };
};

type RawGeoCollection = {
  type: "FeatureCollection";
  features?: RawGeoFeature[];
};

function normalizeColor(value: unknown): string {
  const raw = String(value ?? "").trim();
  if (!raw) return "#334155";
  if (raw.startsWith("#")) return raw;
  if (/^[0-9a-fA-F]{6}$/.test(raw)) return `#${raw}`;
  return "#334155";
}

function metroLineId(linea: string): string {
  const key = linea.trim().toUpperCase();
  if (key === "A") return "la";
  if (key === "B") return "lb";
  return `l${key.toLowerCase()}`;
}

function metrobusLineId(linea: string, index: number): string {
  const num = Number.parseInt(linea.trim(), 10);
  const base = Number.isFinite(num) ? `mb${String(num).padStart(2, "0")}` : "mb00";
  return `${base}-${String(index).padStart(2, "0")}`;
}

function toTransporteFeature(
  feature: RawGeoFeature,
  props: TransporteGeoFeature["properties"],
): TransporteGeoFeature | null {
  const geometry = feature.geometry;
  if (
    !geometry ||
    (geometry.type !== "LineString" && geometry.type !== "MultiLineString") ||
    !Array.isArray(geometry.coordinates) ||
    geometry.coordinates.length === 0
  ) {
    return null;
  }

  return {
    type: "Feature",
    properties: props,
    geometry: {
      type: geometry.type as "LineString" | "MultiLineString",
      coordinates: geometry.coordinates as number[][] | number[][][],
    },
  };
}

function readGeoCollection(filename: string): RawGeoCollection | null {
  const filePath = join(process.cwd(), "src/data/geo", filename);
  if (!existsSync(filePath)) return null;

  try {
    return JSON.parse(readFileSync(filePath, "utf8")) as RawGeoCollection;
  } catch (err) {
    console.warn(`[mapa] transporte geojson ${filename}:`, err);
    return null;
  }
}

function mapMetroFeatures(collection: RawGeoCollection | null): TransporteGeoFeature[] {
  const features: TransporteGeoFeature[] = [];

  for (const feature of collection?.features ?? []) {
    const linea = String(feature.properties?.LINEA ?? "").trim();
    const ruta = String(feature.properties?.RUTA ?? feature.properties?.RUTA ?? "Línea Metro").trim();
    if (!linea) continue;

    const mapped = toTransporteFeature(feature, {
      id: metroLineId(linea),
      nombre: ruta || `Línea ${linea}`,
      color: normalizeColor(feature.properties?.color),
      tipo: "metro",
      sistema: "metro",
    });
    if (mapped) features.push(mapped);
  }

  return features;
}

function mapMetrobusFeatures(collection: RawGeoCollection | null): TransporteGeoFeature[] {
  const features: TransporteGeoFeature[] = [];
  const counters = new Map<string, number>();

  for (const feature of collection?.features ?? []) {
    const linea = String(feature.properties?.LINEA ?? "").trim();
    const ruta = String(feature.properties?.RUTA ?? "Metrobús").trim();
    if (!linea) continue;

    const num = Number.parseInt(linea, 10);
    const base = Number.isFinite(num) ? `mb${String(num).padStart(2, "0")}` : "mb00";
    const index = counters.get(base) ?? 0;
    counters.set(base, index + 1);

    const mapped = toTransporteFeature(feature, {
      id: metrobusLineId(linea, index),
      nombre: ruta,
      color: normalizeColor(feature.properties?.color),
      tipo: "metrobús",
      sistema: "metrobús",
    });
    if (mapped) features.push(mapped);
  }

  return features;
}

/** Geometrías detalladas empaquetadas en el repo (Metro + Metrobús). */
export function loadTransporteFromLocalGeoJson(): TransporteCapaData {
  const metro = readGeoCollection("cdmx-metro-lineas.geojson");
  const metrobus = readGeoCollection("cdmx-metrobus-lineas.geojson");

  const features = [...mapMetroFeatures(metro), ...mapMetrobusFeatures(metrobus)];

  return {
    lineas: { type: "FeatureCollection", features },
    source: "geojson",
  };
}

export function countTransporteCoordinates(feature: TransporteGeoFeature): number {
  const { geometry } = feature;
  if (geometry.type === "LineString") {
    return geometry.coordinates.length;
  }
  return geometry.coordinates.reduce(
    (sum, line) => sum + (Array.isArray(line) ? line.length : 0),
    0,
  );
}

/** Detecta trazos demasiado simplificados (seed de referencia). */
export function isTransporteCapaSimplified(capa: TransporteCapaData): boolean {
  if (capa.lineas.features.length === 0) return true;

  const coordCounts = capa.lineas.features.map(countTransporteCoordinates);
  const avg = coordCounts.reduce((a, b) => a + b, 0) / coordCounts.length;
  return avg < 12;
}
