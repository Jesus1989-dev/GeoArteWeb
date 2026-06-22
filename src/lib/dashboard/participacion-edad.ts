import type { EstadisticaRow, ParticipacionGeneroRow } from "@/lib/domain/dashboard";

const RANGOS_EDAD = ["18-29", "30-44", "45-59", "60+"] as const;

export type RangoEdad = (typeof RANGOS_EDAD)[number];

function norm(s: string): string {
  return s.trim().toLowerCase();
}

function matchesLoose(a: string, b: string): boolean {
  const x = norm(a);
  const y = norm(b);
  if (!x || !y) return false;
  return x === y || x.includes(y) || y.includes(x);
}

export function isParticipacionEdad(row: EstadisticaRow): boolean {
  const c = row.categoria?.toLowerCase() ?? "";
  return c.includes("edad") && !c.includes("género") && !c.includes("genero");
}

export function tituloMatchesRangoEdad(titulo: string, rango: string): boolean {
  const t = norm(titulo);
  const r = norm(rango);
  if (t.includes(r)) return true;
  if (r === "60+" && (t.includes("60") || t.includes("más") || t.includes("mas"))) return true;
  return false;
}

export function estadisticaMatchesRangoEdad(row: EstadisticaRow, rango: string): boolean {
  if (!isParticipacionEdad(row)) return false;
  if (tituloMatchesRangoEdad(row.titulo, rango)) return true;
  const aux = row.disciplina_nombre?.trim() || row.tipo_espacio_sic?.trim() || "";
  return tituloMatchesRangoEdad(aux, rango);
}

export function segmentosEdadFromEstadisticas(rows: EstadisticaRow[]): string[] {
  const set = new Set<string>();
  for (const row of rows) {
    if (!isParticipacionEdad(row)) continue;
    for (const rango of RANGOS_EDAD) {
      if (estadisticaMatchesRangoEdad(row, rango)) set.add(rango);
    }
    const t = row.titulo.trim();
    if (RANGOS_EDAD.includes(t as RangoEdad)) set.add(t);
  }
  const ordered = RANGOS_EDAD.filter((r) => set.has(r));
  return ordered.length > 0 ? ordered : [...RANGOS_EDAD];
}

export function filterEstadisticasPorEdad(
  rows: EstadisticaRow[],
  rangoEdad: string,
): EstadisticaRow[] {
  if (rangoEdad === "Todos") return rows;
  return rows.filter((row) => {
    if (!isParticipacionEdad(row)) return true;
    return estadisticaMatchesRangoEdad(row, rangoEdad);
  });
}

export function hasParticipacionEdadDatos(rows: EstadisticaRow[]): boolean {
  return rows.some(isParticipacionEdad);
}

/** Ajuste demo cuando no hay filas de edad en Supabase. */
export function scaleParticipacionMockPorEdad(
  rows: ParticipacionGeneroRow[],
  rangoEdad: string,
): ParticipacionGeneroRow[] {
  const factors: Record<string, { h: number; m: number; o: number }> = {
    "18-29": { h: 0.85, m: 1.15, o: 1.35 },
    "30-44": { h: 1, m: 1.05, o: 1.05 },
    "45-59": { h: 1.1, m: 0.95, o: 0.9 },
    "60+": { h: 1.2, m: 0.85, o: 0.75 },
  };
  const f = factors[rangoEdad] ?? { h: 1, m: 1, o: 1 };
  return rows.map((r) => ({
    ...r,
    hombres: Math.round(r.hombres * f.h),
    mujeres: Math.round(r.mujeres * f.m),
    otros: Math.round(r.otros * f.o),
  }));
}

export function buildParticipacionEdadFromRows(
  rows: EstadisticaRow[],
  rangoEdad: string,
): ParticipacionGeneroRow[] {
  const pool = rows.filter((r) => estadisticaMatchesRangoEdad(r, rangoEdad));
  if (pool.length === 0) return [];

  const byDisc = new Map<string, { hombres: number[]; mujeres: number[]; otros: number[] }>();

  for (const row of pool) {
    const key =
      row.disciplina_nombre?.trim() ||
      row.tipo_espacio_sic?.trim() ||
      "Participación por edad";
    const bucket = byDisc.get(key) ?? { hombres: [], mujeres: [], otros: [] };
    const t = norm(row.titulo);
    const v = Number(row.valor) || 0;

    if (t.includes("mujer")) bucket.mujeres.push(v);
    else if (t.includes("hombre")) bucket.hombres.push(v);
    else bucket.otros.push(v);

    byDisc.set(key, bucket);
  }

  const avg = (xs: number[]) =>
    xs.length === 0 ? 0 : xs.reduce((a, b) => a + b, 0) / xs.length;

  return [...byDisc.entries()]
    .map(([disciplina, vals]) => ({
      disciplina,
      hombres: Math.round(avg(vals.hombres)),
      mujeres: Math.round(avg(vals.mujeres)),
      otros: Math.round(avg(vals.otros)),
    }))
    .sort((a, b) => a.disciplina.localeCompare(b.disciplina, "es"))
    .slice(0, 6);
}

export function mergeRangosEdadOpciones(
  detectados: string[],
  fallback: readonly string[],
): string[] {
  const base = detectados.length > 0 ? detectados : [...fallback];
  return ["Todos", ...base.filter((r) => r !== "Todos")];
}
