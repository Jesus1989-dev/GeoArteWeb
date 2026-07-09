import type { EstadisticaRow, ParticipacionGeneroAgregado } from "@/lib/domain/dashboard";
import {
  DEFAULT_DISCIPLINA_TIPOLOGIA_BRIDGE,
  estadisticaMatchesDisciplinaKpi,
  type DisciplinaTipologiaBridge,
} from "@/lib/dashboard/disciplina-tipologia-bridge";

function norm(s: string): string {
  return s.trim().toLowerCase();
}

function matchesLoose(a: string, b: string): boolean {
  const x = norm(a);
  const y = norm(b);
  if (!x || !y) return false;
  return x === y || x.includes(y) || y.includes(x);
}

export function esFilaCategoriaParticipacionGenero(row: EstadisticaRow): boolean {
  const c = row.categoria?.toLowerCase() ?? "";
  return c.includes("género") || c.includes("genero");
}

function segmentoNseCoincide(segmento: string | null | undefined, chip: string): boolean {
  const a = (segmento ?? "").trim().toLowerCase();
  const b = chip.trim().toLowerCase();
  if (!a || !b) return false;
  return a === b || a.includes(b) || b.includes(a);
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

function tituloEsLgbtiq(titulo: string): boolean {
  const s = titulo.toLowerCase();
  if (s.includes("no bin")) return false;
  return (
    s.includes("lgbtttiq") ||
    s.includes("lgbtiq") ||
    (s.includes("lgbt") && s.includes("part"))
  );
}

function tituloEsNoBinario(titulo: string): boolean {
  const s = titulo.toLowerCase();
  if (tituloEsLgbtiq(titulo)) return false;
  if (tituloEsOtros(titulo)) return false;
  return s.includes("no bin") || (s.includes("binario") && s.includes("no"));
}

function tituloEsOtros(titulo: string): boolean {
  const s = titulo.toLowerCase();
  if (s.includes("mujer") || s.includes("hombre")) return false;
  if (s.includes("no bin") || s.includes("lgbt") || s.includes("lgbtttiq")) return false;
  return (s.includes("part") && s.includes("otro")) || s.trim() === "otros";
}

function promedio(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

/** Selección de filas alineada a Flutter `elegirFilasParticipacionGenero`. */
export function elegirFilasParticipacionGeneroAgregado(
  rows: EstadisticaRow[],
  filters: {
    alcaldia: string;
    disciplina: string;
    nse: string;
    tipoEspacioSic?: string;
  },
  alcaldiaIdPorNombre: Record<string, string>,
  bridge: DisciplinaTipologiaBridge = DEFAULT_DISCIPLINA_TIPOLOGIA_BRIDGE,
): EstadisticaRow[] {
  let pool = rows.filter(esFilaCategoriaParticipacionGenero);
  if (pool.length === 0) return pool;

  const tipoEspacioSic = filters.tipoEspacioSic ?? "Todas";
  const segmentoNseChip = filters.nse;

  if (segmentoNseChip !== "Todos") {
    pool = pool.filter((row) => segmentoNseCoincide(row.segmento_nse, segmentoNseChip));
  } else {
    const general = pool.filter((row) => !(row.segmento_nse?.trim() ?? ""));
    if (general.length > 0) pool = general;
  }

  const todaCdmx = filters.alcaldia === "Todas";
  const todasDisc = filters.disciplina === "Todas";
  const todasTipo = tipoEspacioSic === "Todas";

  let aldId: string | null = null;
  if (!todaCdmx) {
    if (alcaldiaIdPorNombre[filters.alcaldia]) {
      aldId = alcaldiaIdPorNombre[filters.alcaldia];
    } else {
      const key = Object.keys(alcaldiaIdPorNombre).find((nombre) =>
        matchesLoose(nombre, filters.alcaldia),
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
  const segDiscPorTipologia = (row: EstadisticaRow) =>
    estadisticaMatchesDisciplinaKpi(row, filters.disciplina, bridge);
  const segTipoExacto = (row: EstadisticaRow) =>
    tipoSicMatchRow(row, tipoEspacioSic) && discTodasRow(row);

  const pickDisciplina = (
    okAld: (row: EstadisticaRow) => boolean,
  ): EstadisticaRow[] => {
    const exacta = pick(okAld, segDiscExacta);
    if (exacta.length > 0) return exacta;
    return pick(okAld, segDiscPorTipologia);
  };

  if (aldId && !todaCdmx) {
    const aldOk = (row: EstadisticaRow) => aldMatchRow(row, aldId!);
    if (!todasTipo) {
      const r = pick(aldOk, segTipoExacto);
      if (r.length > 0) return r;
      if (todasDisc) {
        const rGen = pick(aldOk, segGeneral);
        if (rGen.length > 0) return rGen;
      }
    }
    if (!todasDisc) {
      const r = pickDisciplina(aldOk);
      if (r.length > 0) return r;
    }
    if (todasDisc && todasTipo) {
      const rGen = pick(aldOk, segGeneral);
      if (rGen.length > 0) return rGen;
    }
  }

  if (!todasTipo) {
    const r = pick(aldGlobalRow, segTipoExacto);
    if (r.length > 0) return r;
    if (todasDisc) {
      const rGen = pick(aldGlobalRow, segGeneral);
      if (rGen.length > 0) return rGen;
    }
    return [];
  }
  if (!todasDisc) {
    const r = pickDisciplina(aldGlobalRow);
    if (r.length > 0) return r;
    return [];
  }
  return pick(aldGlobalRow, segGeneral);
}

/** Tres barras Mujeres / Hombres / Otros (paridad Flutter `ParticipacionGeneroParsed`). */
export function buildParticipacionGeneroAgregado(
  rows: EstadisticaRow[],
): ParticipacionGeneroAgregado {
  const etiquetas = ["Mujeres", "Hombres", "Otros"];

  if (rows.length === 0) {
    return { etiquetas, valores: [0, 0, 0], maxY: 100, tieneDatos: false };
  }

  const mujeresVals: number[] = [];
  const hombresVals: number[] = [];
  const noBinVals: number[] = [];
  const lgbtVals: number[] = [];
  const otrosVals: number[] = [];

  for (const row of rows) {
    const t = row.titulo;
    const tl = t.toLowerCase();
    const v = Number(row.valor) || 0;

    if (tituloEsOtros(t)) otrosVals.push(v);
    else if (tl.includes("mujer")) mujeresVals.push(v);
    else if (tl.includes("hombre")) hombresVals.push(v);
    else if (tituloEsLgbtiq(t)) lgbtVals.push(v);
    else if (tituloEsNoBinario(t)) noBinVals.push(v);
    else if (tl.includes("lgbt") || tl.includes("lgbtttiq")) lgbtVals.push(v);
    else if (tl.includes("binario")) noBinVals.push(v);
    else noBinVals.push(v);
  }

  const tieneMujeres = mujeresVals.length > 0;
  const tieneHombres = hombresVals.length > 0;
  const tieneOtros =
    otrosVals.length > 0 || noBinVals.length > 0 || lgbtVals.length > 0;

  if (!tieneMujeres && !tieneHombres && !tieneOtros) {
    return { etiquetas, valores: [0, 0, 0], maxY: 100, tieneDatos: false };
  }

  const mujeres = promedio(mujeresVals);
  const hombres = promedio(hombresVals);
  const otros =
    otrosVals.length > 0
      ? promedio(otrosVals)
      : promedio([...noBinVals, ...lgbtVals]);

  const valores = [mujeres, hombres, otros];
  const mx = Math.max(...valores, 0);
  const maxY = mx <= 0 ? 100 : Math.min(100, Math.max(10, Math.round(mx * 1.15)));

  return {
    etiquetas,
    valores,
    maxY,
    tieneDatos: true,
  };
}

export function applyGeneroAgregadoDisplayFilter(
  data: ParticipacionGeneroAgregado,
  genero: string,
): ParticipacionGeneroAgregado {
  if (genero === "Todos") return data;
  const valores = [...data.valores];
  if (genero === "Mujer") {
    valores[1] = 0;
    valores[2] = 0;
  } else if (genero === "Hombre") {
    valores[0] = 0;
    valores[2] = 0;
  } else {
    valores[0] = 0;
    valores[1] = 0;
  }
  return { ...data, valores };
}
