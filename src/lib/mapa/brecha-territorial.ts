/**
 * Fórmulas de brecha/cobertura territorial SECTEI (paridad GeoArte móvil).
 *
 * cobertura = espacios_alcaldía / total_ciudad × 100
 * brecha de cobertura = 100 − cobertura
 *
 * La web y Postgres (`sync_metricas_alcaldia`) usan esta fórmula al sincronizar
 * `metricas_alcaldia`. Los campos `porcentaje_*` cacheados siguen siendo recalculados
 * en lectura por defensa, pero deben coincidir tras `npm run sync:mapa`.
 */

export const COBERTURA_SQL_MAX = 85;
export const BRECHA_SQL_MAX = 70;

export type MetricasAlcaldiaRaw = {
  alcaldia_nombre?: string | null;
  cantidad_espacios?: number | null;
};

export type MetricaAlcaldiaSectei = {
  alcaldia: string;
  cantidadEspacios: number;
  porcentajeCobertura: number;
  porcentajeBrecha: number;
};

export function hasGeorefCoords(
  lat: number | null | undefined,
  lng: number | null | undefined,
): boolean {
  return (
    lat != null &&
    lng != null &&
    Number.isFinite(Number(lat)) &&
    Number.isFinite(Number(lng))
  );
}

/** Cobertura relativa al máximo (escala 85). Solo referencia histórica / diagnósticos. */
export function coberturaTerritorialSql(cantidad: number, maxCantidad: number): number {
  if (maxCantidad <= 0 || cantidad <= 0) return 0;
  return Math.min(100, Math.round((COBERTURA_SQL_MAX * cantidad) / maxCantidad));
}

/** Brecha relativa al máximo (escala 70). Solo referencia histórica / diagnósticos. */
export function brechaTerritorialSql(cantidad: number, maxCantidad: number): number {
  if (maxCantidad <= 0) return 0;
  return Math.min(
    100,
    Math.max(0, Math.round(BRECHA_SQL_MAX * (1 - cantidad / maxCantidad))),
  );
}

/** Participación de la alcaldía en el padrón total de la ciudad (Flutter). */
export function coberturaShareCiudad(cantidad: number, totalCiudad: number): number {
  if (totalCiudad <= 0 || cantidad <= 0) return 0;
  return Math.min(100, Math.max(0, (cantidad / totalCiudad) * 100));
}

/** Brecha de cobertura en inicio/móvil: 100 − % del padrón en esa alcaldía. */
export function brechaCoberturaSectei(cantidad: number, totalCiudad: number): number {
  const cobertura = coberturaShareCiudad(cantidad, totalCiudad);
  return Math.min(100, Math.max(0, 100 - cobertura));
}

/** @deprecated Usar brechaCoberturaSectei (paridad móvil). */
export function brechaTerritorialHome(cantidad: number, maxCantidad: number): number {
  return brechaTerritorialSql(cantidad, maxCantidad);
}

export function maxCount(values: Iterable<number>): number {
  let max = 0;
  for (const value of values) {
    if (value > max) max = value;
  }
  return max;
}

export function sumCount(values: Iterable<number>): number {
  let sum = 0;
  for (const value of values) {
    sum += value;
  }
  return sum;
}

export function nivelBrechaDesdePorcentaje(brecha: number): "Alta" | "Media" | "Baja" {
  if (brecha >= 66) return "Alta";
  if (brecha >= 33) return "Media";
  return "Baja";
}

/** Recalcula cobertura/brecha SECTEI desde conteos por alcaldía (mapa, dashboard, API). */
export function metricasAlcaldiaConBrechaSectei(
  rows: MetricasAlcaldiaRaw[],
): MetricaAlcaldiaSectei[] {
  const parsed = rows
    .map((row) => ({
      alcaldia: String(row.alcaldia_nombre ?? "").trim(),
      cantidadEspacios: Number(row.cantidad_espacios) || 0,
    }))
    .filter((row) => row.alcaldia);

  const totalCiudad = Math.max(sumCount(parsed.map((row) => row.cantidadEspacios)), 1);

  return parsed.map((row) => ({
    alcaldia: row.alcaldia,
    cantidadEspacios: row.cantidadEspacios,
    porcentajeCobertura: Math.round(coberturaShareCiudad(row.cantidadEspacios, totalCiudad)),
    porcentajeBrecha: Math.round(brechaCoberturaSectei(row.cantidadEspacios, totalCiudad)),
  }));
}

export function metricasAlcaldiaFromCounts(
  counts: ReadonlyMap<string, number> | Iterable<[string, number]>,
): MetricaAlcaldiaSectei[] {
  const rows = [...counts].map(([alcaldia, cantidadEspacios]) => ({
    alcaldia_nombre: alcaldia,
    cantidad_espacios: cantidadEspacios,
  }));
  return metricasAlcaldiaConBrechaSectei(rows);
}
