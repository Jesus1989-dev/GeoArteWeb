import type { SupabaseClient } from "@supabase/supabase-js";
import type { ApiV1SearchResponse } from "@/lib/domain/api-v1";
import { espaciosMock } from "@/lib/data/mock/mapa";
import { searchEspaciosCulturales, searchEspaciosCulturalesWithClient } from "@/lib/data/supabase/search.repository";
import { alcaldiaToSlug } from "@/lib/api-v1/alcaldia-id";
import { isSupabaseConfigured } from "@/lib/data/supabase/config";

export async function fetchSearchV1(
  client: SupabaseClient | null,
  query: string,
): Promise<ApiV1SearchResponse> {
  const trimmed = query.trim();
  if (trimmed.length < 2) {
    return { query: trimmed, total: 0, results: [], dataSource: "mock" };
  }

  const internal =
    client && isSupabaseConfigured()
      ? await searchEspaciosCulturalesWithClient(client, trimmed)
      : await searchEspaciosCulturales(trimmed);

  const results = internal.suggestions.map((item) => {
    if (item.kind === "alcaldia") {
      return {
        type: "alcaldia" as const,
        id: alcaldiaToSlug(item.label),
        nombre: item.label,
      };
    }

    const mock = espaciosMock.find((e) => e.id === item.espacioId);
    return {
      type: "espacio" as const,
      id: item.espacioId ?? item.id,
      nombre: item.label,
      alcaldia: item.subtitle,
      direccion: mock?.direccion,
    };
  });

  return {
    query: trimmed,
    total: results.length,
    results,
    dataSource: internal.dataSource,
  };
}
