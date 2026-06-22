import type {
  BrechaAlcaldia,
  GrowthDataPoint,
  HomeStatItem,
  SpatialExplorerPreviewData,
} from "@/lib/domain/home";
import { getAnioCorteMetricas } from "@/lib/data/supabase/config";
import { createSupabasePublicClient } from "@/lib/data/supabase/server-public";
import { fetchEspaciosInfraRows } from "@/lib/data/supabase/home-espacios-metrics.repository";
import { fetchEspaciosSpatialPreviewForHome } from "@/lib/data/supabase/espacios.repository";
import {
  buildBrechaAlcaldiasFromMetricas,
  formatMonitoreoActualizado,
  resolveUltimaActualizacionEspacios,
} from "@/lib/home/infrastructure-from-espacios";
import { resolveGrowthDataForHome } from "@/lib/dashboard/existencia-anual";
import {
  buildSpatialExplorerPreviewData,
  emptySpatialExplorerPreviewData,
} from "@/lib/home/spatial-preview";
import {
  buildHomeKpiPorAlcaldia,
  buildHomeStats,
  type HomeKpiPorAlcaldia,
} from "@/lib/home/home-kpi-stats";

export type HomeSupabasePayload = {
  homeStats: HomeStatItem[];
  kpiPorAlcaldia: HomeKpiPorAlcaldia[];
  growthData: GrowthDataPoint[];
  brechaAlcaldias: BrechaAlcaldia[];
  spatialExplorer: SpatialExplorerPreviewData;
  busquedaAlcaldias: string[];
  monitoreoActualizadoEl: string | null;
};

export async function fetchHomeFromSupabase(): Promise<HomeSupabasePayload> {
  const anioCorte = getAnioCorteMetricas();
  const client = createSupabasePublicClient();

  const [conteoRes, metricasRes, alcaldiasRes, estadisticasRes, existenciaRes, espaciosInfraRes, spatialPreviewRes] =
    await Promise.all([
      client.rpc("obtener_estadisticas_alcaldias"),
      client
        .from("metricas_alcaldia")
        .select("alcaldia_nombre, cantidad_espacios, porcentaje_cobertura, porcentaje_brecha")
        .eq("anio", anioCorte),
      client.from("alcaldias").select("nombre").order("nombre"),
      client
        .from("estadisticas")
        .select("titulo, categoria, valor")
        .eq("anio", anioCorte),
      client.from("existencia_anual").select("anio, valor").order("anio", { ascending: true }),
      fetchEspaciosInfraRows(client),
      fetchEspaciosSpatialPreviewForHome(client),
    ]);

  if (conteoRes.error) {
    throw new Error(`Supabase RPC obtener_estadisticas_alcaldias: ${conteoRes.error.message}`);
  }
  if (metricasRes.error) {
    throw new Error(`Supabase metricas_alcaldia: ${metricasRes.error.message}`);
  }
  if (alcaldiasRes.error) {
    throw new Error(`Supabase alcaldias: ${alcaldiasRes.error.message}`);
  }
  if (estadisticasRes.error) {
    throw new Error(`Supabase estadisticas: ${estadisticasRes.error.message}`);
  }
  if (existenciaRes.error) {
    throw new Error(`Supabase existencia_anual: ${existenciaRes.error.message}`);
  }

  const conteo = (conteoRes.data ?? []).map(
    (row: { alcaldia_nombre?: string; total_espacios?: number }) => ({
      nombre: String(row.alcaldia_nombre ?? "").trim(),
      total: Number(row.total_espacios) || 0,
    }),
  );

  const alcaldias = (alcaldiasRes.data ?? [])
    .map((row) => String(row.nombre ?? "").trim())
    .filter(Boolean);
  const totalAlcaldias = alcaldias.length > 0 ? alcaldias.length : 16;
  const estadisticas = (estadisticasRes.data ?? []) as Array<{
    titulo?: string;
    categoria?: string;
    valor?: number;
  }>;
  const metricas = metricasRes.data ?? [];
  const { totalGeoref, espacios: espaciosPreview } = spatialPreviewRes;
  const ultimaActualizacion = resolveUltimaActualizacionEspacios(espaciosInfraRes);

  const statsInput = {
    estadisticas,
    conteo,
    metricas,
    totalAlcaldias,
    anioCorte,
  };

  const totalEspaciosRpc = conteo.reduce(
    (sum: number, row: { total: number }) => sum + row.total,
    0,
  );
  const totalEspaciosKpi =
    estadisticas.find(
      (row) => row.categoria === "Resumen" && row.titulo === "Espacios Totales",
    )?.valor ??
    estadisticas.find((row) => row.titulo === "Espacios Totales")?.valor ??
    totalEspaciosRpc;

  return {
    homeStats: buildHomeStats(statsInput),
    kpiPorAlcaldia: buildHomeKpiPorAlcaldia({
      ...statsInput,
      alcaldias:
        alcaldias.length > 0
          ? alcaldias
          : conteo.map((row: { nombre: string }) => row.nombre).filter(Boolean),
    }),
    growthData: resolveGrowthDataForHome({
      existenciaGlobal: existenciaRes.data ?? [],
      espacios: espaciosInfraRes,
      anioCorte,
      totalEspacios: totalEspaciosKpi,
    }),
    brechaAlcaldias: buildBrechaAlcaldiasFromMetricas(metricas, espaciosInfraRes),
    monitoreoActualizadoEl: formatMonitoreoActualizado(ultimaActualizacion),
    spatialExplorer:
      espaciosPreview.length > 0
        ? buildSpatialExplorerPreviewData({
            espacios: espaciosPreview,
            totalGeoref,
          })
        : emptySpatialExplorerPreviewData(),
    busquedaAlcaldias: alcaldias,
  };
}

/** @deprecated Usar `fetchHomeFromSupabase`. */
export async function fetchHomeStatsFromSupabase(): Promise<HomeStatItem[]> {
  const payload = await fetchHomeFromSupabase();
  return payload.homeStats;
}
