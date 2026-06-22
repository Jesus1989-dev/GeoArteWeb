import { isSupabaseConfigured } from "@/lib/data/supabase/config";
import { fetchGeometriasWithClient } from "@/lib/data/supabase/mapa-geometrias.repository";
import { createSupabasePublicClient } from "@/lib/data/supabase/server-public";
import type { TerritorialDataSource } from "@/lib/domain/mapa-territorial";
import type { TerritorioGeometrias } from "@/lib/domain/territorio-geometrias";
import { loadFallbackTerritorioGeometrias } from "@/lib/mapa/territorio-geometrias-fallback.server";

function withSource(
  geometrias: TerritorioGeometrias,
  source: TerritorialDataSource,
): TerritorioGeometrias {
  return { ...geometrias, source };
}

export async function fetchTerritorioGeometriasServer(): Promise<TerritorioGeometrias> {
  if (!isSupabaseConfigured()) {
    return withSource(loadFallbackTerritorioGeometrias(), "fallback");
  }

  try {
    const client = createSupabasePublicClient();
    const result = await fetchGeometriasWithClient(client);

    if (result.alcaldias.features.length > 0 && result.macrozonas.features.length > 0) {
      return result;
    }

    const fallback = loadFallbackTerritorioGeometrias();
    return {
      alcaldias:
        result.alcaldias.features.length > 0 ? result.alcaldias : fallback.alcaldias,
      macrozonas:
        result.macrozonas.features.length > 0 ? result.macrozonas : fallback.macrozonas,
      source:
        result.alcaldias.features.length > 0 || result.macrozonas.features.length > 0
          ? "supabase"
          : "fallback",
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Supabase no disponible";
    console.warn("[mapa] geometrias server:", message);
    return withSource(loadFallbackTerritorioGeometrias(), "fallback");
  }
}
