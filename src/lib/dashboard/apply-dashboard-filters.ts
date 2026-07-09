import type {
  ComparadorMetricaRow,
  DashboardKpi,
  DensidadInfraRow,
  DistribucionTipologiaRow,
  EspacioTablaRow,
  EstadisticaRow,
  MetricaAlcaldiaResumen,
  MetricasNegocioResumen,
  MovilidadModoRow,
  ParticipacionGeneroRow,
  ParticipacionGeneroAgregado,
  ParticipacionNseChart,
  TendenciaAsistenciaRow,
  TendenciaInventarioView,
} from "@/lib/domain/dashboard";
import { PARTICIPACION_GENERO_MAX_TIPOLOGIAS } from "@/lib/domain/dashboard";
import { buildDistribucionFromEspaciosRows } from "@/lib/dashboard/distribucion-tipologia";
import {
  buildComparadorMetricas,
  buildHallazgoTerritorial,
} from "@/lib/data/supabase/dashboard.repository";
import { getAnioCorteMetricas } from "@/lib/data/supabase/config";
import {
  buildParticipacionEdadFromRows,
  filterEstadisticasPorEdad,
  hasParticipacionEdadDatos,
  scaleParticipacionMockPorEdad,
} from "@/lib/dashboard/participacion-edad";
import {
  buildTendenciaExistenciaSeries,
  buildTendenciaInventarioView,
  resolveExistenciaAnualParaTendencia,
} from "@/lib/dashboard/existencia-anual";
import { buildMetricasNegocioResumen } from "@/lib/dashboard/metricas-negocio";
import {
  agregarMovilidadPorModo,
  filtrarMovilidadAlPeriodoMasReciente,
  filtrarMovilidadPorAlcaldia,
  type MovilidadAccesoRow,
} from "@/lib/dashboard/movilidad-acceso";
import {
  buildParticipacionNseChart,
  elegirFilasIndicadoresNse,
  nseIndicadoresUsanFallbackGlobal,
} from "@/lib/dashboard/participacion-nse";
import {
  applyGeneroAgregadoDisplayFilter,
  buildParticipacionGeneroAgregado,
  elegirFilasParticipacionGeneroAgregado,
} from "@/lib/dashboard/participacion-genero-agregado";
import { filterEspaciosPorPerfilSocio } from "@/lib/dashboard/filter-espacios-perfil";
import {
  buildEspaciosPadronExportRows,
  padronExportFromTablaRows,
  type EspacioPadronExportRow,
} from "@/lib/dashboard/padron-export";
import {
  computeCompletitudRegistro,
  deriveEstadoEspacio,
} from "@/lib/espacios/espacio-registro";

export type DashboardFilterState = {
  alcaldia: string;
  disciplina: string;
  periodo: string;
  nse: string;
  edad: string;
  genero: string;
};

export type EspacioRawRow = {
  id: string;
  nombre: string;
  alcaldia: string;
  tipo: string;
  direccion: string | null;
  descripcion: string | null;
  latitud: number | null;
  longitud: number | null;
  horario: string | null;
  telefono: string | null;
  fecha_fundacion?: string | null;
  sic_fecha_modificacion?: string | null;
  created_at?: string | null;
};

export type DashboardRawSnapshot = {
  anioCorte: number;
  estadisticas: EstadisticaRow[];
  metricasPorAlcaldia: Record<string, MetricaAlcaldiaResumen>;
  conteoPorAlcaldia: Record<string, number>;
  totalEspaciosRpc: number;
  totalEspaciosPadron: number;
  densidadCiudad: Array<{ macrozona: string; porcentaje: number }>;
  espacios: EspacioRawRow[];
  existenciaAnual: Array<{ anio: number; valor: number }>;
  movilidadAcceso: MovilidadAccesoRow[];
  alcaldiaIdPorNombre: Record<string, string>;
  alcaldias: string[];
  disciplinas: string[];
  segmentosNse: string[];
};

export type FilteredDashboardView = {
  dashboardKpis: DashboardKpi[];
  participacionGenero: ParticipacionGeneroRow[];
  participacionGeneroAgregado: ParticipacionGeneroAgregado;
  participacionMaxY: number;
  tendenciaAsistencia: TendenciaAsistenciaRow[];
  tendenciaTitulo: string;
  tendenciaLeyendaPrincipal: string;
  /** Segunda serie del gráfico; null oculta la línea secundaria. */
  tendenciaLeyendaSecundaria: string | null;
  tendenciaInventario: TendenciaInventarioView;
  participacionNse: ParticipacionNseChart;
  movilidadPorModo: MovilidadModoRow[];
  metricasNegocio: MetricasNegocioResumen | null;
  densidadInfra: DensidadInfraRow[];
  distribucionTipologia: DistribucionTipologiaRow[];
  espaciosTablaRows: EspacioTablaRow[];
  espaciosPadronExportRows: EspacioPadronExportRow[];
  filterSummary: string;
  filterNotice: string | null;
  hasParticipacionDatos: boolean;
};

const MACROZONA_LABELS: Record<string, string> = {
  NORTE: "Norte",
  CENTRO: "Centro",
  SUR: "Sur",
  PONIENTE: "Poniente",
  ORIENTE: "Oriente",
};

function norm(s: string): string {
  return s.trim().toLowerCase();
}

function matchesLoose(a: string, b: string): boolean {
  const x = norm(a);
  const y = norm(b);
  if (!x || !y) return false;
  return x === y || x.includes(y) || y.includes(x);
}

function formatNumber(n: number): string {
  return n.toLocaleString("es-MX");
}

function formatPercent(n: number): string {
  return `${Math.round(n)}%`;
}

function isParticipacionGenero(row: EstadisticaRow): boolean {
  const c = row.categoria?.toLowerCase() ?? "";
  return c.includes("género") || c.includes("genero");
}

function tituloLower(titulo: string): string {
  return titulo.toLowerCase();
}

export function parseAnioFromPeriodo(periodo: string): number | null {
  const match = periodo.match(/(20\d{2})\s*-\s*(20\d{2})/);
  if (!match) return null;
  return Number.parseInt(match[2], 10);
}

export function resolveAnioCorteFromFilters(
  filters: Pick<DashboardFilterState, "periodo">,
  fallback?: number,
): number {
  return parseAnioFromPeriodo(filters.periodo) ?? fallback ?? getAnioCorteMetricas();
}

function alcaldiaIdForNombre(
  nombre: string,
  map: Record<string, string>,
): string | null {
  if (nombre === "Todas") return null;
  if (map[nombre]) return map[nombre];
  const key = Object.keys(map).find((k) => matchesLoose(k, nombre));
  return key ? map[key] : null;
}

function filterEspaciosByAlcaldia(
  espacios: EspacioRawRow[],
  alcaldia: string,
): EspacioRawRow[] {
  if (alcaldia === "Todas") return espacios;
  return espacios.filter((e) => matchesLoose(e.alcaldia, alcaldia));
}

function filterEspaciosByDisciplina(
  espacios: EspacioRawRow[],
  disciplina: string,
): EspacioRawRow[] {
  if (disciplina === "Todas") return espacios;
  return espacios.filter((e) => matchesLoose(e.tipo, disciplina));
}

function elegirFilasParticipacionGenero(
  rows: EstadisticaRow[],
  filters: DashboardFilterState,
  alcaldiaIdPorNombre: Record<string, string>,
): EstadisticaRow[] {
  let pool = rows.filter(isParticipacionGenero);

  if (filters.nse !== "Todos") {
    const byNse = pool.filter((r) => {
      const seg = r.segmento_nse?.trim();
      if (seg) return matchesLoose(seg, filters.nse);
      return matchesLoose(r.titulo, filters.nse);
    });
    if (byNse.length > 0) pool = byNse;
  } else {
    const general = pool.filter((r) => !(r.segmento_nse?.trim()));
    if (general.length > 0) pool = general;
  }

  const aldId = alcaldiaIdForNombre(filters.alcaldia, alcaldiaIdPorNombre);
  if (aldId) {
    const byAld = pool.filter((r) => r.alcaldia_id === aldId);
    if (byAld.length > 0) pool = byAld;
  } else if (filters.alcaldia === "Todas" && filters.disciplina === "Todas") {
    const byTipologia = pool.filter((r) => (r.tipo_espacio_sic?.trim() ?? "") !== "");
    if (byTipologia.length > 0) {
      pool = byTipologia;
    } else {
      const city = pool.filter((r) => !r.alcaldia_id?.trim());
      if (city.length > 0) pool = city;
    }
  } else if (filters.alcaldia === "Todas") {
    const city = pool.filter((r) => !r.alcaldia_id?.trim());
    if (city.length > 0) pool = city;
  }

  if (filters.disciplina !== "Todas") {
    const byDisc = pool.filter(
      (r) =>
        matchesLoose(r.disciplina_nombre ?? "", filters.disciplina) ||
        matchesLoose(r.tipo_espacio_sic ?? "", filters.disciplina),
    );
    if (byDisc.length > 0) pool = byDisc;
  }

  return pool;
}

function buildParticipacionFromRows(rows: EstadisticaRow[]): ParticipacionGeneroRow[] {
  const byKey = new Map<string, { hombres: number[]; mujeres: number[]; otros: number[] }>();

  for (const row of rows) {
    const key =
      row.disciplina_nombre?.trim() ||
      row.tipo_espacio_sic?.trim() ||
      "Participación general";
    const bucket = byKey.get(key) ?? { hombres: [], mujeres: [], otros: [] };
    const t = tituloLower(row.titulo);
    const v = Number(row.valor) || 0;

    if (t.includes("mujer")) bucket.mujeres.push(v);
    else if (t.includes("hombre")) bucket.hombres.push(v);
    else bucket.otros.push(v);

    byKey.set(key, bucket);
  }

  const avg = (xs: number[]) =>
    xs.length === 0 ? 0 : xs.reduce((a, b) => a + b, 0) / xs.length;

  return [...byKey.entries()]
    .map(([disciplina, vals]) => ({
      disciplina,
      hombres: Math.round(avg(vals.hombres)),
      mujeres: Math.round(avg(vals.mujeres)),
      otros: Math.round(avg(vals.otros)),
    }))
    .sort((a, b) => a.disciplina.localeCompare(b.disciplina, "es"))
    .slice(0, PARTICIPACION_GENERO_MAX_TIPOLOGIAS);
}

function applyGeneroDisplayFilter(
  rows: ParticipacionGeneroRow[],
  genero: string,
): ParticipacionGeneroRow[] {
  if (genero === "Todos") return rows;
  return rows.map((r) => {
    if (genero === "Mujer") return { ...r, hombres: 0, otros: 0 };
    if (genero === "Hombre") return { ...r, mujeres: 0, otros: 0 };
    return { ...r, hombres: 0, mujeres: 0 };
  });
}

function findByAlcaldiaName<T>(map: Record<string, T>, alcaldia: string): T | undefined {
  if (map[alcaldia]) return map[alcaldia];
  const key = Object.keys(map).find((k) => matchesLoose(k, alcaldia));
  return key ? map[key] : undefined;
}

function buildKpisFiltered(
  raw: DashboardRawSnapshot,
  filters: DashboardFilterState,
  espaciosFiltrados: EspacioRawRow[],
): DashboardKpi[] {
  const { metricasPorAlcaldia, conteoPorAlcaldia, totalEspaciosPadron, estadisticas } = raw;

  if (filters.alcaldia !== "Todas") {
    const metrica = findByAlcaldiaName(metricasPorAlcaldia, filters.alcaldia);
    const conteo =
      findByAlcaldiaName(conteoPorAlcaldia, filters.alcaldia) ??
      metrica?.cantidadEspacios ??
      espaciosFiltrados.length;

    return [
      {
        label: "Espacios en demarcación",
        value: formatNumber(conteo),
        delta: filters.alcaldia,
        deltaPositive: true,
        accent: "navy",
        icon: "layers",
      },
      {
        label: "Cobertura local",
        value: formatPercent(metrica?.porcentajeCobertura ?? 0),
        delta: "En el padrón",
        deltaPositive: true,
        accent: "pink",
        icon: "mapPin",
      },
      {
        label: "Brecha territorial",
        value: formatPercent(metrica?.porcentajeBrecha ?? 0),
        delta: "Indicador SECTEI",
        deltaPositive: false,
        accent: "navy",
        icon: "trendingUp",
      },
      {
        label: "Tipologías activas",
        value: formatNumber(new Set(espaciosFiltrados.map((e) => e.tipo)).size),
        delta: "En el filtro",
        deltaPositive: true,
        accent: "pink",
        icon: "users",
      },
    ];
  }

  const brechaPromedio =
    Object.values(metricasPorAlcaldia).length > 0
      ? Object.values(metricasPorAlcaldia).reduce((s, m) => s + m.porcentajeBrecha, 0) /
        Object.values(metricasPorAlcaldia).length
      : 0;

  const resumen = (titulo: string, fallback: number) => {
    const row =
      estadisticas.find((r) => r.categoria === "Resumen" && r.titulo === titulo) ??
      estadisticas.find((r) => r.titulo === titulo);
    return row?.valor ?? fallback;
  };

  return [
    {
      label: "Total Espacios",
      value: formatNumber(totalEspaciosPadron),
      delta: "Padrón SECTEI",
      deltaPositive: true,
      accent: "navy",
      icon: "layers",
    },
    {
      label: "Alcaldías",
      value: formatNumber(Number(resumen("Alcaldias", raw.alcaldias.length))),
      delta: "Demarcaciones",
      deltaPositive: true,
      accent: "pink",
      icon: "users",
    },
    {
      label: "Cobertura Territorial",
      value: formatPercent(Number(resumen("Cobertura", 0))),
      delta: "Ciudad completa",
      deltaPositive: true,
      accent: "navy",
      icon: "mapPin",
    },
    {
      label: "Brecha Promedio",
      value: formatPercent(brechaPromedio),
      delta: "Por demarcación",
      deltaPositive: false,
      accent: "pink",
      icon: "trendingUp",
    },
  ];
}

function buildDistribucionFromEspacios(espacios: EspacioRawRow[]): DistribucionTipologiaRow[] {
  return buildDistribucionFromEspaciosRows(espacios);
}

export function buildDensidadInfraFromMacrozonas(
  macrozonas: Array<{ macrozona: string; porcentaje: number }>,
): DensidadInfraRow[] {
  return macrozonas.map((z) => ({
    zona: MACROZONA_LABELS[z.macrozona] ?? z.macrozona,
    valor: Math.round(z.porcentaje * 100) / 100,
  }));
}

function buildFilterSummary(filters: DashboardFilterState, anioCorte: number): string {
  const parts = [
    filters.alcaldia !== "Todas" ? filters.alcaldia : "Toda la CDMX",
    filters.disciplina !== "Todas" ? filters.disciplina : null,
    filters.nse !== "Todos" ? `NSE ${filters.nse}` : null,
    filters.edad !== "Todos" ? `Edad ${filters.edad}` : null,
    filters.genero !== "Todos" ? filters.genero : null,
  ].filter(Boolean);
  return `${parts.join(" · ")} · corte ${anioCorte}`;
}

function buildEspaciosTablaRows(espacios: EspacioRawRow[]): EspacioTablaRow[] {
  return [...espacios]
    .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"))
    .map((row) => ({
      id: row.id.slice(0, 8).toUpperCase(),
      nombre: row.nombre,
      alcaldia: row.alcaldia,
      completitud: computeCompletitudRegistro(row),
      estado: deriveEstadoEspacio(row),
      lat: row.latitud,
      lng: row.longitud,
    }));
}

export function applyDashboardFilters(
  raw: DashboardRawSnapshot,
  filters: DashboardFilterState,
  densidadMacrozonas: Array<{ macrozona: string; porcentaje: number }>,
): FilteredDashboardView {
  const notices: string[] = [];

  if (
    raw.estadisticas.length === 0 &&
    Object.keys(raw.metricasPorAlcaldia).length === 0
  ) {
    notices.push(
      `No hay métricas cargadas para el corte ${raw.anioCorte} en Supabase.`,
    );
  }

  const periodoAnio = parseAnioFromPeriodo(filters.periodo);
  if (periodoAnio != null && periodoAnio !== raw.anioCorte) {
    notices.push(
      `El periodo ${filters.periodo} no coincide con el corte ${raw.anioCorte} disponible en Supabase.`,
    );
  }

  let estadisticasFiltradas = filterEstadisticasPorEdad(raw.estadisticas, filters.edad);
  const haySerieEdad = hasParticipacionEdadDatos(raw.estadisticas);

  if (filters.edad !== "Todos" && !haySerieEdad) {
    notices.push(
      "Sin serie «Participación Edad» en Supabase. Ejecuta supabase/seed-participacion-edad.sql en el SQL Editor.",
    );
  }

  let espacios = filterEspaciosByAlcaldia(raw.espacios, filters.alcaldia);
  espacios = filterEspaciosByDisciplina(espacios, filters.disciplina);

  const participacionRows = elegirFilasParticipacionGenero(
    estadisticasFiltradas,
    filters,
    raw.alcaldiaIdPorNombre,
  );
  const participacionRowsAgregado = elegirFilasParticipacionGeneroAgregado(
    estadisticasFiltradas,
    filters,
    raw.alcaldiaIdPorNombre,
  );

  const perfilPadron = filterEspaciosPorPerfilSocio(
    espacios,
    estadisticasFiltradas,
    filters,
    raw.alcaldiaIdPorNombre,
    participacionRows,
  );
  espacios = perfilPadron.espacios;
  if (perfilPadron.notice) {
    notices.push(perfilPadron.notice);
  }
  let participacionGenero = buildParticipacionFromRows(participacionRows);
  let participacionGeneroAgregado = buildParticipacionGeneroAgregado(
    participacionRowsAgregado,
  );

  if (filters.edad !== "Todos" && haySerieEdad) {
    const porEdad = buildParticipacionEdadFromRows(estadisticasFiltradas, filters.edad);
    if (porEdad.length > 0) participacionGenero = porEdad;
  }

  const hasParticipacionAgregado =
    participacionGeneroAgregado.tieneDatos &&
    participacionGeneroAgregado.valores.some((value) => value > 0);
  const hasParticipacionTipologia = participacionGenero.some(
    (r) => r.hombres > 0 || r.mujeres > 0 || r.otros > 0,
  );
  const hasParticipacionDatos = hasParticipacionAgregado || hasParticipacionTipologia;

  if (!hasParticipacionDatos) {
    notices.push("Sin datos de participación por género para esta combinación de filtros.");
    participacionGenero = [];
    participacionGeneroAgregado = buildParticipacionGeneroAgregado([]);
  } else {
    participacionGenero = applyGeneroDisplayFilter(participacionGenero, filters.genero);
    participacionGeneroAgregado = applyGeneroAgregadoDisplayFilter(
      participacionGeneroAgregado,
      filters.genero,
    );
  }

  const participacionMaxY = Math.max(
    100,
    participacionGeneroAgregado.maxY,
    ...participacionGenero.flatMap((r) => [r.hombres, r.mujeres, r.otros]),
    4,
  );

  /** Tendencia: solo territorio (la disciplina no aplica, como en Flutter). */
  const espaciosTendenciaTerritorio = filterEspaciosByAlcaldia(
    raw.espacios,
    filters.alcaldia,
  );
  const vistaGlobalTendencia = filters.alcaldia === "Todas";
  const existenciaParaTendencia = resolveExistenciaAnualParaTendencia({
    vistaGlobal: vistaGlobalTendencia,
    existenciaGlobal: raw.existenciaAnual,
    espaciosTerritorio: espaciosTendenciaTerritorio,
  });
  const tendenciaExistencia = buildTendenciaExistenciaSeries(
    existenciaParaTendencia,
  );
  const usaExistenciaAnual = tendenciaExistencia.length > 0;
  const territorioTendenciaLabel =
    filters.alcaldia === "Todas" ? "Toda la CDMX" : filters.alcaldia;
  const tendenciaInventario = buildTendenciaInventarioView(
    existenciaParaTendencia,
    territorioTendenciaLabel,
  );

  const nseRows = elegirFilasIndicadoresNse(
    estadisticasFiltradas,
    {
      alcaldia: filters.alcaldia,
      disciplina: filters.disciplina,
    },
    raw.alcaldiaIdPorNombre,
  );
  const participacionNse = {
    ...buildParticipacionNseChart(nseRows),
    avisoFallbackGlobal: nseIndicadoresUsanFallbackGlobal(nseRows, filters.alcaldia),
  };

  const movilidadFiltrada = filtrarMovilidadPorAlcaldia(
    filtrarMovilidadAlPeriodoMasReciente(raw.movilidadAcceso),
    filters.alcaldia,
  );
  const movilidadPorModo = agregarMovilidadPorModo(movilidadFiltrada);
  const metricasNegocio = buildMetricasNegocioResumen(
    raw.metricasPorAlcaldia,
    filters.alcaldia,
  );

  if (!participacionNse.tieneDatos) {
    notices.push("Sin datos de indicadores NSE para esta combinación de filtros.");
  }
  if (movilidadPorModo.length === 0) {
    notices.push("Sin datos de movilidad para el territorio seleccionado.");
  }

  if (!vistaGlobalTendencia && !usaExistenciaAnual) {
    notices.push(
      `Sin datos de tendencia anual para ${filters.alcaldia} con los filtros actuales.`,
    );
  }

  const distribucionTipologia = buildDistribucionFromEspacios(espacios);
  if (distribucionTipologia.length === 0) {
    notices.push("Sin espacios en el padrón para los filtros seleccionados.");
  }

  return {
    dashboardKpis: buildKpisFiltered(raw, filters, espacios),
    participacionGenero,
    participacionGeneroAgregado,
    participacionMaxY,
    tendenciaAsistencia: usaExistenciaAnual ? tendenciaExistencia : [],
    tendenciaTitulo: usaExistenciaAnual
      ? "Tendencia del inventario cultural"
      : "Tendencia del inventario cultural",
    tendenciaLeyendaPrincipal: usaExistenciaAnual
      ? "Espacios en padrón"
      : "Espacios en padrón",
    tendenciaLeyendaSecundaria: null,
    tendenciaInventario,
    participacionNse,
    movilidadPorModo,
    metricasNegocio,
    densidadInfra: buildDensidadInfraFromMacrozonas(densidadMacrozonas),
    distribucionTipologia,
    espaciosTablaRows: buildEspaciosTablaRows(espacios),
    espaciosPadronExportRows: buildEspaciosPadronExportRows(espacios),
    filterSummary: buildFilterSummary(filters, raw.anioCorte),
    filterNotice: notices.length > 0 ? notices.join(" ") : null,
    hasParticipacionDatos,
  };
}

export function applyMockDashboardFilters(
  base: {
    dashboardKpis: DashboardKpi[];
    participacionGenero: ParticipacionGeneroRow[];
    participacionMaxY: number;
    tendenciaAsistencia: TendenciaAsistenciaRow[];
    tendenciaTitulo: string;
    densidadInfra: DensidadInfraRow[];
    distribucionTipologia: DistribucionTipologiaRow[];
    espaciosTablaRows: EspacioTablaRow[];
    espaciosPadronExportRows?: EspacioPadronExportRow[];
    anioCorte: number;
  },
  filters: DashboardFilterState,
): FilteredDashboardView {
  let participacionGenero = [...base.participacionGenero];
  let espaciosTablaRows = [...base.espaciosTablaRows];
  let espaciosPadronExportRows =
    (base.espaciosPadronExportRows?.length ?? 0) > 0
      ? [...base.espaciosPadronExportRows!]
      : padronExportFromTablaRows(base.espaciosTablaRows);

  if (filters.disciplina !== "Todas") {
    participacionGenero = participacionGenero.filter((r) =>
      matchesLoose(r.disciplina, filters.disciplina),
    );
    espaciosPadronExportRows = espaciosPadronExportRows.filter((r) =>
      matchesLoose(r.tipologia, filters.disciplina),
    );
  }

  if (filters.alcaldia !== "Todas") {
    espaciosTablaRows = espaciosTablaRows.filter((r) =>
      matchesLoose(r.alcaldia, filters.alcaldia),
    );
    espaciosPadronExportRows = espaciosPadronExportRows.filter((r) =>
      matchesLoose(r.alcaldia, filters.alcaldia),
    );
  }

  if (filters.genero !== "Todos") {
    participacionGenero = applyGeneroDisplayFilter(participacionGenero, filters.genero);
  }

  if (filters.edad !== "Todos") {
    participacionGenero = scaleParticipacionMockPorEdad(
      participacionGenero,
      filters.edad,
    );
  }

  const hasParticipacionDatos = participacionGenero.length > 0;

  const tendenciaInventario = buildTendenciaInventarioView(
    base.tendenciaAsistencia.map((row) => ({
      anio: Number.parseInt(row.mes, 10) || 0,
      valor: row.visitas,
    })),
    filters.alcaldia === "Todas" ? "Toda la CDMX" : filters.alcaldia,
  );

  return {
    dashboardKpis: base.dashboardKpis,
    participacionGenero,
    participacionGeneroAgregado: {
      etiquetas: ["Mujeres", "Hombres", "Otros"],
      valores: [84.9, 86.3, 97.3],
      maxY: 100,
      tieneDatos: true,
    },
    participacionMaxY: base.participacionMaxY,
    tendenciaAsistencia: base.tendenciaAsistencia,
    tendenciaTitulo: "Tendencia del inventario cultural",
    tendenciaLeyendaPrincipal: "Espacios en padrón",
    tendenciaLeyendaSecundaria: null,
    tendenciaInventario,
    participacionNse: {
      etiquetas: ["NSE bajo", "NSE medio", "NSE alto"],
      valores: [26, 45, 29],
      maxY: 52,
      tieneDatos: true,
      avisoFallbackGlobal: false,
    },
    movilidadPorModo: [
      {
        modoClave: "transporte_publico",
        modoEtiqueta: "Transporte público",
        minutosPromedio: 48.8,
      },
      {
        modoClave: "bicicleta",
        modoEtiqueta: "Bicicleta",
        minutosPromedio: 15.9,
      },
      { modoClave: "auto", modoEtiqueta: "Auto", minutosPromedio: 35 },
    ],
    metricasNegocio: {
      alcaldia: filters.alcaldia === "Todas" ? "Toda la CDMX" : filters.alcaldia,
      cobertura: 27,
      brecha: 73,
      recintos: filters.alcaldia === "Todas" ? 2918 : 777,
      esAgregadoCdmx: filters.alcaldia === "Todas",
    },
    densidadInfra: base.densidadInfra,
    distribucionTipologia: base.distribucionTipologia,
    espaciosTablaRows,
    espaciosPadronExportRows,
    filterSummary: buildFilterSummary(filters, base.anioCorte),
    filterNotice: null,
    hasParticipacionDatos,
  };
}
