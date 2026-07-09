import {
  brechaAlcaldias,
  growthData,
  homeStats,
  quickAccess,
  spatialExplorerPreview,
  busquedaAlcaldias,
} from "@/lib/data/mock/home";
import type {
  BrechaAlcaldia,
  GrowthDataPoint,
  HomeStatItem,
  QuickAccessItem,
  SpatialExplorerPreviewData,
} from "@/lib/domain/home";
import { isSupabaseConfigured } from "@/lib/data/supabase/config";
import { fetchHomeFromSupabase } from "@/lib/data/supabase/home.repository";
import { withTimeout } from "@/lib/utils/with-timeout";
import type { HomeKpiPorAlcaldia } from "@/lib/home/home-kpi-stats";

const SUPABASE_LOAD_TIMEOUT_MS = 25_000;

export type HomeDataSource = "supabase" | "mock";

export type HomePageData = {
  homeStats: HomeStatItem[];
  kpiPorAlcaldia: HomeKpiPorAlcaldia[];
  quickAccess: QuickAccessItem[];
  growthData: GrowthDataPoint[];
  brechaAlcaldias: BrechaAlcaldia[];
  spatialExplorer: SpatialExplorerPreviewData;
  busquedaAlcaldias: string[];
  monitoreoActualizadoEl: string | null;
  dataSource: HomeDataSource;
  dataSourceNote: string;
};

function cloneSpatialExplorer(data: SpatialExplorerPreviewData): SpatialExplorerPreviewData {
  return {
    totalGeoref: data.totalGeoref,
    subtitle: data.subtitle,
    legend: data.legend.map((item) => ({ ...item })),
    pins: data.pins.map((pin) => ({ ...pin })),
  };
}

function buildMockKpiPorAlcaldia(): HomeKpiPorAlcaldia[] {
  const periodo = homeStats.find((s) => s.iconKey === "calendar")?.value ?? "2023-2";
  const totalGlobal = Number(homeStats[0]?.value.replace(/,/g, "") || 2485);
  const porAlcaldia = brechaAlcaldias.reduce(
    (sum, row) => sum + row.espacios,
    0,
  );
  const restante = Math.max(0, totalGlobal - porAlcaldia);
  const otras = busquedaAlcaldias.filter(
    (a) => !brechaAlcaldias.some((b) => b.alcaldia === a),
  );
  const basePorOtra =
    otras.length > 0 ? Math.floor(restante / otras.length) : 0;

  return busquedaAlcaldias.map((alcaldia) => {
    const brecha = brechaAlcaldias.find((b) => b.alcaldia === alcaldia);
    const espacios = brecha?.espacios ?? basePorOtra;
    const cobertura = brecha
      ? Math.max(55, 100 - brecha.brecha).toFixed(1)
      : "78.4";

    return {
      alcaldia,
      stats: [
        {
          iconKey: "building",
          value: espacios.toLocaleString("es-MX"),
          label: "Total Espacios",
          description: `Infraestructura en ${alcaldia}`,
        },
        {
          iconKey: "map",
          value: "1 / 16",
          label: "Alcaldías",
          description: alcaldia,
        },
        {
          iconKey: "layers",
          value: `${cobertura}%`,
          label: "Cobertura",
          description: "Índice de accesibilidad en la demarcación",
        },
        {
          iconKey: "calendar",
          value: periodo,
          label: "Periodo",
          description: "Última actualización de datos",
        },
      ],
    };
  });
}

function getHomeMockData(note?: string): HomePageData {
  return {
    homeStats: homeStats.map((stat) => ({ ...stat })),
    kpiPorAlcaldia: buildMockKpiPorAlcaldia(),
    quickAccess: quickAccess.map((item) => ({ ...item })),
    growthData: growthData.map((point) => ({ ...point })),
    brechaAlcaldias: brechaAlcaldias.map((row) => ({ ...row })),
    spatialExplorer: cloneSpatialExplorer(spatialExplorerPreview),
    busquedaAlcaldias: [...busquedaAlcaldias],
    monitoreoActualizadoEl: null,
    dataSource: "mock",
    dataSourceNote:
      note ??
      "Datos de demostración — configura NEXT_PUBLIC_SUPABASE_* en .env.local",
  };
}

/** Controlador de datos — inicio (Supabase o mock). */
export async function getHomePageData(): Promise<HomePageData> {
  if (!isSupabaseConfigured()) {
    return getHomeMockData();
  }

  try {
    const payload = await withTimeout(
      fetchHomeFromSupabase(),
      SUPABASE_LOAD_TIMEOUT_MS,
      "Home",
    );

    return {
      homeStats: payload.homeStats,
      kpiPorAlcaldia: payload.kpiPorAlcaldia,
      quickAccess: quickAccess.map((item) => ({ ...item })),
      growthData: payload.growthData,
      brechaAlcaldias: payload.brechaAlcaldias,
      monitoreoActualizadoEl: payload.monitoreoActualizadoEl,
      spatialExplorer:
        payload.spatialExplorer.pins.length > 0
          ? payload.spatialExplorer
          : cloneSpatialExplorer(spatialExplorerPreview),
      busquedaAlcaldias:
        payload.busquedaAlcaldias.length > 0
          ? payload.busquedaAlcaldias
          : [...busquedaAlcaldias],
      dataSource: "supabase",
      dataSourceNote: payload.monitoreoActualizadoEl
        ? `Crecimiento: existencia_anual · Brecha: padrón SECTEI (móvil) · actualizado ${payload.monitoreoActualizadoEl}`
        : `Crecimiento: existencia_anual · Brecha: padrón SECTEI (móvil)`,
    };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error desconocido al cargar inicio";
    console.error("[home] Supabase:", message);
    throw new Error(message);
  }
}

/** Datos mock síncronos (tests o storybook). */
export function getHomePageDataMock(): HomePageData {
  return getHomeMockData();
}
