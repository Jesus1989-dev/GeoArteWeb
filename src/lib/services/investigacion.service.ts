import { getMockRecursosCualitativos } from "@/lib/data/mock/investigacion";
import { CDMX_ALCALDIAS } from "@/lib/data/supabase/search.repository";
import { isSupabaseConfigured } from "@/lib/data/supabase/config";
import {
  fetchAlcaldiasOpcionesFromSupabase,
  fetchInvestigacionKpisFromSupabase,
  fetchRecursosCualitativosPageFromSupabase,
  fetchRecursoCualitativoByIdFromSupabase,
} from "@/lib/data/supabase/investigacion.repository";
import type {
  InvestigacionListQuery,
  InvestigacionPageData,
  RecursoCualitativo,
} from "@/lib/domain/investigacion";
import { buildInvestigacionKpis } from "@/lib/investigacion/assemble-investigacion-page";
import {
  buildInvestigacionAlcaldiasFiltroOpciones,
  extractAlcaldiasOpciones,
  filterRecursosMock,
  INVESTIGACION_DEFAULT_PAGE_SIZE,
  paginateRecursos,
  toRecursoListItem,
} from "@/lib/investigacion/investigacion-query";
import { withTimeout } from "@/lib/utils/with-timeout";

const SUPABASE_LOAD_TIMEOUT_MS = 25_000;

function getInvestigacionMockData(query: InvestigacionListQuery): InvestigacionPageData {
  const all = getMockRecursosCualitativos();
  const filtered = filterRecursosMock(all, query);
  const paged = paginateRecursos(filtered, query.page, query.pageSize);

  return {
    investigacionKpis: buildInvestigacionKpis(all),
    recursosCualitativos: paged.items.map(toRecursoListItem),
    alcaldiasOpciones: buildInvestigacionAlcaldiasFiltroOpciones(
      CDMX_ALCALDIAS,
      extractAlcaldiasOpciones(all),
    ),
    pagination: {
      ...paged.pagination,
      totalCatalogo: all.length,
    },
    dataSource: "mock",
    dataSourceNote:
      "Datos de demostración — configura NEXT_PUBLIC_SUPABASE_* y aplica la migración recursos_cualitativos",
  };
}

function defaultListQuery(
  query?: Partial<InvestigacionListQuery>,
): InvestigacionListQuery {
  return {
    q: query?.q?.trim() ?? "",
    tipo: query?.tipo ?? "todos",
    alcaldia: query?.alcaldia ?? "todas",
    page: query?.page && query.page > 0 ? query.page : 1,
    pageSize:
      query?.pageSize && query.pageSize > 0
        ? query.pageSize
        : INVESTIGACION_DEFAULT_PAGE_SIZE,
  };
}

/** Controlador de datos — investigación (Supabase o mock). */
export async function getInvestigacionPageData(
  queryInput?: Partial<InvestigacionListQuery>,
): Promise<InvestigacionPageData> {
  const query = defaultListQuery(queryInput);

  if (!isSupabaseConfigured()) {
    return getInvestigacionMockData(query);
  }

  try {
    const [investigacionKpis, alcaldiasOpciones, pagePayload] = await withTimeout(
      Promise.all([
        fetchInvestigacionKpisFromSupabase(),
        fetchAlcaldiasOpcionesFromSupabase(),
        fetchRecursosCualitativosPageFromSupabase(query),
      ]),
      SUPABASE_LOAD_TIMEOUT_MS,
      "Investigación",
    );

    return {
      investigacionKpis,
      recursosCualitativos: pagePayload.recursosCualitativos,
      alcaldiasOpciones,
      pagination: pagePayload.pagination,
      dataSource: "supabase",
      dataSourceNote: "Repositorio cualitativo GEO ARTE CDMX",
    };
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : "Error desconocido al cargar investigación";
    console.error("[investigacion] Supabase:", message);
    return {
      ...getInvestigacionMockData(query),
      dataSource: "mock",
      dataSourceNote: `Fallback demo (${message})`,
    };
  }
}

export async function getRecursoCualitativoById(id: string): Promise<RecursoCualitativo | null> {
  const trimmed = id.trim();
  if (!trimmed) return null;

  if (!isSupabaseConfigured()) {
    return getMockRecursosCualitativos().find((recurso) => recurso.id === trimmed) ?? null;
  }

  try {
    return await withTimeout(
      fetchRecursoCualitativoByIdFromSupabase(trimmed),
      SUPABASE_LOAD_TIMEOUT_MS,
      "Investigación detalle",
    );
  } catch (err) {
    console.error("[investigacion] detalle:", err);
    return getMockRecursosCualitativos().find((recurso) => recurso.id === trimmed) ?? null;
  }
}

/** Datos mock síncronos (tests). */
export function getInvestigacionPageDataMock(
  queryInput?: Partial<InvestigacionListQuery>,
): InvestigacionPageData {
  return getInvestigacionMockData(defaultListQuery(queryInput));
}
