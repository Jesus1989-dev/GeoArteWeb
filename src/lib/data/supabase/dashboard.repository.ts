import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  ComparadorMetricaRow,
  DashboardKpi,
  DensidadInfraRow,
  DistribucionTipologiaRow,
  EspacioTablaRow,
  EstadisticaRow,
  MetricaAlcaldiaResumen,
  ParticipacionGeneroRow,
  TendenciaAsistenciaRow,
} from "@/lib/domain/dashboard";
import type { CuestionarioResumenAlcaldia } from "@/lib/domain/cuestionario";
import { PARTICIPACION_GENERO_MAX_TIPOLOGIAS } from "@/lib/domain/dashboard";
import {
  applyDashboardFilters,
  type DashboardRawSnapshot,
} from "@/lib/dashboard/apply-dashboard-filters";
import {
  mergeRangosEdadOpciones,
  segmentosEdadFromEstadisticas,
} from "@/lib/dashboard/participacion-edad";
import { getAnioCorteMetricas } from "@/lib/data/supabase/config";
import { fetchPadronEspaciosCount, resolveTotalEspaciosPadron } from "@/lib/espacios/padron-count";
import { fetchMovilidadAccesoWithClient } from "@/lib/dashboard/movilidad-acceso";
import { metricasAlcaldiaConBrechaSectei } from "@/lib/mapa/brecha-territorial";
import { getSupabaseBrowserClient } from "@/lib/data/supabase/client";
import { fetchResumenCuestionarioWithClient } from "@/lib/data/supabase/cuestionario.repository";
import { periodoSemestralActual } from "@/lib/cuestionario/cuestionario-periodo";

const MACROZONA_LABELS: Record<string, string> = {
  NORTE: "Norte",
  CENTRO: "Centro",
  SUR: "Sur",
  PONIENTE: "Poniente",
  ORIENTE: "Oriente",
};

function formatNumber(n: number): string {
  return n.toLocaleString("es-MX");
}

function formatPercent(n: number): string {
  return `${Math.round(n)}%`;
}

function tituloLower(titulo: string): string {
  return titulo.toLowerCase();
}

function isParticipacionGenero(row: EstadisticaRow): boolean {
  const c = row.categoria?.toLowerCase() ?? "";
  return c.includes("género") || c.includes("genero");
}

function valorResumen(rows: EstadisticaRow[], titulo: string, fallback = 0): number {
  const match =
    rows.find((r) => r.categoria === "Resumen" && r.titulo === titulo) ??
    rows.find((r) => r.titulo === titulo);
  return match?.valor ?? fallback;
}

function buildKpis(
  estadisticas: EstadisticaRow[],
  metricas: MetricaAlcaldiaResumen[],
  totalEspaciosPadron: number,
): DashboardKpi[] {
  const espacios = resolveTotalEspaciosPadron(totalEspaciosPadron);
  const alcaldias = valorResumen(estadisticas, "Alcaldias", 16);
  const cobertura = valorResumen(estadisticas, "Cobertura", 0);
  const brechaPromedio =
    metricas.length > 0
      ? metricas.reduce((s, m) => s + m.porcentajeBrecha, 0) / metricas.length
      : 0;

  return [
    {
      label: "Total Espacios",
      value: formatNumber(espacios),
      delta: "Padrón SECTEI",
      deltaPositive: true,
      accent: "navy",
      icon: "layers",
    },
    {
      label: "Alcaldías",
      value: formatNumber(alcaldias),
      delta: "Demarcaciones",
      deltaPositive: true,
      accent: "pink",
      icon: "users",
    },
    {
      label: "Cobertura Territorial",
      value: formatPercent(cobertura),
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

function buildParticipacionGenero(estadisticas: EstadisticaRow[]): ParticipacionGeneroRow[] {
  const rows = estadisticas.filter(
    (r) => isParticipacionGenero(r) && (r.tipo_espacio_sic?.trim() ?? "") !== "",
  );

  const byTipo = new Map<
    string,
    { hombres: number[]; mujeres: number[]; otros: number[] }
  >();

  for (const row of rows) {
    const tipo = row.tipo_espacio_sic!.trim();
    const bucket = byTipo.get(tipo) ?? { hombres: [], mujeres: [], otros: [] };
    const t = tituloLower(row.titulo);
    const v = Number(row.valor) || 0;

    if (t.includes("mujer")) bucket.mujeres.push(v);
    else if (t.includes("hombre")) bucket.hombres.push(v);
    else if (t.includes("no bin") || t.includes("binario")) bucket.otros.push(v);
    else if (t.includes("lgbt")) bucket.otros.push(v);
    else bucket.otros.push(v);

    byTipo.set(tipo, bucket);
  }

  const avg = (xs: number[]) =>
    xs.length === 0 ? 0 : xs.reduce((a, b) => a + b, 0) / xs.length;

  return [...byTipo.entries()]
    .map(([disciplina, vals]) => ({
      disciplina,
      hombres: Math.round(avg(vals.hombres)),
      mujeres: Math.round(avg(vals.mujeres)),
      otros: Math.round(avg(vals.otros)),
    }))
    .sort((a, b) => a.disciplina.localeCompare(b.disciplina, "es"))
    .slice(0, PARTICIPACION_GENERO_MAX_TIPOLOGIAS);
}

function buildDensidadInfra(
  macrozonas: Array<{ macrozona: string; porcentaje: number }>,
): DensidadInfraRow[] {
  return macrozonas.map((z) => ({
    zona: MACROZONA_LABELS[z.macrozona] ?? z.macrozona,
    valor: Math.round(z.porcentaje * 100) / 100,
  }));
}

function buildPeriodoOpciones(anios: number[]): string[] {
  return anios.map((anio) => `${anio - 1}-${anio}`);
}

function buildFiltroOpciones(input: {
  alcaldias: string[];
  disciplinas: string[];
  aniosDisponibles: number[];
  segmentosNse: string[];
  rangosEdad: string[];
}): {
  alcaldia: string[];
  disciplina: string[];
  periodo: string[];
  nivelSocioeconomico: string[];
  rangoEdad: string[];
  genero: string[];
} {
  return {
    alcaldia: ["Todas", ...input.alcaldias],
    disciplina: ["Todas", ...input.disciplinas],
    periodo: buildPeriodoOpciones(input.aniosDisponibles),
    nivelSocioeconomico: ["Todos", ...input.segmentosNse],
    rangoEdad: mergeRangosEdadOpciones(input.rangosEdad, [
      "18-29",
      "30-44",
      "45-59",
      "60+",
    ]),
    genero: ["Todos", "Mujer", "Hombre", "No binario / otro"],
  };
}

async function fetchAniosDisponibles(client: SupabaseClient): Promise<number[]> {
  const years = new Set<number>();

  const [{ data: metricas }, { data: stats }] = await Promise.all([
    client.from("metricas_alcaldia").select("anio"),
    client.from("estadisticas").select("anio"),
  ]);

  for (const row of metricas ?? []) {
    const y = Number(row.anio);
    if (Number.isFinite(y) && y >= 1990 && y <= 2100) years.add(y);
  }
  for (const row of stats ?? []) {
    const y = Number(row.anio);
    if (Number.isFinite(y) && y >= 1990 && y <= 2100) years.add(y);
  }

  const sorted = [...years].sort((a, b) => b - a);
  return sorted.length > 0 ? sorted : [getAnioCorteMetricas()];
}

function segmentosNseFromEstadisticas(rows: EstadisticaRow[]): string[] {
  const set = new Set<string>();
  for (const row of rows) {
    if (row.categoria !== "Participación NSE") continue;
    const seg = row.segmento_nse?.trim();
    if (seg) set.add(seg);
    else {
      const t = row.titulo.toLowerCase();
      if (t.includes("bajo")) set.add("Bajo");
      if (t.includes("medio")) set.add("Medio");
      if (t.includes(" alto") || t.endsWith("alto")) set.add("Alto");
    }
  }
  return [...set].sort((a, b) => a.localeCompare(b, "es"));
}

async function fetchEstadisticas(
  client: SupabaseClient,
  anio: number,
): Promise<EstadisticaRow[]> {
  const { data, error } = await client
    .from("estadisticas")
    .select(
      "id, titulo, categoria, valor, unidad, anio, alcaldia_id, disciplina_nombre, tipo_espacio_sic, segmento_nse",
    )
    .eq("anio", anio);

  if (error) throw new Error(`Supabase estadisticas: ${error.message}`);
  return (data ?? []) as EstadisticaRow[];
}

async function fetchMetricasAlcaldia(
  client: SupabaseClient,
  anio: number,
): Promise<MetricaAlcaldiaResumen[]> {
  const { data, error } = await client
    .from("metricas_alcaldia")
    .select("alcaldia_nombre, cantidad_espacios, porcentaje_cobertura, porcentaje_brecha")
    .eq("anio", anio);

  if (error) throw new Error(`Supabase metricas_alcaldia: ${error.message}`);

  return metricasAlcaldiaConBrechaSectei(data ?? []).map((row) => ({
    cantidadEspacios: row.cantidadEspacios,
    porcentajeCobertura: row.porcentajeCobertura,
    porcentajeBrecha: row.porcentajeBrecha,
    alcaldiaNombre: row.alcaldia,
  })) as Array<MetricaAlcaldiaResumen & { alcaldiaNombre: string }>;
}

async function fetchConteoAlcaldiasRpc(
  client: SupabaseClient,
): Promise<Array<{ nombre: string; total: number }>> {
  const { data, error } = await client.rpc("obtener_estadisticas_alcaldias");
  if (error) throw new Error(`Supabase RPC obtener_estadisticas_alcaldias: ${error.message}`);

  return (data ?? []).map((row: { alcaldia_nombre?: string; total_espacios?: number }) => ({
    nombre: String(row.alcaldia_nombre ?? ""),
    total: Number(row.total_espacios) || 0,
  }));
}

export async function fetchDensidadMacrozonaWithClient(
  client: SupabaseClient,
  alcaldiaFiltro?: string,
): Promise<Array<{ macrozona: string; porcentaje: number }>> {
  const params: Record<string, string> = {};
  if (alcaldiaFiltro?.trim()) {
    params.alcaldia_filtro = alcaldiaFiltro.trim();
  }

  const { data, error } = await client.rpc(
    "densidad_por_macrozona",
    Object.keys(params).length > 0 ? params : undefined,
  );
  if (error) {
    console.warn("[dashboard] densidad_por_macrozona:", error.message);
    return [];
  }

  return (data ?? []).map((row: { macrozona?: string; porcentaje?: number }) => ({
    macrozona: String(row.macrozona ?? ""),
    porcentaje: Number(row.porcentaje) || 0,
  }));
}

export async function fetchDensidadMacrozona(
  alcaldiaFiltro?: string,
): Promise<Array<{ macrozona: string; porcentaje: number }>> {
  const client = getSupabaseBrowserClient();
  if (!client) return [];
  return fetchDensidadMacrozonaWithClient(client, alcaldiaFiltro);
}

async function fetchAlcaldias(client: SupabaseClient): Promise<string[]> {
  const { data, error } = await client.from("alcaldias").select("nombre").order("nombre");
  if (error) throw new Error(`Supabase alcaldias: ${error.message}`);

  return (data ?? [])
    .map((row) => String(row.nombre ?? "").trim())
    .filter(Boolean);
}

async function fetchDisciplinasKpi(client: SupabaseClient): Promise<string[]> {
  const { data, error } = await client
    .from("disciplinas_participacion_kpi")
    .select("nombre")
    .order("orden", { ascending: true });

  if (error) {
    console.warn("[dashboard] disciplinas_participacion_kpi:", error.message);
    return [];
  }

  return (data ?? [])
    .map((row) => String(row.nombre ?? "").trim())
    .filter(Boolean);
}

async function fetchExistenciaAnual(
  client: SupabaseClient,
): Promise<Array<{ anio: number; valor: number }>> {
  const { data, error } = await client
    .from("existencia_anual")
    .select("anio, valor")
    .order("anio", { ascending: true });

  if (error) {
    console.warn("[dashboard] existencia_anual:", error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    anio: Number(row.anio) || 0,
    valor: Number(row.valor) || 0,
  }));
}

async function fetchAlcaldiaIdPorNombre(
  client: SupabaseClient,
): Promise<Record<string, string>> {
  const { data, error } = await client.from("alcaldias").select("id, nombre");
  if (error) throw new Error(`Supabase alcaldias id: ${error.message}`);

  const map: Record<string, string> = {};
  for (const row of data ?? []) {
    const id = String(row.id ?? "").trim();
    const nombre = String(row.nombre ?? "").trim();
    if (id && nombre) map[nombre] = id;
  }
  return map;
}

export async function fetchEspaciosRaw(
  client: SupabaseClient,
): Promise<DashboardRawSnapshot["espacios"]> {
  const all: DashboardRawSnapshot["espacios"] = [];
  const chunkSize = 1000;
  /** Tope de seguridad (~20k espacios); termina antes si el padrón es menor. */
  const maxChunks = 20;
  let from = 0;
  let chunkIndex = 0;

  while (chunkIndex < maxChunks) {
    chunkIndex += 1;
    const to = from + chunkSize - 1;
    const { data, error } = await client
      .from("espacios_culturales")
      .select(
        "id, nombre, alcaldia, tipo, direccion, descripcion, latitud, longitud, horario, telefono, fecha_fundacion, sic_fecha_modificacion, created_at",
      )
      .order("nombre", { ascending: true })
      .range(from, to);

    if (error) throw new Error(`Supabase espacios raw: ${error.message}`);

    const rows = data ?? [];
    if (rows.length === 0) break;

    for (const row of rows) {
      all.push({
        id: String(row.id ?? ""),
        nombre: String(row.nombre ?? "Sin nombre"),
        alcaldia: String(row.alcaldia ?? "CDMX"),
        tipo: String(row.tipo ?? "Sin clasificar"),
        direccion:
          row.direccion != null && String(row.direccion).trim() !== ""
            ? String(row.direccion).trim()
            : null,
        descripcion:
          row.descripcion != null && String(row.descripcion).trim() !== ""
            ? String(row.descripcion).trim()
            : null,
        latitud:
          row.latitud != null && Number.isFinite(Number(row.latitud))
            ? Number(row.latitud)
            : null,
        longitud:
          row.longitud != null && Number.isFinite(Number(row.longitud))
            ? Number(row.longitud)
            : null,
        horario: row.horario != null ? String(row.horario) : null,
        telefono: row.telefono != null ? String(row.telefono) : null,
        fecha_fundacion:
          row.fecha_fundacion != null ? String(row.fecha_fundacion) : null,
        sic_fecha_modificacion:
          row.sic_fecha_modificacion != null
            ? String(row.sic_fecha_modificacion)
            : null,
        created_at: row.created_at != null ? String(row.created_at) : null,
      });
    }

    if (rows.length < chunkSize) break;
    from += chunkSize;
  }

  return all;
}

export type DashboardSupabasePayload = {
  anioCorte: number;
  raw: DashboardRawSnapshot;
  dashboardKpis: DashboardKpi[];
  participacionGenero: ParticipacionGeneroRow[];
  participacionMaxY: number;
  tendenciaAsistencia: TendenciaAsistenciaRow[];
  tendenciaTitulo: string;
  densidadInfra: DensidadInfraRow[];
  distribucionTipologia: DistribucionTipologiaRow[];
  espaciosTablaRows: EspacioTablaRow[];
  filtroOpciones: ReturnType<typeof buildFiltroOpciones>;
  alcaldiasComparador: string[];
  metricasPorAlcaldia: Record<string, MetricaAlcaldiaResumen>;
  comparadorMetricas: ComparadorMetricaRow[];
  hallazgoTerritorial: { brechaAccesibilidad: number };
  filterSummary: string;
  filterNotice: string | null;
  cuestionarioPeriodo: string | null;
  cuestionarioResumen: CuestionarioResumenAlcaldia[];
  cuestionarioTotalRespuestas: number;
};

export function buildComparadorMetricas(
  metricas: Record<string, MetricaAlcaldiaResumen>,
  alcaldiaA: string,
  alcaldiaB: string,
): ComparadorMetricaRow[] {
  const a = metricas[alcaldiaA];
  const b = metricas[alcaldiaB];
  if (!a || !b) return [];

  return [
    { label: "Espacios culturales", a: a.cantidadEspacios, b: b.cantidadEspacios },
    { label: "Cobertura (%)", a: a.porcentajeCobertura, b: b.porcentajeCobertura },
    { label: "Brecha territorial (%)", a: a.porcentajeBrecha, b: b.porcentajeBrecha },
  ];
}

export function buildHallazgoTerritorial(
  metricas: Record<string, MetricaAlcaldiaResumen>,
  alcaldiaA: string,
  alcaldiaB: string,
): { brechaAccesibilidad: number } {
  const a = metricas[alcaldiaA]?.porcentajeBrecha ?? 0;
  const b = metricas[alcaldiaB]?.porcentajeBrecha ?? 0;
  return { brechaAccesibilidad: Math.round(Math.abs(a - b)) };
}

export type FetchDashboardOptions = {
  anioCorteOverride?: number;
  /** Si es false, omite el padrón completo (carga diferida en cliente). */
  includeEspacios?: boolean;
};

export async function fetchDashboardWithClient(
  client: SupabaseClient,
  options?: FetchDashboardOptions | number,
): Promise<DashboardSupabasePayload> {
  const resolved: FetchDashboardOptions =
    typeof options === "number" ? { anioCorteOverride: options } : (options ?? {});
  const includeEspacios = resolved.includeEspacios !== false;

  const defaultAnio = getAnioCorteMetricas();
  const anioCorte =
    resolved.anioCorteOverride != null && Number.isFinite(resolved.anioCorteOverride)
      ? resolved.anioCorteOverride
      : defaultAnio;

  const [
    aniosDisponibles,
    estadisticas,
    metricasRaw,
    conteoRpc,
    densidad,
    alcaldias,
    disciplinas,
    existencia,
    espacios,
    alcaldiaIdPorNombre,
    totalEspaciosPadron,
    movilidadAcceso,
  ] = await Promise.all([
    fetchAniosDisponibles(client),
    fetchEstadisticas(client, anioCorte),
    fetchMetricasAlcaldia(client, anioCorte),
    fetchConteoAlcaldiasRpc(client),
    fetchDensidadMacrozonaWithClient(client),
    fetchAlcaldias(client),
    fetchDisciplinasKpi(client),
    fetchExistenciaAnual(client),
    includeEspacios ? fetchEspaciosRaw(client) : Promise.resolve([]),
    fetchAlcaldiaIdPorNombre(client),
    fetchPadronEspaciosCount(client),
    fetchMovilidadAccesoWithClient(client),
  ]);

  const totalEspaciosRpc = conteoRpc.reduce((s, c) => s + c.total, 0);

  const conteoPorAlcaldia: Record<string, number> = {};
  for (const c of conteoRpc) {
    if (c.nombre) conteoPorAlcaldia[c.nombre] = c.total;
  }

  const metricasPorAlcaldia: Record<string, MetricaAlcaldiaResumen> = {};
  for (const m of metricasRaw as Array<
    MetricaAlcaldiaResumen & { alcaldiaNombre: string }
  >) {
    if (m.alcaldiaNombre) metricasPorAlcaldia[m.alcaldiaNombre] = m;
  }

  const alcaldiasComparador =
    alcaldias.length > 0
      ? alcaldias
      : Object.keys(metricasPorAlcaldia).sort((a, b) => a.localeCompare(b, "es"));

  const borA = alcaldiasComparador[0] ?? "Iztapalapa";
  const borB = alcaldiasComparador[1] ?? alcaldiasComparador[0] ?? "Benito Juárez";

  const raw: DashboardRawSnapshot = {
    anioCorte,
    estadisticas,
    metricasPorAlcaldia,
    conteoPorAlcaldia,
    totalEspaciosRpc,
    totalEspaciosPadron,
    densidadCiudad: densidad,
    espacios,
    existenciaAnual: existencia,
    movilidadAcceso,
    alcaldiaIdPorNombre,
    alcaldias,
    disciplinas,
    segmentosNse: segmentosNseFromEstadisticas(estadisticas),
  };

  const defaultFilters = {
    alcaldia: "Todas",
    disciplina: "Todas",
    periodo: `${anioCorte - 1}-${anioCorte}`,
    nse: "Todos",
    edad: "Todos",
    genero: "Todos",
  };

  const filtered = applyDashboardFilters(raw, defaultFilters, densidad);

  let cuestionarioResumen: CuestionarioResumenAlcaldia[] = [];
  const cuestionarioPeriodo = periodoSemestralActual();
  try {
    cuestionarioResumen = await fetchResumenCuestionarioWithClient(
      client,
      cuestionarioPeriodo,
    );
  } catch (err) {
    console.warn("[dashboard] cuestionario:", err);
  }
  const cuestionarioTotalRespuestas = cuestionarioResumen.reduce(
    (s, r) => s + r.respuestasCapturadas,
    0,
  );

  return {
    anioCorte,
    raw,
    dashboardKpis: filtered.dashboardKpis,
    participacionGenero: filtered.participacionGenero,
    participacionMaxY: filtered.participacionMaxY,
    tendenciaAsistencia: filtered.tendenciaAsistencia,
    tendenciaTitulo: filtered.tendenciaTitulo,
    densidadInfra: filtered.densidadInfra,
    distribucionTipologia: filtered.distribucionTipologia,
    espaciosTablaRows: filtered.espaciosTablaRows,
    filterSummary: filtered.filterSummary,
    filterNotice: filtered.filterNotice,
    filtroOpciones: buildFiltroOpciones({
      alcaldias,
      disciplinas,
      aniosDisponibles,
      segmentosNse: raw.segmentosNse,
      rangosEdad: segmentosEdadFromEstadisticas(estadisticas),
    }),
    alcaldiasComparador,
    metricasPorAlcaldia,
    comparadorMetricas: buildComparadorMetricas(metricasPorAlcaldia, borA, borB),
    hallazgoTerritorial: buildHallazgoTerritorial(metricasPorAlcaldia, borA, borB),
    cuestionarioPeriodo,
    cuestionarioResumen,
    cuestionarioTotalRespuestas,
  };
}

export async function fetchDashboardFromSupabase(
  options?: FetchDashboardOptions | number,
): Promise<DashboardSupabasePayload> {
  const client = getSupabaseBrowserClient();
  if (!client) {
    throw new Error("Cliente Supabase del navegador no disponible");
  }
  return fetchDashboardWithClient(client, options);
}

/** Solo opciones de filtro y año de corte (p. ej. página Reportes, sin cargar espacios). */
export async function fetchReportesFiltroContextFromSupabase(): Promise<{
  filtroOpciones: ReturnType<typeof buildFiltroOpciones>;
  anioCorte: number;
}> {
  const client = getSupabaseBrowserClient();
  if (!client) {
    throw new Error("Cliente Supabase del navegador no disponible");
  }

  const anioCorte = getAnioCorteMetricas();
  const [aniosDisponibles, alcaldias, disciplinas, estadisticas] = await Promise.all([
    fetchAniosDisponibles(client),
    fetchAlcaldias(client),
    fetchDisciplinasKpi(client),
    fetchEstadisticas(client, anioCorte),
  ]);

  return {
    anioCorte,
    filtroOpciones: buildFiltroOpciones({
      alcaldias,
      disciplinas,
      aniosDisponibles,
      segmentosNse: segmentosNseFromEstadisticas(estadisticas),
      rangosEdad: segmentosEdadFromEstadisticas(estadisticas),
    }),
  };
}
