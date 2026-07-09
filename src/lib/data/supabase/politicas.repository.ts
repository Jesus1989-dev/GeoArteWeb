import type { SupabaseClient } from "@supabase/supabase-js";
import type { MetricaAlcaldiaResumen } from "@/lib/domain/dashboard";
import type { EstadisticaRow } from "@/lib/domain/dashboard";
import { getAnioCorteMetricas } from "@/lib/data/supabase/config";
import { fetchPadronEspaciosCount, resolveTotalEspaciosPadron } from "@/lib/espacios/padron-count";
import { metricasAlcaldiaConBrechaSectei } from "@/lib/mapa/brecha-territorial";
import { fetchPoliticasCentroConfigFromSupabase } from "@/lib/data/supabase/admin-politicas-config-server";
import { createSupabasePublicClient } from "@/lib/data/supabase/server-public";
import {
  brechaInversionAlcaldias as brechaMock,
  evidenciaDiagnosticoContenido as evidenciaMock,
  recomendacionesPorObjetivo as recomendacionesMock,
} from "@/lib/data/mock/politicas";
import {
  buildBrechaInversionChart,
  buildEvidenciaDiagnostico,
  buildPoliticasHeroStats,
  groupRecomendaciones,
  mergeMetricasConCatalogoAlcaldias,
  type PoliticasRecomendacionRow,
} from "@/lib/politicas/assemble-politicas-page";
import {
  getDefaultPoliticasCentroConfigRaw,
  resolvePoliticasCentroConfig,
} from "@/lib/politicas/politicas-config";
import type {
  BrechaInversionAlcaldiaRow,
  EvidenciaDiagnosticoContenido,
  FiltroObjetivo,
  PoliticasCta,
  PoliticasHero,
  PoliticasHeroStat,
  SeccionRecomendaciones,
} from "@/lib/domain/politicas";

export type PoliticasSupabasePayload = {
  politicasHero: PoliticasHero;
  politicasHeroStats: PoliticasHeroStat[];
  evidenciaDiagnosticoContenido: EvidenciaDiagnosticoContenido;
  brechaInversionAlcaldias: BrechaInversionAlcaldiaRow[];
  filtrosObjetivo: FiltroObjetivo[];
  recomendacionesPorObjetivo: SeccionRecomendaciones[];
  politicasCta: PoliticasCta;
  anioCorte: number;
};

async function fetchEstadisticas(
  client: SupabaseClient,
  anio: number,
): Promise<EstadisticaRow[]> {
  const { data, error } = await client
    .from("estadisticas")
    .select(
      "id, titulo, categoria, valor, unidad, anio, alcaldia_id, disciplina_nombre, tipo_espacio_sic, segmento_nse",
    )
    .eq("anio", anio);

  if (error) throw new Error(`Supabase estadisticas: ${error.message}`);
  return (data ?? []) as EstadisticaRow[];
}

async function fetchMetricasAlcaldia(
  client: SupabaseClient,
  anio: number,
): Promise<Array<MetricaAlcaldiaResumen & { alcaldiaNombre: string }>> {
  const { data, error } = await client
    .from("metricas_alcaldia")
    .select("alcaldia_nombre, cantidad_espacios, porcentaje_cobertura, porcentaje_brecha")
    .eq("anio", anio);

  if (error) throw new Error(`Supabase metricas_alcaldia: ${error.message}`);

  return metricasAlcaldiaConBrechaSectei(data ?? []).map((row) => ({
    cantidadEspacios: row.cantidadEspacios,
    porcentajeCobertura: row.porcentajeCobertura,
    porcentajeBrecha: row.porcentajeBrecha,
    alcaldiaNombre: row.alcaldia,
  }));
}

async function fetchAlcaldiasCatalogo(client: SupabaseClient): Promise<string[]> {
  const { data, error } = await client.from("alcaldias").select("nombre").order("nombre");
  if (error) {
    console.warn("[politicas] alcaldias:", error.message);
    return [];
  }
  return (data ?? [])
    .map((row) => String(row.nombre ?? "").trim())
    .filter(Boolean);
}

async function fetchRecomendaciones(
  client: SupabaseClient,
): Promise<PoliticasRecomendacionRow[]> {
  const { data, error } = await client
    .from("politicas_recomendaciones")
    .select(
      "id, objetivo_id, titulo, prioridad, costo_nivel, alcaldia, descripcion, impacto, impacto_ciudadanos, presupuesto_mxn, orden",
    )
    .eq("activo", true)
    .order("objetivo_id")
    .order("orden", { ascending: true });

  if (error) {
    console.warn("[politicas] politicas_recomendaciones:", error.message);
    return [];
  }

  return (data ?? []) as PoliticasRecomendacionRow[];
}

function valorResumen(estadisticas: EstadisticaRow[], titulo: string, fallback: number): number {
  const match =
    estadisticas.find((r) => r.categoria === "Resumen" && r.titulo === titulo) ??
    estadisticas.find((r) => r.titulo === titulo);
  return match?.valor ?? fallback;
}

export async function fetchPoliticasWithClient(
  client: SupabaseClient,
): Promise<PoliticasSupabasePayload> {
  const anioCorte = getAnioCorteMetricas();

  const [estadisticas, metricas, recomendacionRows, catalogoAlcaldias, centroConfigRaw, totalEspaciosPadron] =
    await Promise.all([
      fetchEstadisticas(client, anioCorte),
      fetchMetricasAlcaldia(client, anioCorte),
      fetchRecomendaciones(client),
      fetchAlcaldiasCatalogo(client),
      fetchPoliticasCentroConfigFromSupabase(client),
      fetchPadronEspaciosCount(client),
    ]);

  const centroConfig = resolvePoliticasCentroConfig(
    centroConfigRaw ?? getDefaultPoliticasCentroConfigRaw(),
    anioCorte,
  );

  const metricasCompletas = mergeMetricasConCatalogoAlcaldias(
    catalogoAlcaldias,
    metricas,
  );

  const recomendacionesPorObjetivo =
    recomendacionRows.length > 0
      ? groupRecomendaciones(recomendacionRows)
      : recomendacionesMock.map((s) => ({
          ...s,
          acciones: s.acciones.map((a) => ({ ...a })),
        }));

  const todasAcciones = recomendacionesPorObjetivo.flatMap((s) => s.acciones);
  const totalEspacios = resolveTotalEspaciosPadron(totalEspaciosPadron);
  const totalAlcaldias = valorResumen(
    estadisticas,
    "Alcaldias",
    metricas.length || 16,
  );
  const brechaPromedio =
    metricasCompletas.length > 0
      ? metricasCompletas.reduce((s, m) => s + m.porcentajeBrecha, 0) /
        metricasCompletas.length
      : 0;

  const brechaInversionAlcaldias =
    metricasCompletas.length > 0
      ? buildBrechaInversionChart(metricasCompletas)
      : [...brechaMock];

  return {
    politicasHero: centroConfig.hero,
    politicasHeroStats: buildPoliticasHeroStats({
      recomendaciones: todasAcciones,
      totalAlcaldias,
      totalEspacios,
      brechaPromedio,
    }),
    evidenciaDiagnosticoContenido:
      metricasCompletas.length > 0
        ? buildEvidenciaDiagnostico({ metricas: metricasCompletas, anioCorte })
        : { ...evidenciaMock },
    brechaInversionAlcaldias,
    filtrosObjetivo: centroConfig.filtrosObjetivo,
    recomendacionesPorObjetivo,
    politicasCta: centroConfig.politicasCta,
    anioCorte,
  };
}

export async function fetchPoliticasFromSupabase(): Promise<PoliticasSupabasePayload> {
  const client = createSupabasePublicClient();
  return fetchPoliticasWithClient(client);
}
