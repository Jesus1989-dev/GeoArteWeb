import type { TendenciaAsistenciaRow } from "@/lib/domain/dashboard";
import type { GrowthDataPoint } from "@/lib/domain/home";

export type ExistenciaAnualRow = { anio: number; valor: number };

/** Campos usados para el año de referencia (paridad con Flutter / SECTEI). */
export type EspacioAnioReferencia = {
  fecha_fundacion?: string | null;
  sic_fecha_modificacion?: string | null;
  created_at?: string | null;
};

/**
 * Años visibles en gráficos de existencia anual.
 * `null` = todos los registros en Supabase (recomendado).
 * Un número = solo los últimos N años (p. ej. 6 para vista compacta).
 */
export const EXISTENCIA_ANUAL_MAX_YEARS_IN_CHART: number | null = null;

/** Inicio histórico del padrón SECTEI en la vista de inicio (paridad operativa CDMX). */
export const EXISTENCIA_ANUAL_CHART_START_YEAR = 1991;

function parseYearFromIso(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const d = new Date(trimmed);
  if (!Number.isNaN(d.getTime())) return d.getFullYear();
  const noon = new Date(`${trimmed}T12:00:00`);
  if (!Number.isNaN(noon.getTime())) return noon.getFullYear();
  return null;
}

/**
 * Año de referencia: fundación válida → modificación SIC → alta en padrón.
 * Misma prioridad que `anioReferenciaEspacio` en GeoArte Móvil.
 */
export function anioReferenciaEspacio(e: EspacioAnioReferencia): number | null {
  const nowY = new Date().getFullYear();
  let y: number | null = null;

  const fundacion = e.fecha_fundacion
    ? parseYearFromIso(String(e.fecha_fundacion))
    : null;
  if (
    fundacion != null &&
    fundacion >= 1850 &&
    fundacion !== 1000 &&
    fundacion >= 1990 &&
    fundacion <= nowY + 1
  ) {
    y = fundacion;
  }

  if (y == null && e.sic_fecha_modificacion) {
    const sy = parseYearFromIso(String(e.sic_fecha_modificacion));
    if (sy != null && sy >= 1990 && sy <= nowY + 1) y = sy;
  }

  if (y == null && e.created_at) {
    const cy = parseYearFromIso(String(e.created_at));
    if (cy != null) y = cy;
  }

  return y;
}

/** Histograma año → cantidad de espacios en el territorio filtrado. */
export function existenciaAnualHistogramaDesdeEspacios(
  espacios: EspacioAnioReferencia[],
): ExistenciaAnualRow[] {
  const map = new Map<number, number>();
  for (const e of espacios) {
    const y = anioReferenciaEspacio(e);
    if (y == null) continue;
    map.set(y, (map.get(y) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([anio, valor]) => ({ anio, valor }))
    .sort((a, b) => a.anio - b.anio);
}

/**
 * Si casi todo el inventario cae en un solo año (carga masiva), el histograma local
 * no sirve para la vista CDMX: conviene `existencia_anual` (ETL).
 */
export function serieExistenciaAnualUtilParaGrafica(
  puntos: ExistenciaAnualRow[],
): boolean {
  if (puntos.length < 2) return false;
  let sum = 0;
  let maxV = 0;
  for (const p of puntos) {
    const v = p.valor;
    sum += v;
    if (v > maxV) maxV = v;
  }
  if (sum <= 0) return false;
  if (maxV / sum >= 0.92) return false;
  return true;
}

/**
 * Elige la serie de tendencia (paridad `estadisticas_screen._derivarDesdeCache` en Flutter).
 * - Toda la CDMX: histograma del padrón si es útil; si no, tabla `existencia_anual`.
 * - Una alcaldía: siempre histograma local del padrón filtrado (sin disciplina).
 */
export function resolveExistenciaAnualParaTendencia(args: {
  vistaGlobal: boolean;
  existenciaGlobal: ExistenciaAnualRow[];
  espaciosTerritorio: EspacioAnioReferencia[];
}): ExistenciaAnualRow[] {
  const puntosLocales = existenciaAnualHistogramaDesdeEspacios(
    args.espaciosTerritorio,
  );
  if (args.vistaGlobal && serieExistenciaAnualUtilParaGrafica(puntosLocales)) {
    return puntosLocales;
  }
  if (args.vistaGlobal && args.existenciaGlobal.length > 0) {
    return args.existenciaGlobal;
  }
  return puntosLocales;
}

export function windowExistenciaAnualRows(
  rows: ExistenciaAnualRow[],
): ExistenciaAnualRow[] {
  const sorted = [...rows]
    .filter((r) => Number.isFinite(r.anio) && r.anio >= 1990 && r.anio <= 2100)
    .sort((a, b) => a.anio - b.anio);

  if (sorted.length === 0) return [];
  if (EXISTENCIA_ANUAL_MAX_YEARS_IN_CHART == null) return sorted;
  return sorted.slice(-EXISTENCIA_ANUAL_MAX_YEARS_IN_CHART);
}

/** Serie para el gráfico «Existencia anual del padrón» del dashboard. */
export function buildTendenciaExistenciaSeries(
  existencia: ExistenciaAnualRow[],
): TendenciaAsistenciaRow[] {
  const windowed = windowExistenciaAnualRows(existencia);
  return windowed.map((p, i) => ({
    mes: String(p.anio),
    visitas: p.valor,
    eventos:
      i > 0 ? Math.max(0, p.valor - (windowed[i - 1]?.valor ?? 0)) : 0,
  }));
}

function normalizeExistenciaAnualRows(
  rows: Array<{ anio?: number | null; valor?: number | null }>,
): ExistenciaAnualRow[] {
  return rows
    .map((row) => ({
      anio: Number(row.anio) || 0,
      valor: Number(row.valor) || 0,
    }))
    .filter((row) => row.anio > 0);
}

/** Altas anuales (valor bruto por año en `existencia_anual`). */
export function buildGrowthDataFromExistenciaAnual(
  rows: Array<{ anio?: number | null; valor?: number | null }>,
): GrowthDataPoint[] {
  return windowExistenciaAnualRows(normalizeExistenciaAnualRows(rows)).map((row) => ({
    year: String(row.anio),
    value: row.valor,
  }));
}

/**
 * Stock acumulado al cierre de cada año (suma de altas SECTEI).
 * Alinea el gráfico de inicio con el KPI «Total Espacios» (~2 896).
 */
export function buildGrowthDataAcumuladoFromExistenciaAnual(
  rows: Array<{ anio?: number | null; valor?: number | null }>,
): GrowthDataPoint[] {
  let acumulado = 0;
  return windowExistenciaAnualRows(normalizeExistenciaAnualRows(rows)).map((row) => {
    acumulado += row.valor;
    return { year: String(row.anio), value: acumulado };
  });
}

/**
 * Ajusta la serie para que el año de corte coincida con el KPI «Total Espacios»
 * (p. ej. 2 896 en 2026), conservando la forma relativa del crecimiento.
 */
export function alignGrowthSeriesToKpiTotal(
  series: GrowthDataPoint[],
  anioCorte: number,
  totalEspacios: number,
): GrowthDataPoint[] {
  if (series.length === 0 || totalEspacios <= 0) return series;

  const cutIndex = series.findIndex((point) => point.year === String(anioCorte));
  const targetIndex = cutIndex >= 0 ? cutIndex : series.length - 1;
  const rawTotal = series[targetIndex]?.value ?? 0;

  if (rawTotal <= 0) {
    return series.map((point, index) =>
      index === targetIndex ? { ...point, value: totalEspacios } : point,
    );
  }

  if (rawTotal === totalEspacios) return series;

  const factor = totalEspacios / rawTotal;
  const aligned = series.map((point, index) => ({
    year: point.year,
    value:
      index <= targetIndex
        ? Math.max(0, Math.round(point.value * factor))
        : point.value,
  }));

  aligned[targetIndex] = { year: aligned[targetIndex].year, value: totalEspacios };

  for (let index = 1; index <= targetIndex; index += 1) {
    if (aligned[index].value < aligned[index - 1].value) {
      aligned[index] = {
        ...aligned[index],
        value: aligned[index - 1].value,
      };
    }
  }

  return aligned;
}

/** Stock acumulado año a año (rellena huecos en el eje X). */
export function buildGrowthDataAcumuladoDesdeHistograma(
  histogram: ExistenciaAnualRow[],
  startYear: number,
  endYear: number,
): GrowthDataPoint[] {
  const byYear = new Map(histogram.map((row) => [row.anio, row.valor]));
  let acumulado = 0;
  const points: GrowthDataPoint[] = [];

  for (let year = startYear; year <= endYear; year += 1) {
    acumulado += byYear.get(year) ?? 0;
    points.push({ year: String(year), value: acumulado });
  }

  return points;
}

/**
 * Serie de inicio: padrón vivo (1991 → anioCorte) si hay cobertura;
 * si no, tabla `existencia_anual` (ETL SECTEI, suele empezar en 2014).
 */
export function resolveGrowthDataForHome(input: {
  existenciaGlobal: Array<{ anio?: number | null; valor?: number | null }>;
  espacios: EspacioAnioReferencia[];
  anioCorte: number;
  totalEspacios?: number;
  startYear?: number;
}): GrowthDataPoint[] {
  const startYear = input.startYear ?? EXISTENCIA_ANUAL_CHART_START_YEAR;
  const endYear = Math.max(input.anioCorte, startYear);
  const histogram = existenciaAnualHistogramaDesdeEspacios(input.espacios);
  const desdePadron = buildGrowthDataAcumuladoDesdeHistograma(
    histogram.filter((row) => row.anio >= startYear && row.anio <= endYear),
    startYear,
    endYear,
  );

  const totalPadron = desdePadron[desdePadron.length - 1]?.value ?? 0;
  let series: GrowthDataPoint[];

  if (desdePadron.length >= 2 && totalPadron > 0) {
    series = desdePadron;
  } else {
    series = buildGrowthDataAcumuladoFromExistenciaAnual(input.existenciaGlobal);
  }

  if (input.totalEspacios != null && input.totalEspacios > 0) {
    series = alignGrowthSeriesToKpiTotal(series, input.anioCorte, input.totalEspacios);
  }

  return series;
}
