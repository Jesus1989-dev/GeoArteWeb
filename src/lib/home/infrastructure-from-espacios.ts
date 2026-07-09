import type { BrechaAlcaldia, GrowthDataPoint, Prioridad } from "@/lib/domain/home";
import {
  brechaCoberturaSectei,
  hasGeorefCoords,
  nivelBrechaDesdePorcentaje,
  sumCount,
} from "@/lib/mapa/brecha-territorial";

export type EspacioInfraRow = {
  alcaldia: string | null;
  latitud?: number | null;
  longitud?: number | null;
  created_at: string | null;
  updated_at: string | null;
  fecha_fundacion?: string | null;
  sic_fecha_modificacion?: string | null;
};

function prioridadFromBrecha(brecha: number): Prioridad {
  const nivel = nivelBrechaDesdePorcentaje(brecha);
  if (nivel === "Alta") return "Crítico";
  if (nivel === "Media") return "Atención";
  return "Estable";
}

function normalizeAlcaldia(value: string | null | undefined): string {
  return value?.trim() || "Sin alcaldía";
}

function countGeorefByAlcaldia(rows: EspacioInfraRow[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const row of rows) {
    if (!hasGeorefCoords(row.latitud, row.longitud)) continue;
    const alcaldia = normalizeAlcaldia(row.alcaldia);
    if (alcaldia === "Sin alcaldía") continue;
    counts.set(alcaldia, (counts.get(alcaldia) ?? 0) + 1);
  }
  return counts;
}

function buildBrechaRowsFromCounts(counts: Map<string, number>): BrechaAlcaldia[] {
  if (counts.size === 0) return [];

  const totalCiudad = Math.max(sumCount(counts.values()), 1);

  return [...counts.entries()]
    .map(([alcaldia, espacios]) => {
      const brecha = Math.round(brechaCoberturaSectei(espacios, totalCiudad));
      return {
        alcaldia,
        espacios,
        brecha,
        prioridad: prioridadFromBrecha(brecha),
      };
    })
    .sort((a, b) => b.brecha - a.brecha || a.alcaldia.localeCompare(b.alcaldia, "es"));
}

export {
  buildGrowthDataFromExistenciaAnual,
  buildGrowthDataAcumuladoFromExistenciaAnual,
} from "@/lib/dashboard/existencia-anual";

/** Acumulado de recintos registrados al cierre de cada año (desde created_at). */
export function buildGrowthDataFromEspacios(rows: EspacioInfraRow[]): GrowthDataPoint[] {
  const timestamps = rows
    .map((row) => row.created_at)
    .filter((value): value is string => Boolean(value))
    .map((value) => new Date(value))
    .filter((date) => !Number.isNaN(date.getTime()));

  if (timestamps.length === 0) return [];

  const years = [...new Set(timestamps.map((date) => date.getFullYear()))].sort(
    (a, b) => a - b,
  );
  const windowYears = years.slice(-6);

  return windowYears.map((year) => {
    const endOfYear = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999)).getTime();
    const value = timestamps.filter((date) => date.getTime() <= endOfYear).length;
    return { year: String(year), value };
  });
}

/**
 * Brecha de cobertura alineada con GeoArte móvil (Flutter):
 * 100 − (espacios de la alcaldía / total CDMX × 100).
 */
export function buildBrechaAlcaldiasFromMetricas(
  metricas: Array<{
    alcaldia_nombre?: string | null;
    cantidad_espacios?: number | null;
    porcentaje_brecha?: number | null;
  }>,
  espaciosRows: EspacioInfraRow[] = [],
  limit?: number,
): BrechaAlcaldia[] {
  const liveGeoref = countGeorefByAlcaldia(espaciosRows);

  if (liveGeoref.size > 0) {
    const sorted = buildBrechaRowsFromCounts(liveGeoref);
    if (limit != null && limit > 0) return sorted.slice(0, limit);
    return sorted;
  }

  if (metricas.length === 0) {
    return buildBrechaAlcaldiasFromEspacios(espaciosRows);
  }

  const counts = new Map<string, number>();
  for (const row of metricas) {
    const alcaldia = normalizeAlcaldia(row.alcaldia_nombre);
    if (alcaldia === "Sin alcaldía") continue;
    counts.set(alcaldia, Number(row.cantidad_espacios) || 0);
  }

  const sorted = buildBrechaRowsFromCounts(counts);
  if (limit != null && limit > 0) return sorted.slice(0, limit);
  return sorted;
}

/** Fallback: padrón georreferenciado sin metricas_alcaldia. */
export function buildBrechaAlcaldiasFromEspacios(rows: EspacioInfraRow[]): BrechaAlcaldia[] {
  return buildBrechaRowsFromCounts(countGeorefByAlcaldia(rows));
}

export function resolveUltimaActualizacionEspacios(
  rows: EspacioInfraRow[],
): string | null {
  let latest: Date | null = null;

  for (const row of rows) {
    if (!row.updated_at) continue;
    const date = new Date(row.updated_at);
    if (Number.isNaN(date.getTime())) continue;
    if (!latest || date.getTime() > latest.getTime()) latest = date;
  }

  return latest?.toISOString() ?? null;
}

export function formatMonitoreoActualizado(iso: string | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
