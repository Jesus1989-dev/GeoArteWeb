import type { SupabaseClient } from "@supabase/supabase-js";
import type { GeoJsonFeatureCollection, ApiV1EspacioProperties } from "@/lib/domain/api-v1";
import type { Espacio } from "@/lib/domain/mapa";
import { espaciosMock } from "@/lib/data/mock/mapa";
import { fetchEspaciosCulturalesForMapa } from "@/lib/data/supabase/espacios.repository";
import { isSupabaseConfigured } from "@/lib/data/supabase/config";

function espaciosToGeoJson(
  espacios: Espacio[],
  dataSource: "supabase" | "mock",
): GeoJsonFeatureCollection<ApiV1EspacioProperties> {
  const features = espacios.map((espacio) => ({
    type: "Feature" as const,
    geometry: {
      type: "Point" as const,
      coordinates: [espacio.lng, espacio.lat] as [number, number],
    },
    properties: {
      id: espacio.id,
      nombre: espacio.nombre,
      tipo: espacio.tipo,
      direccion: espacio.direccion,
      ...(espacio.alcaldia ? { alcaldia: espacio.alcaldia } : {}),
      ...(espacio.imagenUrl ? { imagenUrl: espacio.imagenUrl } : {}),
    },
  }));

  return {
    type: "FeatureCollection",
    metadata: {
      source: "GeoArte CDMX API v1",
      dataSource,
      exportedAt: new Date().toISOString(),
      totalFeatures: features.length,
    },
    features,
  };
}

export async function fetchEspaciosGeoJsonV1(
  client: SupabaseClient | null,
): Promise<GeoJsonFeatureCollection<ApiV1EspacioProperties>> {
  if (client && isSupabaseConfigured()) {
    const espacios = await fetchEspaciosCulturalesForMapa(client);
    if (espacios.length > 0) {
      return espaciosToGeoJson(espacios, "supabase");
    }
  }

  return espaciosToGeoJson(espaciosMock, "mock");
}
