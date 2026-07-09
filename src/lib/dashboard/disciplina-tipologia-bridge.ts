/**
 * Puente disciplina MODECULT (chips KPI) ↔ tipología SIC del padrón.
 * Fuente canónica: `categoria_disciplinas_sugeridas` + `categorias_espacios`.
 * Respaldo local alineado a GeoArte Movil si Supabase no tiene filas.
 */

export type DisciplinaTipologiaBridge = {
  tipologiasPorDisciplinaKpi: Record<string, string[]>;
};

export type CategoriaDisciplinaSugeridaRow = {
  tipologiaSic: string;
  disciplinaFina: string;
};

/** Misma data que migración 20260405140000 (app móvil). */
export const FALLBACK_CATEGORIA_DISCIPLINAS_SUGERIDAS: CategoriaDisciplinaSugeridaRow[] =
  [
    { tipologiaSic: "Auditorios", disciplinaFina: "Teatro" },
    { tipologiaSic: "Auditorios", disciplinaFina: "Danza Contemporánea" },
    { tipologiaSic: "Auditorios", disciplinaFina: "Ballet" },
    { tipologiaSic: "Auditorios", disciplinaFina: "Música de Cámara" },
    { tipologiaSic: "Auditorios", disciplinaFina: "Ópera" },
    { tipologiaSic: "Auditorios", disciplinaFina: "Performance" },
    { tipologiaSic: "Teatros", disciplinaFina: "Teatro" },
    { tipologiaSic: "Teatros", disciplinaFina: "Danza Contemporánea" },
    { tipologiaSic: "Teatros", disciplinaFina: "Ballet" },
    { tipologiaSic: "Teatros", disciplinaFina: "Música de Cámara" },
    { tipologiaSic: "Teatros", disciplinaFina: "Ópera" },
    { tipologiaSic: "Teatros", disciplinaFina: "Performance" },
    { tipologiaSic: "Bibliotecas", disciplinaFina: "Literatura" },
    { tipologiaSic: "Bibliotecas", disciplinaFina: "Poesía" },
    { tipologiaSic: "Bibliotecas DGB", disciplinaFina: "Literatura" },
    { tipologiaSic: "Librerías y puntos de venta", disciplinaFina: "Literatura" },
    { tipologiaSic: "Museos", disciplinaFina: "Artes Visuales" },
    { tipologiaSic: "Museos", disciplinaFina: "Pintura" },
    { tipologiaSic: "Galerías", disciplinaFina: "Artes Visuales" },
    { tipologiaSic: "Casas y centros culturales", disciplinaFina: "Multidisciplinario" },
    { tipologiaSic: "Casas de artesanías", disciplinaFina: "Artes Populares" },
    {
      tipologiaSic: "Complejos cinematográficos",
      disciplinaFina: "Artes Audiovisuales",
    },
    { tipologiaSic: "Universidades", disciplinaFina: "Investigación Artística" },
    {
      tipologiaSic: "Centros Coord. de pueblos indígenas",
      disciplinaFina: "Multidisciplinario",
    },
  ];

function norm(s: string): string {
  return s.trim().toLowerCase();
}

export function matchesLooseText(a: string, b: string): boolean {
  const x = norm(a);
  const y = norm(b);
  if (!x || !y) return false;
  return x === y || x.includes(y) || y.includes(x);
}

/** Disciplina fina (tabla sugeridas) → chip MODECULT del filtro. */
export function disciplinaFinaToKpiChips(fine: string): string[] {
  const f = norm(fine);
  const kpis = new Set<string>();

  if (
    /artes visuales|pintura|escultura|fotograf|instalaci|curadur/.test(f)
  ) {
    kpis.add("Artes Visuales");
  }
  if (/literatura|poes|narrativa|escritura/.test(f)) {
    kpis.add("Literatura");
  }
  if (/música de cámara|musica de camara/.test(f)) {
    kpis.add("Música");
  }
  if (/teatro|danza|ballet|ópera|opera|performance/.test(f)) {
    kpis.add("Artes Escénicas");
  }
  if (
    /multidisciplinario|audiovisual|cinematograf|videoarte|artes plásticas|folclórica|iniciación|populares|alfarer|textiler|talla|investigación artística|investigacion artistica|diseño|diseno|historia del arte/.test(
      f,
    )
  ) {
    kpis.add("Multidisciplinario");
  }

  return [...kpis];
}

export function buildDisciplinaTipologiaBridge(
  rows: CategoriaDisciplinaSugeridaRow[],
): DisciplinaTipologiaBridge {
  const map = new Map<string, Set<string>>();

  for (const { tipologiaSic, disciplinaFina } of rows) {
    const tipologia = tipologiaSic.trim();
    const disciplina = disciplinaFina.trim();
    if (!tipologia || !disciplina) continue;

    for (const kpi of disciplinaFinaToKpiChips(disciplina)) {
      const set = map.get(kpi) ?? new Set<string>();
      set.add(tipologia);
      map.set(kpi, set);
    }
  }

  const tipologiasPorDisciplinaKpi: Record<string, string[]> = {};
  for (const [kpi, tipos] of map.entries()) {
    tipologiasPorDisciplinaKpi[kpi] = [...tipos].sort((a, b) =>
      a.localeCompare(b, "es"),
    );
  }

  return { tipologiasPorDisciplinaKpi };
}

/** Fusiona BD con respaldo estático (BD gana si trae tipologías para un KPI). */
export function resolveDisciplinaTipologiaBridge(
  fromDb: DisciplinaTipologiaBridge,
): DisciplinaTipologiaBridge {
  const fallback = buildDisciplinaTipologiaBridge(FALLBACK_CATEGORIA_DISCIPLINAS_SUGERIDAS);
  const merged: Record<string, string[]> = {
    ...fallback.tipologiasPorDisciplinaKpi,
  };

  for (const [kpi, tipos] of Object.entries(fromDb.tipologiasPorDisciplinaKpi)) {
    if (tipos.length > 0) {
      merged[kpi] = [...tipos].sort((a, b) => a.localeCompare(b, "es"));
    }
  }

  return { tipologiasPorDisciplinaKpi: merged };
}

export const DEFAULT_DISCIPLINA_TIPOLOGIA_BRIDGE = resolveDisciplinaTipologiaBridge({
  tipologiasPorDisciplinaKpi: {},
});

export function tipologiasForDisciplinaKpi(
  disciplinaKpi: string,
  bridge: DisciplinaTipologiaBridge,
): string[] {
  if (disciplinaKpi === "Todas") return [];
  return bridge.tipologiasPorDisciplinaKpi[disciplinaKpi] ?? [];
}

export function espacioTipoMatchesDisciplinaKpi(
  tipoEspacio: string,
  disciplinaKpi: string,
  bridge: DisciplinaTipologiaBridge,
): boolean {
  if (disciplinaKpi === "Todas") return true;
  const tipo = tipoEspacio.trim();
  if (!tipo) return false;
  if (matchesLooseText(tipo, disciplinaKpi)) return true;

  const tipologias = tipologiasForDisciplinaKpi(disciplinaKpi, bridge);
  return tipologias.some((t) => matchesLooseText(tipo, t));
}

export function estadisticaMatchesDisciplinaKpi(
  row: { disciplina_nombre?: string | null; tipo_espacio_sic?: string | null },
  disciplinaKpi: string,
  bridge: DisciplinaTipologiaBridge,
): boolean {
  if (disciplinaKpi === "Todas") return true;

  const disc = row.disciplina_nombre?.trim() ?? "";
  const sic = row.tipo_espacio_sic?.trim() ?? "";

  if (disc && matchesLooseText(disc, disciplinaKpi)) return true;
  if (sic && matchesLooseText(sic, disciplinaKpi)) return true;

  const tipologias = tipologiasForDisciplinaKpi(disciplinaKpi, bridge);
  if (!sic || tipologias.length === 0) return false;

  return tipologias.some((t) => matchesLooseText(sic, t));
}
