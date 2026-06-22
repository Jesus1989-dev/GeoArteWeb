import {
  alcaldiasComparador as alcaldiasComparadorMock,
  comparadorMetricas as comparadorMetricasMock,
  dashboardKpis as dashboardKpisMock,
  densidadInfra as densidadInfraMock,
  distribucionTipologia as distribucionTipologiaMock,
  espaciosTabla as espaciosTablaMock,
  filtroOpciones as filtroOpcionesMock,
  hallazgoTerritorial as hallazgoTerritorialMock,
  participacionGenero as participacionGeneroMock,
  tendenciaAsistencia as tendenciaAsistenciaMock,
} from "@/lib/data/mock/dashboard";
import type {
  ComparadorMetricaRow,
  DashboardKpi,
  DensidadInfraRow,
  DistribucionTipologiaRow,
  EspacioTablaRow,
  MetricaAlcaldiaResumen,
  ParticipacionGeneroRow,
  TendenciaAsistenciaRow,
} from "@/lib/domain/dashboard";
import type { DashboardRawSnapshot } from "@/lib/dashboard/apply-dashboard-filters";
import { isSupabaseConfigured } from "@/lib/data/supabase/config";
import { fetchDashboardFromSupabase } from "@/lib/data/supabase/dashboard.repository";
import { withTimeout } from "@/lib/utils/with-timeout";

const SUPABASE_LOAD_TIMEOUT_MS = 25_000;

export type DashboardDataSource = "supabase" | "mock";

export type DashboardPageData = {
  raw: DashboardRawSnapshot | null;
  dashboardKpis: DashboardKpi[];
  participacionGenero: ParticipacionGeneroRow[];
  participacionMaxY: number;
  tendenciaAsistencia: TendenciaAsistenciaRow[];
  tendenciaTitulo: string;
  distribucionTipologia: DistribucionTipologiaRow[];
  densidadInfra: DensidadInfraRow[];
  espaciosTablaRows: EspacioTablaRow[];
  filtroOpciones: {
    alcaldia: string[];
    disciplina: string[];
    periodo: string[];
    nivelSocioeconomico: string[];
    rangoEdad: string[];
    genero: string[];
  };
  alcaldiasComparador: string[];
  metricasPorAlcaldia: Record<string, MetricaAlcaldiaResumen>;
  comparadorMetricas: ComparadorMetricaRow[];
  hallazgoTerritorial: { brechaAccesibilidad: number };
  dataSource: DashboardDataSource;
  dataSourceNote: string;
  anioCorte: number;
  filterSummary: string;
  filterNotice: string | null;
  cuestionarioPeriodo: string | null;
  cuestionarioResumen: import("@/lib/domain/cuestionario").CuestionarioResumenAlcaldia[];
  cuestionarioTotalRespuestas: number;
};

function getDashboardMockData(): DashboardPageData {
  const anioCorte = new Date().getFullYear();
  return {
    raw: null,
    dashboardKpis: dashboardKpisMock.map((k) => ({ ...k })),
    participacionGenero: participacionGeneroMock.map((r) => ({ ...r })),
    participacionMaxY: 800,
    tendenciaAsistencia: tendenciaAsistenciaMock.map((r) => ({ ...r })),
    tendenciaTitulo: "Existencia anual del padrón (demo)",
    distribucionTipologia: distribucionTipologiaMock.map((r) => ({ ...r })),
    densidadInfra: densidadInfraMock.map((r) => ({ ...r })),
    espaciosTablaRows: espaciosTablaMock.map((r) => ({
      id: r.id,
      nombre: r.nombre,
      alcaldia: r.alcaldia,
      completitud: r.completitud,
      estado: r.estado,
      lat: r.lat,
      lng: r.lng,
    })),
    filtroOpciones: {
      alcaldia: [...filtroOpcionesMock.alcaldia],
      disciplina: [...filtroOpcionesMock.disciplina],
      periodo: [...filtroOpcionesMock.periodo],
      nivelSocioeconomico: [...filtroOpcionesMock.nivelSocioeconomico],
      rangoEdad: [...filtroOpcionesMock.rangoEdad],
      genero: [...filtroOpcionesMock.genero],
    },
    alcaldiasComparador: [...alcaldiasComparadorMock],
    metricasPorAlcaldia: {},
    comparadorMetricas: comparadorMetricasMock.map((r) => ({ ...r })),
    hallazgoTerritorial: { ...hallazgoTerritorialMock },
    dataSource: "mock",
    dataSourceNote: "Datos de demostración — configura NEXT_PUBLIC_SUPABASE_* en .env.local",
    anioCorte,
    filterSummary: `Toda la CDMX · corte ${anioCorte}`,
    filterNotice: null,
    cuestionarioPeriodo: null,
    cuestionarioResumen: [],
    cuestionarioTotalRespuestas: 0,
  };
}

/** Controlador de datos — dashboard (Supabase o mock). */
export async function getDashboardData(options?: {
  anioCorte?: number;
}): Promise<DashboardPageData> {
  if (!isSupabaseConfigured()) {
    return getDashboardMockData();
  }

  try {
    const payload = await withTimeout(
      fetchDashboardFromSupabase(options?.anioCorte),
      SUPABASE_LOAD_TIMEOUT_MS,
      "Dashboard",
    );
    return {
      ...payload,
      dataSource: "supabase",
      dataSourceNote: `Métricas SECTEI · corte ${payload.anioCorte} · ${payload.dashboardKpis[0]?.value ?? "—"} espacios`,
    };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error desconocido al cargar dashboard";
    console.error("[dashboard] Supabase:", message);
    return {
      ...getDashboardMockData(),
      dataSource: "mock",
      dataSourceNote: `Fallback demo (${message})`,
    };
  }
}

/** Datos mock síncronos (tests o storybook). */
export function getDashboardDataMock(): DashboardPageData {
  return getDashboardMockData();
}
