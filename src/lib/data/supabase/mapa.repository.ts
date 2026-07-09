import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  AlcaldiaMetrica,
  MapaTerritorialData,
  MacrozonaDensidad,
  TerritorialDataSource,
} from "@/lib/domain/mapa-territorial";
import { emptyTerritorioGeometrias } from "@/lib/domain/territorio-geometrias";
import type { TerritorioGeometrias } from "@/lib/domain/territorio-geometrias";
import type { TransporteCapaData } from "@/lib/domain/transporte-capa";
import type { Espacio } from "@/lib/domain/mapa";
import { computeAlcaldiaCentroids } from "@/lib/mapa/alcaldia-centroids";
import { getSupabaseBrowserClient } from "@/lib/data/supabase/client";
import { getAnioCorteMetricas } from "@/lib/data/supabase/config";
import { fetchDensidadMacrozonaWithClient } from "@/lib/data/supabase/dashboard.repository";
import {
  fetchTerritorioGeometriasApiFallback,
  fetchTerritorioGeometriasBrowser,
} from "@/lib/data/supabase/mapa-geometrias.repository";
import {
  fetchTransporteCapaApiFallback,
  fetchTransporteCapaBrowser,
} from "@/lib/data/supabase/mapa-transporte.repository";
import { buildTransporteReferenciaCollection } from "@/lib/mapa/transporte-referencia-geojson";
import {
  metricasAlcaldiaConBrechaSectei,
  metricasAlcaldiaFromCounts,
} from "@/lib/mapa/brecha-territorial";

type MetricasRow = {
  alcaldia_nombre?: string | null;
  cantidad_espacios?: number | null;
  porcentaje_cobertura?: number | null;
  porcentaje_brecha?: number | null;
};

function mapMetricasRows(rows: MetricasRow[]): AlcaldiaMetrica[] {
  return metricasAlcaldiaConBrechaSectei(rows).map((row) => ({
    alcaldia: row.alcaldia,
    cantidadEspacios: row.cantidadEspacios,
    porcentajeCobertura: row.porcentajeCobertura,
    porcentajeBrecha: row.porcentajeBrecha,
  }));
}

export async function fetchMetricasAlcaldiaWithClient(
  client: SupabaseClient,
): Promise<AlcaldiaMetrica[]> {
  const anio = getAnioCorteMetricas();
  const { data, error } = await client
    .from("metricas_alcaldia")
    .select("alcaldia_nombre, cantidad_espacios, porcentaje_cobertura, porcentaje_brecha")
    .eq("anio", anio);

  if (error) {
    console.warn("[mapa] metricas_alcaldia:", error.message);
    return [];
  }

  return mapMetricasRows(data ?? []);
}

export function buildMockTerritorialData(espacios: Espacio[]): MapaTerritorialData {
  const centroids = computeAlcaldiaCentroids(espacios);
  const counts = new Map<string, number>();

  for (const espacio of espacios) {
    const key = espacio.alcaldia?.trim();
    if (!key) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const byAlcaldia = new Map(
    metricasAlcaldiaFromCounts(counts).map((row) => [row.alcaldia, row]),
  );

  const metricas: AlcaldiaMetrica[] = centroids.map((centroid) => {
    const row = byAlcaldia.get(centroid.alcaldia);
    return {
      alcaldia: centroid.alcaldia,
      cantidadEspacios: row?.cantidadEspacios ?? 0,
      porcentajeCobertura: row?.porcentajeCobertura ?? 0,
      porcentajeBrecha: row?.porcentajeBrecha ?? 100,
    };
  });

  const densidadMacrozonas: MacrozonaDensidad[] = [
    { macrozona: "NORTE", porcentaje: 42 },
    { macrozona: "CENTRO", porcentaje: 78 },
    { macrozona: "SUR", porcentaje: 55 },
    { macrozona: "PONIENTE", porcentaje: 61 },
    { macrozona: "ORIENTE", porcentaje: 48 },
  ];

  return {
    metricas,
    densidadMacrozonas,
    centroids,
    geometrias: emptyTerritorioGeometrias(),
    transporte: {
      lineas: buildTransporteReferenciaCollection(),
      source: "fallback",
    },
    sources: {
      metricas: "fallback",
      densidad: "fallback",
      geometrias: "fallback",
      transporte: "fallback",
    },
  };
}

async function resolveClientTransporte(transporte: TransporteCapaData): Promise<TransporteCapaData> {
  const apiCapa = await fetchTransporteCapaApiFallback();
  if (apiCapa.lineas.features.length > 0) {
    return apiCapa;
  }

  if (transporte.lineas.features.length > 0) {
    return transporte;
  }

  return {
    lineas: buildTransporteReferenciaCollection(),
    source: "fallback",
  };
}

async function resolveClientGeometrias(
  geometrias: TerritorioGeometrias,
): Promise<TerritorioGeometrias> {
  if (
    geometrias.alcaldias.features.length > 0 &&
    geometrias.macrozonas.features.length > 0
  ) {
    return geometrias;
  }

  const apiFallback = await fetchTerritorioGeometriasApiFallback();
  if (
    apiFallback.alcaldias.features.length === 0 &&
    apiFallback.macrozonas.features.length === 0
  ) {
    return geometrias;
  }

  return {
    alcaldias:
      geometrias.alcaldias.features.length > 0
        ? geometrias.alcaldias
        : apiFallback.alcaldias,
    macrozonas:
      geometrias.macrozonas.features.length > 0
        ? geometrias.macrozonas
        : apiFallback.macrozonas,
    source:
      geometrias.source === "supabase" || apiFallback.source === "supabase"
        ? "supabase"
        : "fallback",
  };
}

export function composeTerritorialData(
  espacios: Espacio[],
  metricas: AlcaldiaMetrica[],
  densidadMacrozonas: MacrozonaDensidad[],
  geometrias: TerritorioGeometrias,
  transporte: TransporteCapaData,
  metricasSource: TerritorialDataSource,
  densidadSource: TerritorialDataSource,
): MapaTerritorialData {
  const mock = buildMockTerritorialData(espacios);
  const centroids = computeAlcaldiaCentroids(espacios);

  const hasGeometrias =
    geometrias.alcaldias.features.length > 0 || geometrias.macrozonas.features.length > 0;
  const hasTransporte = transporte.lineas.features.length > 0;

  return {
    metricas: metricas.length > 0 ? metricas : mock.metricas,
    densidadMacrozonas:
      densidadMacrozonas.length > 0 ? densidadMacrozonas : mock.densidadMacrozonas,
    centroids,
    geometrias: hasGeometrias ? geometrias : mock.geometrias,
    transporte: hasTransporte ? transporte : mock.transporte,
    sources: {
      metricas: metricas.length > 0 ? metricasSource : "fallback",
      densidad: densidadMacrozonas.length > 0 ? densidadSource : "fallback",
      geometrias: hasGeometrias ? geometrias.source : "fallback",
      transporte: hasTransporte ? transporte.source : "fallback",
    },
  };
}

export async function fetchTerritorialFromClient(
  client: SupabaseClient,
  espacios: Espacio[],
  alcaldiaFiltro?: string,
): Promise<MapaTerritorialData> {
  const [metricas, densidadMacrozonas, geometriasRaw, transporteRaw] = await Promise.all([
    fetchMetricasAlcaldiaWithClient(client),
    fetchDensidadMacrozonaWithClient(client, alcaldiaFiltro),
    fetchTerritorioGeometriasBrowser(),
    fetchTransporteCapaBrowser(),
  ]);

  const [geometrias, transporte] = await Promise.all([
    resolveClientGeometrias(geometriasRaw),
    resolveClientTransporte(transporteRaw),
  ]);

  if (
    metricas.length === 0 &&
    densidadMacrozonas.length === 0 &&
    geometrias.alcaldias.features.length === 0
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
}

export async function fetchMapaTerritorialData(
  espacios: Espacio[],
  alcaldiaFiltro?: string,
): Promise<MapaTerritorialData> {
  const client = getSupabaseBrowserClient();
  if (!client) {
    const mock = buildMockTerritorialData(espacios);
    const [geometrias, transporte] = await Promise.all([
      fetchTerritorioGeometriasApiFallback(),
      fetchTransporteCapaApiFallback(),
    ]);
    return {
      ...mock,
      geometrias:
        geometrias.alcaldias.features.length > 0 ? geometrias : mock.geometrias,
      transporte:
        transporte.lineas.features.length > 0 ? transporte : mock.transporte,
      sources: {
        ...mock.sources,
        geometrias:
          geometrias.alcaldias.features.length > 0 ? geometrias.source : mock.sources.geometrias,
        transporte:
          transporte.lineas.features.length > 0 ? transporte.source : mock.sources.transporte,
      },
    };
  }

  return fetchTerritorialFromClient(client, espacios, alcaldiaFiltro);
}
