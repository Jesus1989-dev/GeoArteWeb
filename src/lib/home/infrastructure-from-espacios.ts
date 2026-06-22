import type { BrechaAlcaldia, GrowthDataPoint, Prioridad } from "@/lib/domain/home";

export type EspacioInfraRow = {
  alcaldia: string | null;
  created_at: string | null;
  updated_at: string | null;
  fecha_fundacion?: string | null;
  sic_fecha_modificacion?: string | null;
};

function prioridadFromBrecha(brecha: number): Prioridad {
  if (brecha >= 40) return "Crítico";
  if (brecha >= 25) return "Atención";
  return "Estable";
}

function normalizeAlcaldia(value: string | null | undefined): string {
  return value?.trim() || "Sin alcaldía";
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

function normalizePercent(n: number): number {
  if (n > 0 && n <= 1) return Math.round(n * 100);
  return Math.round(n);
}

/** Brecha SECTEI desde metricas_alcaldia; espacios del padrón vivo si hay match por alcaldía. */
export function buildBrechaAlcaldiasFromMetricas(
  metricas: Array<{
    alcaldia_nombre?: string | null;
    cantidad_espacios?: number | null;
    porcentaje_brecha?: number | null;
  }>,
  espaciosRows: EspacioInfraRow[] = [],
  limit?: number,
): BrechaAlcaldia[] {
  const liveCounts = new Map<string, number>();
  for (const row of espaciosRows) {
    const alcaldia = normalizeAlcaldia(row.alcaldia);
    liveCounts.set(alcaldia, (liveCounts.get(alcaldia) ?? 0) + 1);
  }

  if (metricas.length === 0) {
    return buildBrechaAlcaldiasFromEspacios(espaciosRows);
  }

  const sorted = metricas
    .map((row) => {
      const alcaldia = normalizeAlcaldia(row.alcaldia_nombre);
      const espaciosMetricas = Number(row.cantidad_espacios) || 0;
      const espacios = liveCounts.get(alcaldia) ?? espaciosMetricas;
      const brecha = normalizePercent(Number(row.porcentaje_brecha) || 0);
      return {
        alcaldia,
        espacios,
        brecha,
        prioridad: prioridadFromBrecha(brecha),
      };
    })
    .filter((row) => row.alcaldia && row.alcaldia !== "Sin alcaldía")
    .sort((a, b) => b.brecha - a.brecha || a.alcaldia.localeCompare(b.alcaldia, "es"));

  if (limit != null && limit > 0) return sorted.slice(0, limit);
  return sorted;
}

/**
 * Brecha territorial estimada: déficit relativo frente a la alcaldía con mayor
 * número de espacios en el padrón vivo (espacios_culturales). Fallback sin metricas.
 */
export function buildBrechaAlcaldiasFromEspacios(rows: EspacioInfraRow[]): BrechaAlcaldia[] {
  const counts = new Map<string, number>();

  for (const row of rows) {
    const alcaldia = normalizeAlcaldia(row.alcaldia);
    counts.set(alcaldia, (counts.get(alcaldia) ?? 0) + 1);
  }

  if (counts.size === 0) return [];

  const maxEspacios = Math.max(...counts.values(), 1);

  const sorted = [...counts.entries()]
    .map(([alcaldia, espacios]) => {
      const brecha = Math.min(
        100,
        Math.max(0, Math.round(100 - (espacios / maxEspacios) * 100)),
      );
      return {
        alcaldia,
        espacios,
        brecha,
        prioridad: prioridadFromBrecha(brecha),
      };
    })
    .sort((a, b) => b.brecha - a.brecha || a.alcaldia.localeCompare(b.alcaldia, "es"));

  return sorted;
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
