import type { InvestigacionListQuery, RecursoCualitativo } from "@/lib/domain/investigacion";
import { buildInvestigacionListUrl } from "@/lib/investigacion/investigacion-query";
import { fetchPageData } from "@/lib/api/fetch-page-data";
import type { InvestigacionPageData } from "@/lib/domain/investigacion";

export async function fetchInvestigacionList(
  query: InvestigacionListQuery,
): Promise<InvestigacionPageData> {
  return fetchPageData<InvestigacionPageData>(buildInvestigacionListUrl(query));
}

export async function fetchInvestigacionRecursoDetalle(
  id: string,
): Promise<RecursoCualitativo> {
  const res = await fetch(
    `/api/data/investigacion/recurso?id=${encodeURIComponent(id)}`,
    { cache: "no-store" },
  );
  const body = (await res.json()) as RecursoCualitativo & { error?: string };
  if (!res.ok) {
    throw new Error(body.error ?? `Error HTTP ${res.status}`);
  }
  return body;
}
