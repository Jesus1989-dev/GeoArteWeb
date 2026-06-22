import type { SupabaseClient } from "@supabase/supabase-js";
import type { TerritorialDataSource } from "@/lib/domain/mapa-territorial";
import type { TerritorioGeometrias } from "@/lib/domain/territorio-geometrias";
import { emptyTerritorioGeometrias } from "@/lib/domain/territorio-geometrias";
import { getSupabaseBrowserClient } from "@/lib/data/supabase/client";
import { parseTerritorioFeatureCollection } from "@/lib/mapa/territorio-geojson";

export async function fetchTerritorioGeoJsonWithClient(
  client: SupabaseClient,
  tipo: "alcaldia" | "macrozona",
): Promise<ReturnType<typeof parseTerritorioFeatureCollection>> {
  const { data, error } = await client.rpc("territorio_geojson", { p_tipo: tipo });

  if (error) {
    console.warn(`[mapa] territorio_geojson(${tipo}):`, error.message);
    return { type: "FeatureCollection", features: [] };
  }

  return parseTerritorioFeatureCollection(data);
}

function withSource(
  geometrias: TerritorioGeometrias,
  source: TerritorialDataSource,
): TerritorioGeometrias {
  return { ...geometrias, source };
}

export async function fetchGeometriasWithClient(
  client: SupabaseClient,
): Promise<TerritorioGeometrias> {
  const [alcaldias, macrozonas] = await Promise.all([
    fetchTerritorioGeoJsonWithClient(client, "alcaldia"),
    fetchTerritorioGeoJsonWithClient(client, "macrozona"),
  ]);

  if (alcaldias.features.length === 0 && macrozonas.features.length === 0) {
    return emptyTerritorioGeometrias();
  }

  return {
    alcaldias,
    macrozonas,
    source: "supabase",
  };
}

export async function fetchTerritorioGeometriasBrowser(): Promise<TerritorioGeometrias> {
  const client = getSupabaseBrowserClient();
  if (!client) {
    return emptyTerritorioGeometrias();
  }

  return fetchGeometriasWithClient(client);
}

/** Respaldo para el cliente cuando Supabase no tiene geometrías cargadas. */
export async function fetchTerritorioGeometriasApiFallback(): Promise<TerritorioGeometrias> {
  const response = await fetch("/api/data/mapa/geometrias", { cache: "no-store" });
  if (!response.ok) {
    return emptyTerritorioGeometrias();
  }

  const body = (await response.json()) as TerritorioGeometrias;
  return {
    alcaldias: parseTerritorioFeatureCollection(body.alcaldias),
    macrozonas: parseTerritorioFeatureCollection(body.macrozonas),
    source: body.source ?? "fallback",
  };
}
