import type {
  InvestigacionListQuery,
  InvestigacionPagination,
  RecursoCualitativo,
  RecursoCualitativoListItem,
  TipoRecurso,
} from "@/lib/domain/investigacion";
import { tipoRecursoToDb } from "@/lib/investigacion/tipo-recurso";

export const INVESTIGACION_DEFAULT_PAGE_SIZE = 15;
export const INVESTIGACION_MAX_PAGE_SIZE = 50;

const TODOS_TIPOS = "todos" as const;
const TODAS_ALCALDIAS = "todas" as const;

export function escapeIlikePattern(value: string): string {
  return value.replace(/[%_\\]/g, "\\$&");
}

export function parseInvestigacionListQuery(
  searchParams: URLSearchParams,
): InvestigacionListQuery {
  const q = searchParams.get("q")?.trim() ?? "";
  const tipoRaw = searchParams.get("tipo")?.trim() ?? TODOS_TIPOS;
  const alcaldiaRaw = searchParams.get("alcaldia")?.trim() ?? TODAS_ALCALDIAS;
  const pageRaw = Number.parseInt(searchParams.get("page") ?? "1", 10);
  const pageSizeRaw = Number.parseInt(
    searchParams.get("pageSize") ?? String(INVESTIGACION_DEFAULT_PAGE_SIZE),
    10,
  );

  const tipo: InvestigacionListQuery["tipo"] =
    tipoRaw === "Entrevista" ||
    tipoRaw === "Encuesta" ||
    tipoRaw === "Grupo focal"
      ? tipoRaw
      : TODOS_TIPOS;

  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;
  const pageSize =
    Number.isFinite(pageSizeRaw) && pageSizeRaw > 0
      ? Math.min(pageSizeRaw, INVESTIGACION_MAX_PAGE_SIZE)
      : INVESTIGACION_DEFAULT_PAGE_SIZE;

  return {
    q,
    tipo,
    alcaldia: alcaldiaRaw.length > 0 ? alcaldiaRaw : TODAS_ALCALDIAS,
    page,
    pageSize,
  };
}

export function buildInvestigacionListSearchParams(
  query: InvestigacionListQuery,
): URLSearchParams {
  const params = new URLSearchParams();
  if (query.q.trim()) params.set("q", query.q.trim());
  if (query.tipo !== TODOS_TIPOS) params.set("tipo", query.tipo);
  if (query.alcaldia !== TODAS_ALCALDIAS) params.set("alcaldia", query.alcaldia);
  params.set("page", String(query.page));
  params.set("pageSize", String(query.pageSize));
  return params;
}

export function buildInvestigacionListUrl(query: InvestigacionListQuery): string {
  const qs = buildInvestigacionListSearchParams(query).toString();
  return qs ? `/api/data/investigacion?${qs}` : "/api/data/investigacion";
}

export function toRecursoListItem(
  recurso: RecursoCualitativo,
): RecursoCualitativoListItem {
  return {
    id: recurso.id,
    tipo: recurso.tipo,
    fecha: recurso.fecha,
    titulo: recurso.titulo,
    alcaldia: recurso.alcaldia,
    snippet: recurso.snippet,
    verificado: recurso.verificado,
    digitalizado: recurso.digitalizado,
    lat: recurso.lat,
    lng: recurso.lng,
  };
}

function matchesQuery(recurso: RecursoCualitativo, q: string): boolean {
  if (!q) return true;
  const haystack = [
    recurso.titulo,
    recurso.snippet,
    recurso.alcaldia,
    recurso.investigador,
    recurso.tipo,
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(q.toLowerCase());
}

export function filterRecursosMock(
  recursos: RecursoCualitativo[],
  query: InvestigacionListQuery,
): RecursoCualitativo[] {
  return recursos.filter((recurso) => {
    if (query.tipo !== TODOS_TIPOS && recurso.tipo !== query.tipo) return false;
    if (query.alcaldia !== TODAS_ALCALDIAS && recurso.alcaldia !== query.alcaldia) {
      return false;
    }
    return matchesQuery(recurso, query.q.trim());
  });
}

export function paginateRecursos<T>(
  items: T[],
  page: number,
  pageSize: number,
): { items: T[]; pagination: InvestigacionPagination } {
  const total = items.length;
  const totalPages = total > 0 ? Math.ceil(total / pageSize) : 0;
  const safePage = totalPages > 0 ? Math.min(page, totalPages) : 1;
  const start = (safePage - 1) * pageSize;

  return {
    items: items.slice(start, start + pageSize),
    pagination: {
      page: safePage,
      pageSize,
      total,
      totalPages,
      totalCatalogo: total,
    },
  };
}

export function extractAlcaldiasOpciones(recursos: RecursoCualitativo[]): string[] {
  return Array.from(
    new Set(recursos.map((recurso) => recurso.alcaldia.trim()).filter(Boolean)),
  ).sort((a, b) => a.localeCompare(b, "es"));
}

/** Catálogo completo para el filtro + valores especiales presentes en recursos (p. ej. «Varias»). */
export function buildInvestigacionAlcaldiasFiltroOpciones(
  catalogo: readonly string[],
  alcaldiasEnRecursos: string[] = [],
): string[] {
  const catalogoOrdenado = catalogo.map((a) => a.trim()).filter(Boolean);
  const catalogSet = new Set(catalogoOrdenado);
  const extras = Array.from(
    new Set(
      alcaldiasEnRecursos
        .map((a) => a.trim())
        .filter((a) => a.length > 0 && !catalogSet.has(a)),
    ),
  ).sort((a, b) => a.localeCompare(b, "es"));

  return [...catalogoOrdenado, ...extras];
}

export function tipoRecursoDbFromQuery(
  tipo: InvestigacionListQuery["tipo"],
): ReturnType<typeof tipoRecursoToDb> | null {
  if (tipo === TODOS_TIPOS) return null;
  return tipoRecursoToDb(tipo as TipoRecurso);
}
