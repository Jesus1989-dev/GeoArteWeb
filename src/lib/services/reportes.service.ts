import {
  historialReportes,
  reportesAyuda,
  reportesKpis,
} from "@/lib/data/mock/reportes";
import { filtroOpciones as dashboardFiltroMock } from "@/lib/data/mock/dashboard";
import { isSupabaseConfigured } from "@/lib/data/supabase/config";
import {
  fetchReportePlantillasFromSupabase,
  fetchReportesCentroAyudaFromSupabase,
  REPORTES_AYUDA_FALLBACK,
} from "@/lib/data/supabase/plantillas-reporte.repository";
import {
  buildReportesKpisFromStats,
  fetchReportesExportStats,
} from "@/lib/data/supabase/reportes.repository";
import { fetchReportesFiltroContextFromSupabase } from "@/lib/data/supabase/dashboard.repository";
import { withTimeout } from "@/lib/utils/with-timeout";
import type {
  ReporteAyuda,
  ReporteHistorialRow,
  ReporteKpi,
  ReportePlantilla,
  ReportesFiltroOpciones,
} from "@/lib/domain/reportes";
import {
  REPORTE_PLANTILLAS_FALLBACK,
  toReportePlantillaUi,
} from "@/lib/reportes/plantillas-reporte";

const SUPABASE_LOAD_TIMEOUT_MS = 20_000;
const FILTROS_LOAD_TIMEOUT_MS = 12_000;

function mockFiltroContext(): {
  filtroOpciones: ReportesFiltroOpciones;
  anioCorte: number;
} {
  return {
    filtroOpciones: {
      alcaldia: [...dashboardFiltroMock.alcaldia],
      disciplina: [...dashboardFiltroMock.disciplina],
      periodo: [...dashboardFiltroMock.periodo],
      nivelSocioeconomico: [...dashboardFiltroMock.nivelSocioeconomico],
      rangoEdad: [...dashboardFiltroMock.rangoEdad],
      genero: [...dashboardFiltroMock.genero],
    },
    anioCorte: new Date().getFullYear(),
  };
}

async function loadFiltroContext(): Promise<{
  filtroOpciones: ReportesFiltroOpciones;
  anioCorte: number;
}> {
  if (!isSupabaseConfigured()) {
    return mockFiltroContext();
  }

  try {
    return await withTimeout(
      fetchReportesFiltroContextFromSupabase(),
      FILTROS_LOAD_TIMEOUT_MS,
      "Filtros reportes",
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al cargar filtros";
    console.warn("[reportes] filtros:", message);
    return mockFiltroContext();
  }
}

async function fetchHistorialReportesEnriched(input: {
  autor?: string;
}): Promise<ReporteHistorialRow[]> {
  const params = new URLSearchParams();
  if (input.autor?.trim()) {
    params.set("autor", input.autor.trim());
  }
  const query = params.toString();
  const res = await fetch(
    query ? `/api/reportes/historial?${query}` : "/api/reportes/historial",
    {
      cache: "no-store",
      credentials: "include",
    },
  );
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? "No se pudo cargar el historial");
  }
  return (await res.json()) as ReporteHistorialRow[];
}

export type ReportesDataSource = "supabase" | "mock";

export type ReportesPageData = {
  reportesKpis: ReporteKpi[];
  historialReportes: ReporteHistorialRow[];
  plantillasReporte: ReportePlantilla[];
  reportesAyuda: ReporteAyuda;
  filtroOpciones: ReportesFiltroOpciones;
  anioCorte: number;
  dataSource: ReportesDataSource;
  dataSourceNote: string;
  canGenerateRemote: boolean;
};

function mapPlantillasFallback(): ReportePlantilla[] {
  return REPORTE_PLANTILLAS_FALLBACK.map(toReportePlantillaUi);
}

async function loadPlantillasAndAyuda(): Promise<{
  plantillasReporte: ReportePlantilla[];
  reportesAyuda: ReporteAyuda;
}> {
  if (!isSupabaseConfigured()) {
    return {
      plantillasReporte: mapPlantillasFallback(),
      reportesAyuda: { ...reportesAyuda, enlaceHref: "/contacto" },
    };
  }

  const [plantillas, ayuda] = await Promise.all([
    fetchReportePlantillasFromSupabase(),
    fetchReportesCentroAyudaFromSupabase(),
  ]);

  return {
    plantillasReporte: plantillas.map(toReportePlantillaUi),
    reportesAyuda: ayuda,
  };
}

function getReportesMockData(
  plantillasReporte: ReportePlantilla[],
  ayuda: ReporteAyuda,
): ReportesPageData {
  return {
    reportesKpis: reportesKpis.map((k) => ({ ...k })),
    historialReportes: historialReportes.map((r) => ({
      ...r,
      formato: r.estado === "Publicado" ? "PDF" : "—",
      canDownload: false,
      downloadUrl: null,
    })),
    plantillasReporte,
    reportesAyuda: ayuda,
    filtroOpciones: {
      alcaldia: [...dashboardFiltroMock.alcaldia],
      disciplina: [...dashboardFiltroMock.disciplina],
      periodo: [...dashboardFiltroMock.periodo],
      nivelSocioeconomico: [...dashboardFiltroMock.nivelSocioeconomico],
      rangoEdad: [...dashboardFiltroMock.rangoEdad],
      genero: [...dashboardFiltroMock.genero],
    },
    anioCorte: new Date().getFullYear(),
    dataSource: "mock",
    dataSourceNote: "Datos de demostración — generación local sin historial persistente",
    canGenerateRemote: false,
  };
}

/** Controlador de datos — reportes (Supabase o mock). */
export async function getReportesPageData(input?: {
  userId?: string;
  autor?: string;
}): Promise<ReportesPageData> {
  const [filtroCtx, catalog] = await Promise.all([
    loadFiltroContext(),
    loadPlantillasAndAyuda().catch(() => ({
      plantillasReporte: mapPlantillasFallback(),
      reportesAyuda: REPORTES_AYUDA_FALLBACK,
    })),
  ]);

  const { filtroOpciones, anioCorte } = filtroCtx;

  if (!isSupabaseConfigured() || !input?.userId) {
    return {
      ...getReportesMockData(catalog.plantillasReporte, catalog.reportesAyuda),
      filtroOpciones,
      anioCorte,
    };
  }

  try {
    const autor = input.autor?.trim() || "Mi cuenta";
    const [stats, historialReportes] = await withTimeout(
      Promise.all([
        fetchReportesExportStats(input.userId),
        fetchHistorialReportesEnriched({ autor }),
      ]),
      SUPABASE_LOAD_TIMEOUT_MS,
      "Reportes",
    );

    return {
      reportesKpis: buildReportesKpisFromStats(stats),
      historialReportes,
      plantillasReporte: catalog.plantillasReporte,
      reportesAyuda: catalog.reportesAyuda,
      filtroOpciones,
      anioCorte,
      dataSource: "supabase",
      dataSourceNote: `${stats.total.toLocaleString("es-MX")} exportaciones · ${catalog.plantillasReporte.length} plantillas · PDF ${stats.pdf} · Excel ${stats.xlsx}`,
      canGenerateRemote: true,
    };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error desconocido al cargar reportes";
    console.error("[reportes] Supabase:", message);
    return {
      ...getReportesMockData(catalog.plantillasReporte, catalog.reportesAyuda),
      filtroOpciones,
      anioCorte,
      dataSource: "mock",
      dataSourceNote: `Fallback demo (${message})`,
    };
  }
}

export function getReportesPageDataMock(): ReportesPageData {
  return getReportesMockData(mapPlantillasFallback(), {
    ...reportesAyuda,
    enlaceHref: "/contacto",
  });
}
