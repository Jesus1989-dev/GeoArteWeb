import type { SupabaseClient } from "@supabase/supabase-js";
import type { MovilidadModoRow } from "@/lib/domain/dashboard";

export type MovilidadAccesoRow = {
  periodo: string;
  fechaCorte: string | null;
  alcaldiaNombre: string;
  tiempoPromedioMin: number | null;
  modoTransporte: string | null;
};

const ORDEN_MODO = [
  "transporte_publico",
  "a_pie",
  "bicicleta",
  "auto",
  "mixto",
] as const;

function norm(s: string): string {
  return s.trim().toLowerCase();
}

function matchesLoose(a: string, b: string): boolean {
  const x = norm(a);
  const y = norm(b);
  if (!x || !y) return false;
  return x === y || x.includes(y) || y.includes(x);
}

export function etiquetaModoMovilidad(raw: string | null | undefined): string {
  const s = (raw ?? "").trim();
  if (!s) return "Sin modo";
  switch (s) {
    case "transporte_publico":
      return "Transporte público";
    case "a_pie":
      return "A pie";
    case "auto":
      return "Auto";
    case "bicicleta":
      return "Bicicleta";
    case "mixto":
      return "Mixto";
    default:
      return s;
  }
}

function ordenPeriodoMovilidad(periodo: string): number {
  const m = /^(\d{4})-(S|H)(\d+)$/i.exec(periodo.trim());
  if (!m) return 0;
  const year = Number.parseInt(m[1], 10);
  const tipo = m[2].toUpperCase();
  const n = Number.parseInt(m[3], 10);
  const slot = tipo === "S" ? n : n + 4;
  return year * 10 + slot;
}

function periodoEsMasReciente(a: MovilidadAccesoRow, b: MovilidadAccesoRow): boolean {
  const fa = a.fechaCorte ? new Date(a.fechaCorte).getTime() : 0;
  const fb = b.fechaCorte ? new Date(b.fechaCorte).getTime() : 0;
  if (fa > 0 && fb > 0) return fa > fb;
  if (fa > 0) return true;
  if (fb > 0) return false;
  return ordenPeriodoMovilidad(a.periodo) > ordenPeriodoMovilidad(b.periodo);
}

export function filtrarMovilidadAlPeriodoMasReciente(
  rows: MovilidadAccesoRow[],
): MovilidadAccesoRow[] {
  if (rows.length <= 1) return rows;

  let referencia = rows[0];
  for (const row of rows.slice(1)) {
    if (periodoEsMasReciente(row, referencia)) referencia = row;
  }

  const periodo = referencia.periodo.trim();
  const corte = referencia.fechaCorte;
  if (!periodo && !corte) return rows;

  return rows.filter((row) => {
    if (corte && row.fechaCorte) {
      return row.fechaCorte.slice(0, 10) === corte.slice(0, 10);
    }
    return row.periodo.trim() === periodo;
  });
}

export function agregarMovilidadPorModo(rows: MovilidadAccesoRow[]): MovilidadModoRow[] {
  const map = new Map<string, number[]>();

  for (const row of rows) {
    const modo = (row.modoTransporte ?? "").trim();
    const t = row.tiempoPromedioMin;
    if (t == null || !Number.isFinite(t)) continue;
    const list = map.get(modo) ?? [];
    list.push(t);
    map.set(modo, list);
  }

  const out: MovilidadModoRow[] = [];
  for (const [modoClave, valores] of map.entries()) {
    if (valores.length === 0) continue;
    const sum = valores.reduce((acc, value) => acc + value, 0);
    out.push({
      modoClave,
      modoEtiqueta: etiquetaModoMovilidad(modoClave || null),
      minutosPromedio: sum / valores.length,
    });
  }

  out.sort((a, b) => {
    const ia = ORDEN_MODO.indexOf(a.modoClave as (typeof ORDEN_MODO)[number]);
    const ib = ORDEN_MODO.indexOf(b.modoClave as (typeof ORDEN_MODO)[number]);
    const ra = ia < 0 ? 99 : ia;
    const rb = ib < 0 ? 99 : ib;
    if (ra !== rb) return ra - rb;
    return a.modoEtiqueta.localeCompare(b.modoEtiqueta, "es");
  });

  return out;
}

export function filtrarMovilidadPorAlcaldia(
  rows: MovilidadAccesoRow[],
  alcaldia: string,
): MovilidadAccesoRow[] {
  if (alcaldia === "Todas") return rows;
  return rows.filter((row) => matchesLoose(row.alcaldiaNombre, alcaldia));
}

export async function fetchMovilidadAccesoWithClient(
  client: SupabaseClient,
): Promise<MovilidadAccesoRow[]> {
  const { data, error } = await client.rpc("listar_movilidad_acceso");

  if (error) {
    console.warn("[dashboard] listar_movilidad_acceso:", error.message);
    return [];
  }

  return (data ?? []).map(
    (row: {
      periodo?: string | null;
      fecha_corte?: string | null;
      alcaldia_nombre?: string | null;
      tiempo_promedio_min?: number | null;
      modo_transporte?: string | null;
    }) => ({
      periodo: String(row.periodo ?? ""),
      fechaCorte: row.fecha_corte ? String(row.fecha_corte) : null,
      alcaldiaNombre: String(row.alcaldia_nombre ?? "").trim(),
      tiempoPromedioMin:
        row.tiempo_promedio_min != null ? Number(row.tiempo_promedio_min) : null,
      modoTransporte: row.modo_transporte ? String(row.modo_transporte) : null,
    }),
  );
}
