import {
  espaciosMock,
  mapaCapasPanelMeta,
  mapaCapasPresets,
  mapaCapasSecciones,
  tipoColors,
} from "@/lib/data/mock/mapa";
import { fetchMapaTerritorialDataServer } from "@/lib/data/supabase/mapa.repository.server";
import { isSupabaseConfigured } from "@/lib/data/supabase/config";
import { fetchEspaciosCulturalesForMapa } from "@/lib/data/supabase/espacios.repository";
import { fetchRecursosCualitativosActivosFromSupabase } from "@/lib/data/supabase/investigacion.repository";
import { getMockRecursosCualitativos } from "@/lib/data/mock/investigacion";
import type { RecursoCualitativo } from "@/lib/domain/investigacion";
import type { MapaTerritorialData } from "@/lib/domain/mapa-territorial";
import { withTimeout } from "@/lib/utils/with-timeout";

const SUPABASE_LOAD_TIMEOUT_MS = 25_000;
import type { Espacio } from "@/lib/domain/mapa";

export type MapaDataSource = "supabase" | "mock";

export type MapaPageData = {
  espacios: Espacio[];
  recursosCualitativos: RecursoCualitativo[];
  territorial: MapaTerritorialData;
  tipoColors: typeof tipoColors;
  mapaCapasPresets: typeof mapaCapasPresets;
  mapaCapasPanelMeta: typeof mapaCapasPanelMeta;
  mapaCapasSecciones: typeof mapaCapasSecciones;
  dataSource: MapaDataSource;
  /** Mensaje breve para la UI (conteo o aviso). */
  dataSourceNote: string;
};

function getMapaUiConfig() {
  return {
    tipoColors,
    mapaCapasPresets,
    mapaCapasPanelMeta,
    mapaCapasSecciones,
  };
}

/** Configuración estática del mapa (capas UI, presets, colores). */
export function getMapaUiData(): Omit<
  MapaPageData,
  "espacios" | "recursosCualitativos" | "territorial" | "dataSource" | "dataSourceNote"
> {
  return getMapaUiConfig();
}

/**
 * Controlador de datos — mapa.
 * Lee Supabase si hay `.env.local`; si no, usa mock de demostración.
 */
export async function getMapaData(): Promise<MapaPageData> {
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
    const [espacios, recursosCualitativos] = await withTimeout(
      Promise.all([
        fetchEspaciosCulturalesForMapa(),
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
    console.error("[mapa] Supabase:", message);
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

/** Datos mock síncronos (tests o storybook). */
export async function getMapaDataMock(): Promise<MapaPageData> {
  const espacios = [...espaciosMock];
  const territorial = await fetchMapaTerritorialDataServer(espacios);
  return {
    ...getMapaUiConfig(),
    espacios,
    recursosCualitativos: getMockRecursosCualitativos(),
    territorial,
    dataSource: "mock",
    dataSourceNote: "Datos de demostración",
  };
}
