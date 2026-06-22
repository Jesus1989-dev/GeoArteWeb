import {
  espaciosMock,
  mapaCapasPanelMeta,
  mapaCapasPresets,
  mapaCapasSecciones,
  tipoColors,
} from "@/lib/data/mock/mapa";
import { fetchMapaTerritorialDataServer } from "@/lib/data/supabase/mapa.repository.server";
import { createSupabasePublicClient } from "@/lib/data/supabase/server-public";
import { fetchEspaciosCulturalesForMapa } from "@/lib/data/supabase/espacios.repository";
import { fetchRecursosCualitativosActivosFromSupabase } from "@/lib/data/supabase/investigacion.repository";
import { getMockRecursosCualitativos } from "@/lib/data/mock/investigacion";
import { isSupabaseConfigured } from "@/lib/data/supabase/config";
import { withTimeout } from "@/lib/utils/with-timeout";
import type { MapaPageData } from "@/lib/services/mapa.service";

const SUPABASE_LOAD_TIMEOUT_MS = 25_000;

function getMapaUiConfig() {
  return {
    tipoColors,
    mapaCapasPresets,
    mapaCapasPanelMeta,
    mapaCapasSecciones,
  };
}

/** Mapa en Server Components / precarga de ruta. */
export async function getMapaDataServer(): Promise<MapaPageData> {
  const ui = getMapaUiConfig();

  if (!isSupabaseConfigured()) {
    const espacios = [...espaciosMock];
    const territorial = await fetchMapaTerritorialDataServer(espacios);
    return {
      ...ui,
      espacios,
      recursosCualitativos: getMockRecursosCualitativos(),
      territorial,
      dataSource: "mock",
      dataSourceNote:
        "Datos de demostración — configura NEXT_PUBLIC_SUPABASE_* en .env.local",
    };
  }

  try {
    const client = createSupabasePublicClient();
    const [espacios, recursosCualitativos] = await withTimeout(
      Promise.all([
        fetchEspaciosCulturalesForMapa(client),
        fetchRecursosCualitativosActivosFromSupabase(),
      ]),
      SUPABASE_LOAD_TIMEOUT_MS,
      "Mapa",
    );

    if (espacios.length === 0) {
      const demo = [...espaciosMock];
      const territorial = await fetchMapaTerritorialDataServer(demo);
      return {
        ...ui,
        espacios: demo,
        recursosCualitativos: getMockRecursosCualitativos(),
        territorial,
        dataSource: "mock",
        dataSourceNote:
          "Sin coordenadas en Supabase — mostrando demo hasta completar la carga",
      };
    }

    const territorial = await fetchMapaTerritorialDataServer(espacios);
    const recursosConCoords = recursosCualitativos.filter(
      (r) =>
        r.lat != null &&
        r.lng != null &&
        Number.isFinite(r.lat) &&
        Number.isFinite(r.lng),
    ).length;

    return {
      ...ui,
      espacios,
      recursosCualitativos,
      territorial,
      dataSource: "supabase",
      dataSourceNote: `${espacios.length.toLocaleString("es-MX")} espacios · ${recursosConCoords} recursos cualitativos georreferenciados`,
    };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error desconocido al cargar espacios";
    console.error("[mapa] Supabase (server):", message);
    const demo = [...espaciosMock];
    const territorial = await fetchMapaTerritorialDataServer(demo);
    return {
      ...ui,
      espacios: demo,
      recursosCualitativos: getMockRecursosCualitativos(),
      territorial,
      dataSource: "mock",
      dataSourceNote: `Fallback demo (${message})`,
    };
  }
}
