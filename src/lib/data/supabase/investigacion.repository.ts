import type { SupabaseClient } from "@supabase/supabase-js";
import { buildInvestigacionKpis } from "@/lib/investigacion/assemble-investigacion-page";
import { CDMX_ALCALDIAS } from "@/lib/data/supabase/search.repository";
import {
  buildInvestigacionAlcaldiasFiltroOpciones,
  escapeIlikePattern,
  extractAlcaldiasOpciones,
  tipoRecursoDbFromQuery,
  toRecursoListItem,
} from "@/lib/investigacion/investigacion-query";
import { parseTranscripcion, tipoRecursoFromDb } from "@/lib/investigacion/tipo-recurso";
import type {
  InvestigacionListQuery,
  InvestigacionPagination,
  RecursoCualitativo,
  RecursoCualitativoListItem,
} from "@/lib/domain/investigacion";
import { createSupabasePublicClient } from "@/lib/data/supabase/server-public";
import { createSupabaseServerClient } from "@/lib/data/supabase/server";

const LIST_SELECT =
  "id, tipo, fecha, titulo, alcaldia, snippet, verificado, digitalizado, lat, lng, orden";

const DETAIL_SELECT =
  "id, tipo, fecha, titulo, alcaldia, snippet, verificado, digitalizado, investigador, fecha_detalle, resumen, transcripcion, lat, lng, orden, activo";

type RecursoDbRow = {
  id: string;
  tipo: string;
  fecha: string;
  titulo: string;
  alcaldia: string;
  snippet: string;
  verificado: boolean;
  digitalizado: boolean;
  investigador: string;
  fecha_detalle: string;
  resumen: string;
  transcripcion: unknown;
  lat: number | null;
  lng: number | null;
  orden: number;
  activo: boolean;
};

function mapRow(row: RecursoDbRow): RecursoCualitativo | null {
  const tipo = tipoRecursoFromDb(row.tipo);
  if (!tipo) return null;

  const lat = row.lat != null ? Number(row.lat) : null;
  const lng = row.lng != null ? Number(row.lng) : null;

  return {
    id: row.id,
    tipo,
    fecha: row.fecha,
    titulo: row.titulo,
    alcaldia: row.alcaldia,
    snippet: row.snippet,
    verificado: Boolean(row.verificado),
    digitalizado: Boolean(row.digitalizado),
    investigador: row.investigador,
    fechaDetalle: row.fecha_detalle,
    resumen: row.resumen,
    transcripcion: parseTranscripcion(row.transcripcion),
    lat: Number.isFinite(lat) ? lat : null,
    lng: Number.isFinite(lng) ? lng : null,
  };
}

function mapListRow(row: RecursoDbRow): RecursoCualitativoListItem | null {
  const full = mapRow(row);
  return full ? toRecursoListItem(full) : null;
}

function applyListFilters(
  query: InvestigacionListQuery,
): { tipo?: string; alcaldia?: string; orFilter?: string } {
  const filters: { tipo?: string; alcaldia?: string; orFilter?: string } = {};

  const tipoDb = tipoRecursoDbFromQuery(query.tipo);
  if (tipoDb) filters.tipo = tipoDb;

  if (query.alcaldia !== "todas") {
    filters.alcaldia = query.alcaldia;
  }

  const q = query.q.trim();
  if (q) {
    const term = escapeIlikePattern(q);
    filters.orFilter = `titulo.ilike.%${term}%,snippet.ilike.%${term}%,alcaldia.ilike.%${term}%,investigador.ilike.%${term}%`;
  }

  return filters;
}

async function fetchRecursosActivos(
  client: SupabaseClient,
): Promise<RecursoCualitativo[]> {
  const { data, error } = await client
    .from("recursos_cualitativos")
    .select(DETAIL_SELECT)
    .eq("activo", true)
    .order("orden", { ascending: true })
    .order("id", { ascending: true });

  if (error) throw new Error(`Supabase recursos_cualitativos: ${error.message}`);

  return ((data ?? []) as RecursoDbRow[])
    .map(mapRow)
    .filter((r): r is RecursoCualitativo => r != null);
}

export async function fetchRecursosCualitativosActivosFromSupabase(): Promise<
  RecursoCualitativo[]
> {
  const client = createSupabasePublicClient();
  return fetchRecursosActivos(client);
}

export async function fetchInvestigacionKpisFromSupabase() {
  const client = await createSupabaseServerClient();
  const { data, error } = await client
    .from("recursos_cualitativos")
    .select("digitalizado, alcaldia")
    .eq("activo", true);

  if (error) throw new Error(`Supabase recursos_cualitativos KPIs: ${error.message}`);

  return buildInvestigacionKpis(
    (data ?? []) as Array<{ digitalizado: boolean; alcaldia: string }>,
  );
}

async function fetchAlcaldiasCatalogo(client: SupabaseClient): Promise<string[]> {
  const { data, error } = await client.from("alcaldias").select("nombre").order("nombre");
  if (error) throw new Error(`Supabase alcaldias: ${error.message}`);

  const nombres = (data ?? [])
    .map((row) => String(row.nombre ?? "").trim())
    .filter(Boolean);

  return nombres.length > 0 ? nombres : [...CDMX_ALCALDIAS];
}

export async function fetchAlcaldiasOpcionesFromSupabase(): Promise<string[]> {
  const client = await createSupabaseServerClient();
  const [catalogo, recursosRes] = await Promise.all([
    fetchAlcaldiasCatalogo(client),
    client.from("recursos_cualitativos").select("alcaldia").eq("activo", true),
  ]);

  if (recursosRes.error) {
    throw new Error(`Supabase recursos_cualitativos alcaldías: ${recursosRes.error.message}`);
  }

  const alcaldiasEnRecursos = ((recursosRes.data ?? []) as Array<{ alcaldia: string }>).map(
    (row) => row.alcaldia,
  );

  return buildInvestigacionAlcaldiasFiltroOpciones(catalogo, alcaldiasEnRecursos);
}

export async function fetchRecursosCualitativosPageFromSupabase(
  query: InvestigacionListQuery,
): Promise<{
  recursosCualitativos: RecursoCualitativoListItem[];
  pagination: InvestigacionPagination;
}> {
  const client = await createSupabaseServerClient();
  const page = query.page > 0 ? query.page : 1;
  const pageSize = query.pageSize > 0 ? query.pageSize : 10;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const filters = applyListFilters(query);
  let listQuery = client
    .from("recursos_cualitativos")
    .select(LIST_SELECT, { count: "exact" })
    .eq("activo", true);

  if (filters.tipo) listQuery = listQuery.eq("tipo", filters.tipo);
  if (filters.alcaldia) listQuery = listQuery.eq("alcaldia", filters.alcaldia);
  if (filters.orFilter) listQuery = listQuery.or(filters.orFilter);

  const { data, error, count } = await listQuery
    .order("orden", { ascending: true })
    .order("id", { ascending: true })
    .range(from, to);

  if (error) {
    throw new Error(`Supabase recursos_cualitativos listado: ${error.message}`);
  }

  const { count: totalCatalogo, error: countError } = await client
    .from("recursos_cualitativos")
    .select("id", { count: "exact", head: true })
    .eq("activo", true);

  if (countError) {
    throw new Error(`Supabase recursos_cualitativos conteo: ${countError.message}`);
  }

  const total = count ?? 0;
  const totalPages = total > 0 ? Math.ceil(total / pageSize) : 0;

  return {
    recursosCualitativos: ((data ?? []) as RecursoDbRow[])
      .map(mapListRow)
      .filter((r): r is RecursoCualitativoListItem => r != null),
    pagination: {
      page: totalPages > 0 ? Math.min(page, totalPages) : 1,
      pageSize,
      total,
      totalPages,
      totalCatalogo: totalCatalogo ?? 0,
    },
  };
}

export async function fetchRecursoCualitativoByIdFromSupabase(
  id: string,
): Promise<RecursoCualitativo | null> {
  const client = await createSupabaseServerClient();
  const { data, error } = await client
    .from("recursos_cualitativos")
    .select(DETAIL_SELECT)
    .eq("id", id)
    .eq("activo", true)
    .maybeSingle();

  if (error) {
    throw new Error(`Supabase recursos_cualitativos detalle: ${error.message}`);
  }

  if (!data) return null;
  return mapRow(data as RecursoDbRow);
}

export type InvestigacionSupabasePayload = {
  investigacionKpis: ReturnType<typeof buildInvestigacionKpis>;
  recursosCualitativos: RecursoCualitativo[];
};

/** @deprecated Usar fetchRecursosCualitativosPageFromSupabase para la UI pública. */
export async function fetchInvestigacionFromSupabase(): Promise<InvestigacionSupabasePayload> {
  const recursosCualitativos = await fetchRecursosCualitativosActivosFromSupabase();

  return {
    recursosCualitativos,
    investigacionKpis: buildInvestigacionKpis(recursosCualitativos),
  };
}

export { extractAlcaldiasOpciones };
