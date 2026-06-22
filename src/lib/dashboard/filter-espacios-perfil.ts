import type { EstadisticaRow } from "@/lib/domain/dashboard";
import type { DashboardFilterState, EspacioRawRow } from "@/lib/dashboard/apply-dashboard-filters";
import {
  estadisticaMatchesRangoEdad,
  hasParticipacionEdadDatos,
  isParticipacionEdad,
} from "@/lib/dashboard/participacion-edad";

const RANGOS_EDAD = ["18-29", "30-44", "45-59", "60+"] as const;

function norm(s: string): string {
  return s.trim().toLowerCase();
}

function matchesLoose(a: string, b: string): boolean {
  const x = norm(a);
  const y = norm(b);
  if (!x || !y) return false;
  return x === y || x.includes(y) || y.includes(x);
}

function tituloLower(titulo: string): string {
  return titulo.toLowerCase();
}

function isParticipacionGenero(row: EstadisticaRow): boolean {
  const c = row.categoria?.toLowerCase() ?? "";
  return c.includes("género") || c.includes("genero");
}

function isRangoEdadToken(value: string): boolean {
  return RANGOS_EDAD.some((r) => matchesLoose(value, r));
}

function isParticipacionNse(row: EstadisticaRow): boolean {
  return row.categoria === "Participación NSE";
}

function rowMatchesGeneroStat(row: EstadisticaRow, genero: string): boolean {
  const t = tituloLower(row.titulo);
  const v = Number(row.valor) || 0;
  if (v <= 0) return false;
  if (genero === "Mujer") return t.includes("mujer");
  if (genero === "Hombre") return t.includes("hombre");
  if (genero === "No binario / otro") {
    return (
      t.includes("no bin") ||
      t.includes("binario") ||
      t.includes("otro") ||
      t.includes("lgbt")
    );
  }
  return false;
}

export type PerfilDimensionTokens = {
  tipologias: Set<string>;
  alcaldiaIds: Set<string>;
};

export function extractPerfilTokensFromEstadisticas(
  rows: EstadisticaRow[],
): PerfilDimensionTokens {
  const tipologias = new Set<string>();
  const alcaldiaIds = new Set<string>();

  for (const row of rows) {
    const tipo = row.tipo_espacio_sic?.trim();
    const disc = row.disciplina_nombre?.trim();
    if (tipo) tipologias.add(tipo);
    if (disc && !isRangoEdadToken(disc)) tipologias.add(disc);
    const aldId = row.alcaldia_id?.trim();
    if (aldId) alcaldiaIds.add(aldId);
  }

  return { tipologias, alcaldiaIds };
}

function espacioMatchesTipologias(espacio: EspacioRawRow, tipologias: Set<string>): boolean {
  if (tipologias.size === 0) return true;
  for (const token of tipologias) {
    if (matchesLoose(espacio.tipo, token)) return true;
  }
  return false;
}

function espacioMatchesAlcaldiaIds(
  espacio: EspacioRawRow,
  alcaldiaIds: Set<string>,
  alcaldiaIdPorNombre: Record<string, string>,
): boolean {
  if (alcaldiaIds.size === 0) return true;
  for (const [nombre, id] of Object.entries(alcaldiaIdPorNombre)) {
    if (alcaldiaIds.has(id) && matchesLoose(nombre, espacio.alcaldia)) {
      return true;
    }
  }
  return false;
}

function espacioMatchesDimension(
  espacio: EspacioRawRow,
  tokens: PerfilDimensionTokens,
  alcaldiaIdPorNombre: Record<string, string>,
): boolean {
  return (
    espacioMatchesTipologias(espacio, tokens.tipologias) &&
    espacioMatchesAlcaldiaIds(espacio, tokens.alcaldiaIds, alcaldiaIdPorNombre)
  );
}

function poolEstadisticasNse(
  estadisticas: EstadisticaRow[],
  nse: string,
): EstadisticaRow[] {
  return estadisticas.filter((row) => {
    if (!isParticipacionNse(row)) return false;
    const seg = row.segmento_nse?.trim();
    if (seg) return matchesLoose(seg, nse);
    return matchesLoose(row.titulo, nse);
  });
}

function poolEstadisticasEdad(
  estadisticas: EstadisticaRow[],
  edad: string,
): EstadisticaRow[] {
  return estadisticas.filter(
    (row) => isParticipacionEdad(row) && estadisticaMatchesRangoEdad(row, edad),
  );
}

function poolEstadisticasGenero(
  participacionRows: EstadisticaRow[],
  genero: string,
): EstadisticaRow[] {
  return participacionRows.filter(
    (row) => isParticipacionGenero(row) && rowMatchesGeneroStat(row, genero),
  );
}

export type FilterEspaciosPerfilResult = {
  espacios: EspacioRawRow[];
  notice: string | null;
};

/**
 * Acota el padrón según métricas de participación (NSE / edad / género) en `estadisticas`.
 * No hay columnas por espacio en `espacios_culturales`; se infiere por tipología SIC y alcaldía.
 */
export function filterEspaciosPorPerfilSocio(
  espacios: EspacioRawRow[],
  estadisticas: EstadisticaRow[],
  filters: DashboardFilterState,
  alcaldiaIdPorNombre: Record<string, string>,
  participacionRowsPool: EstadisticaRow[],
): FilterEspaciosPerfilResult {
  const socioActive =
    filters.nse !== "Todos" ||
    filters.edad !== "Todos" ||
    filters.genero !== "Todos";

  if (!socioActive) {
    return { espacios, notice: null };
  }

  const dimensions: Array<{ label: string; tokens: PerfilDimensionTokens }> = [];
  const skipped: string[] = [];

  if (filters.nse !== "Todos") {
    const pool = poolEstadisticasNse(estadisticas, filters.nse);
    const tokens = extractPerfilTokensFromEstadisticas(pool);
    if (tokens.tipologias.size > 0 || tokens.alcaldiaIds.size > 0) {
      dimensions.push({ label: "NSE", tokens });
    } else if (pool.length > 0) {
      skipped.push("NSE");
    } else {
      skipped.push("NSE (sin métricas)");
    }
  }

  if (filters.edad !== "Todos") {
    if (!hasParticipacionEdadDatos(estadisticas)) {
      skipped.push("edad (sin serie)");
    } else {
      const pool = poolEstadisticasEdad(estadisticas, filters.edad);
      const tokens = extractPerfilTokensFromEstadisticas(pool);
      if (tokens.tipologias.size > 0 || tokens.alcaldiaIds.size > 0) {
        dimensions.push({ label: "edad", tokens });
      } else {
        skipped.push("edad");
      }
    }
  }

  if (filters.genero !== "Todos") {
    const pool = poolEstadisticasGenero(participacionRowsPool, filters.genero);
    const tokens = extractPerfilTokensFromEstadisticas(pool);
    if (tokens.tipologias.size > 0 || tokens.alcaldiaIds.size > 0) {
      dimensions.push({ label: "género", tokens });
    } else if (participacionRowsPool.some(isParticipacionGenero)) {
      skipped.push("género");
    } else {
      skipped.push("género (sin métricas)");
    }
  }

  if (dimensions.length === 0) {
    const skippedText = skipped.length > 0 ? skipped.join(", ") : "perfil";
    return {
      espacios,
      notice: `Los filtros de ${skippedText} no vinculan tipologías en Supabase; el padrón sigue acotado por alcaldía y disciplina.`,
    };
  }

  const filtered = espacios.filter((espacio) =>
    dimensions.every((dim) =>
      espacioMatchesDimension(espacio, dim.tokens, alcaldiaIdPorNombre),
    ),
  );

  const labels = dimensions.map((d) => d.label).join(", ");
  let notice: string | null = null;
  if (filtered.length === 0) {
    notice = `Sin espacios en el padrón para ${labels} con los filtros actuales.`;
  } else if (skipped.length > 0) {
    notice = `Padrón acotado por ${labels}. Sin vínculo tipológico para: ${skipped.join(", ")}.`;
  }

  return { espacios: filtered, notice };
}
