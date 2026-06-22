import type { SupabaseClient } from "@supabase/supabase-js";
import type { ApiV1AlcaldiaStats } from "@/lib/domain/api-v1";
import { CDMX_ALCALDIAS } from "@/lib/data/supabase/search.repository";
import { espaciosMock } from "@/lib/data/mock/mapa";
import { computeAlcaldiaCentroids } from "@/lib/mapa/alcaldia-centroids";
import { normalizeSearchText } from "@/lib/mapa/search-utils";
import { alcaldiaToSlug, resolveAlcaldiaFromApiId } from "@/lib/api-v1/alcaldia-id";
import { isSupabaseConfigured } from "@/lib/data/supabase/config";

function buildMockStats(alcaldia: string): ApiV1AlcaldiaStats {
  const centroids = computeAlcaldiaCentroids(espaciosMock);
  const count = espaciosMock.filter(
    (e) => e.direccion.toLowerCase().includes(alcaldia.toLowerCase().slice(0, 6)),
  ).length || 1;
  const maxCount = Math.max(1, ...centroids.map((_, i) => i + 1));
  const ratio = count / maxCount;

  return {
    id: alcaldiaToSlug(alcaldia),
    alcaldia,
    cantidadEspacios: count,
    porcentajeCobertura: Math.round(ratio * 85),
    porcentajeBrecha: Math.round((1 - ratio) * 70),
    dataSource: "mock",
  };
}

export async function fetchAlcaldiaStatsV1(
  client: SupabaseClient | null,
  alcaldiaId: string,
): Promise<{ stats?: ApiV1AlcaldiaStats; error?: string }> {
  const alcaldia = resolveAlcaldiaFromApiId(alcaldiaId, [...CDMX_ALCALDIAS]);
  if (!alcaldia) {
    return { error: "Alcaldía no encontrada" };
  }

  if (client && isSupabaseConfigured()) {
    const { data, error } = await client
      .from("metricas_alcaldia")
      .select("alcaldia_nombre, cantidad_espacios, porcentaje_cobertura, porcentaje_brecha");

    if (!error && data) {
      const row = data.find(
        (item) =>
          normalizeSearchText(String(item.alcaldia_nombre ?? "")) ===
          normalizeSearchText(alcaldia),
      );

      if (row) {
        return {
          stats: {
            id: alcaldiaToSlug(String(row.alcaldia_nombre ?? alcaldia)),
            alcaldia: String(row.alcaldia_nombre ?? alcaldia),
            cantidadEspacios: Number(row.cantidad_espacios) || 0,
            porcentajeCobertura: Number(row.porcentaje_cobertura) || 0,
            porcentajeBrecha: Number(row.porcentaje_brecha) || 0,
            dataSource: "supabase",
          },
        };
      }
    }
  }

  return { stats: buildMockStats(alcaldia) };
}
