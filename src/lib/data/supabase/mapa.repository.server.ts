import type { Espacio } from "@/lib/domain/mapa";
import { isSupabaseConfigured } from "@/lib/data/supabase/config";
import { fetchDensidadMacrozonaWithClient } from "@/lib/data/supabase/dashboard.repository";
import { fetchTerritorioGeometriasServer } from "@/lib/data/supabase/mapa-geometrias.repository.server";
import { fetchTransporteCapaServer } from "@/lib/data/supabase/mapa-transporte.repository.server";
import {
  buildMockTerritorialData,
  composeTerritorialData,
  fetchMetricasAlcaldiaWithClient,
} from "@/lib/data/supabase/mapa.repository";
import { createSupabasePublicClient } from "@/lib/data/supabase/server-public";

/** Variante servidor (getMapaData). */
export async function fetchMapaTerritorialDataServer(espacios: Espacio[]) {
  if (!isSupabaseConfigured()) {
    const mock = buildMockTerritorialData(espacios);
    const [geometrias, transporte] = await Promise.all([
      fetchTerritorioGeometriasServer(),
      fetchTransporteCapaServer(),
    ]);
    return {
      ...mock,
      geometrias,
      transporte,
      sources: {
        ...mock.sources,
        geometrias: geometrias.source,
        transporte: transporte.source,
      },
    };
  }

  try {
    const client = createSupabasePublicClient();
    const [metricas, densidadMacrozonas, geometrias, transporte] = await Promise.all([
      fetchMetricasAlcaldiaWithClient(client),
      fetchDensidadMacrozonaWithClient(client),
      fetchTerritorioGeometriasServer(),
      fetchTransporteCapaServer(),
    ]);

    if (
      metricas.length === 0 &&
      densidadMacrozonas.length === 0 &&
      geometrias.alcaldias.features.length === 0 &&
      transporte.lineas.features.length === 0
    ) {
      return buildMockTerritorialData(espacios);
    }

    return composeTerritorialData(
      espacios,
      metricas,
      densidadMacrozonas,
      geometrias,
      transporte,
      "supabase",
      "supabase",
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Supabase no disponible";
    console.warn("[mapa] territorial server:", message);
    const mock = buildMockTerritorialData(espacios);
    const [geometrias, transporte] = await Promise.all([
      fetchTerritorioGeometriasServer(),
      fetchTransporteCapaServer(),
    ]);
    return {
      ...mock,
      geometrias,
      transporte,
      sources: {
        ...mock.sources,
        geometrias: geometrias.source,
        transporte: transporte.source,
      },
    };
  }
}
