import type { SupabaseClient } from "@supabase/supabase-js";
import type { ApiV1AlcaldiaStats } from "@/lib/domain/api-v1";
import { CDMX_ALCALDIAS } from "@/lib/data/supabase/search.repository";
import { normalizeSearchText } from "@/lib/mapa/search-utils";
import { alcaldiaToSlug, resolveAlcaldiaFromApiId } from "@/lib/api-v1/alcaldia-id";
import { metricasAlcaldiaConBrechaSectei } from "@/lib/mapa/brecha-territorial";
import { isSupabaseConfigured } from "@/lib/data/supabase/config";

function buildMockStats(alcaldia: string): ApiV1AlcaldiaStats {
  const counts = new Map<string, number>();
  for (const alc of CDMX_ALCALDIAS) {
    counts.set(alc, Math.max(1, alc.length % 40 + 10));
  }
  const metricas = metricasAlcaldiaConBrechaSectei(
    [...counts.entries()].map(([nombre, cantidad_espacios]) => ({
      alcaldia_nombre: nombre,
      cantidad_espacios,
    })),
  );
  const row =
    metricas.find(
      (item) => normalizeSearchText(item.alcaldia) === normalizeSearchText(alcaldia),
    ) ?? metricas[0];

  return {
    id: alcaldiaToSlug(row.alcaldia),
    alcaldia: row.alcaldia,
    cantidadEspacios: row.cantidadEspacios,
    porcentajeCobertura: row.porcentajeCobertura,
    porcentajeBrecha: row.porcentajeBrecha,
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
      const metricas = metricasAlcaldiaConBrechaSectei(data);
      const row = metricas.find(
        (item) => normalizeSearchText(item.alcaldia) === normalizeSearchText(alcaldia),
      );

      if (row) {
        return {
          stats: {
            id: alcaldiaToSlug(row.alcaldia),
            alcaldia: row.alcaldia,
            cantidadEspacios: row.cantidadEspacios,
            porcentajeCobertura: row.porcentajeCobertura,
            porcentajeBrecha: row.porcentajeBrecha,
            dataSource: "supabase",
          },
        };
      }
    }
  }

  return { stats: buildMockStats(alcaldia) };
}
