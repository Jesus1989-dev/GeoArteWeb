import type { EstadisticaRow, ParticipacionNseChart } from "@/lib/domain/dashboard";

const TITULO_NSE_BAJO = "Participación NSE bajo";
const TITULO_NSE_MEDIO = "Participación NSE medio";
const TITULO_NSE_ALTO = "Participación NSE alto";

const ETIQUETAS = ["NSE bajo", "NSE medio", "NSE alto"] as const;

function norm(s: string): string {
  return s.trim().toLowerCase();
}

function matchesLoose(a: string, b: string): boolean {
  const x = norm(a);
  const y = norm(b);
  if (!x || !y) return false;
  return x === y || x.includes(y) || y.includes(x);
}

function tituloCoincideCanon(titulo: string, canon: string): boolean {
  return titulo.trim().toLowerCase() === canon.toLowerCase();
}

export function esFilaCategoriaIndicadoresNse(row: EstadisticaRow): boolean {
  const c = row.categoria?.toLowerCase() ?? "";
  if (c.includes("género") || c.includes("genero")) return false;
  return (
    c.includes("nse") ||
    c.includes("socioeconómico") ||
    c.includes("socioeconomico") ||
    c.includes("socioecon")
  );
}

function discTodasRow(row: EstadisticaRow): boolean {
  return !(row.disciplina_nombre?.trim() ?? "");
}

function discMatchRow(row: EstadisticaRow, disciplinaChip: string): boolean {
  return matchesLoose(row.disciplina_nombre ?? "", disciplinaChip);
}

function tipoSicVacio(row: EstadisticaRow): boolean {
  return !(row.tipo_espacio_sic?.trim() ?? "");
}

function tipoSicMatchRow(row: EstadisticaRow, chip: string): boolean {
  return matchesLoose(row.tipo_espacio_sic ?? "", chip);
}

function aldGlobalRow(row: EstadisticaRow): boolean {
  return !(row.alcaldia_id?.trim() ?? "");
}

function aldMatchRow(row: EstadisticaRow, aldId: string): boolean {
  return row.alcaldia_id === aldId;
}

export function elegirFilasIndicadoresNse(
  rows: EstadisticaRow[],
  filters: {
    alcaldia: string;
    disciplina: string;
    tipoEspacioSic?: string;
  },
  alcaldiaIdPorNombre: Record<string, string>,
): EstadisticaRow[] {
  const pool = rows.filter(esFilaCategoriaIndicadoresNse);
  if (pool.length === 0) return pool;

  const tipoEspacioSic = filters.tipoEspacioSic ?? "Todas";
  const todasDisc = filters.disciplina === "Todas";
  const todasTipo = tipoEspacioSic === "Todas";
  const todaCdmx = filters.alcaldia === "Todas";

  let aldId: string | null = null;
  if (!todaCdmx) {
    if (alcaldiaIdPorNombre[filters.alcaldia]) {
      aldId = alcaldiaIdPorNombre[filters.alcaldia];
    } else {
      const key = Object.keys(alcaldiaIdPorNombre).find((k) =>
        matchesLoose(k, filters.alcaldia),
      );
      aldId = key ? alcaldiaIdPorNombre[key] : null;
    }
  }

  const pick = (
    okAld: (row: EstadisticaRow) => boolean,
    okSeg: (row: EstadisticaRow) => boolean,
  ) => pool.filter((row) => okAld(row) && okSeg(row));

  const segGeneral = (row: EstadisticaRow) => discTodasRow(row) && tipoSicVacio(row);
  const segDiscExacta = (row: EstadisticaRow) =>
    discMatchRow(row, filters.disciplina) && tipoSicVacio(row);
  const segTipoExacto = (row: EstadisticaRow) =>
    tipoSicMatchRow(row, tipoEspacioSic) && discTodasRow(row);

  if (aldId && !todaCdmx) {
    if (!todasTipo) {
      const r = pick((row) => aldMatchRow(row, aldId!), segTipoExacto);
      if (r.length > 0) return r;
    } else if (!todasDisc) {
      const r = pick((row) => aldMatchRow(row, aldId!), segDiscExacta);
      if (r.length > 0) return r;
    }
    const rGen = pick((row) => aldMatchRow(row, aldId!), segGeneral);
    if (rGen.length > 0) return rGen;
  }

  if (!todasTipo) {
    const r = pick(aldGlobalRow, segTipoExacto);
    if (r.length > 0) return r;
  }
  if (!todasDisc) {
    const r = pick(aldGlobalRow, segDiscExacta);
    if (r.length > 0) return r;
  }
  return pick(aldGlobalRow, segGeneral);
}

export function nseIndicadoresUsanFallbackGlobal(
  filas: EstadisticaRow[],
  alcaldia: string,
): boolean {
  if (alcaldia === "Todas" || filas.length === 0) return false;
  return filas.every((row) => !(row.alcaldia_id?.trim() ?? ""));
}

export function buildParticipacionNseChart(rows: EstadisticaRow[]): ParticipacionNseChart {
  if (rows.length === 0) {
    return {
      etiquetas: [...ETIQUETAS],
      valores: [0, 0, 0],
      maxY: 52,
      tieneDatos: false,
      avisoFallbackGlobal: false,
    };
  }

  let bajo = 0;
  let medio = 0;
  let alto = 0;
  let tb = false;
  let tm = false;
  let ta = false;

  for (const row of rows) {
    const raw = row.titulo;
    const t = raw.toLowerCase();
    const v = Number(row.valor) || 0;
    const esNse = t.includes("nse");

    if (
      !tb &&
      (tituloCoincideCanon(raw, TITULO_NSE_BAJO) || (esNse && t.includes("bajo")))
    ) {
      bajo = v;
      tb = true;
    } else if (
      !tm &&
      (tituloCoincideCanon(raw, TITULO_NSE_MEDIO) ||
        (esNse && (t.includes("medio") || t.includes("mediano"))))
    ) {
      medio = v;
      tm = true;
    } else if (
      !ta &&
      (tituloCoincideCanon(raw, TITULO_NSE_ALTO) || (esNse && t.includes("alto")))
    ) {
      alto = v;
      ta = true;
    }
  }

  if (!tb && !tm && !ta) {
    return {
      etiquetas: [...ETIQUETAS],
      valores: [0, 0, 0],
      maxY: 52,
      tieneDatos: false,
      avisoFallbackGlobal: false,
    };
  }

  const valores = [bajo, medio, alto];
  const mx = Math.max(...valores, 0);
  const maxY = mx <= 0 ? 52 : Math.min(100, Math.max(52, Math.round(mx * 1.15)));

  return {
    etiquetas: [...ETIQUETAS],
    valores,
    maxY,
    tieneDatos: true,
    avisoFallbackGlobal: false,
  };
}
