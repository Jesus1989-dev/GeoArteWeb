import type { SupabaseClient } from "@supabase/supabase-js";
import type { TerritorialDataSource } from "@/lib/domain/mapa-territorial";
import type { TransporteCapaData } from "@/lib/domain/transporte-capa";
import { emptyTransporteCapa, parseTransporteFeatureCollection } from "@/lib/domain/transporte-capa";
import { getSupabaseBrowserClient } from "@/lib/data/supabase/client";

export async function fetchTransporteGeoJsonWithClient(
  client: SupabaseClient,
): Promise<ReturnType<typeof parseTransporteFeatureCollection>> {
  const { data, error } = await client.rpc("transporte_geojson");

  if (error) {
    console.warn("[mapa] transporte_geojson:", error.message);
    return { type: "FeatureCollection", features: [] };
  }

  return parseTransporteFeatureCollection(data);
}

export async function fetchTransporteCapaWithClient(
  client: SupabaseClient,
): Promise<TransporteCapaData> {
  const lineas = await fetchTransporteGeoJsonWithClient(client);

  if (lineas.features.length === 0) {
    return emptyTransporteCapa();
  }

  return { lineas, source: "supabase" };
}

export async function fetchTransporteCapaBrowser(): Promise<TransporteCapaData> {
  const client = getSupabaseBrowserClient();
  if (!client) {
    return emptyTransporteCapa();
  }

  return fetchTransporteCapaWithClient(client);
}

import { PAGE_REVALIDATE_SECONDS } from "@/lib/cache/timing";

export async function fetchTransporteCapaApiFallback(): Promise<TransporteCapaData> {
  const response = await fetch("/api/data/mapa/transporte", {
    next: { revalidate: PAGE_REVALIDATE_SECONDS },
  });
  if (!response.ok) {
    return emptyTransporteCapa();
  }

  const body = (await response.json()) as TransporteCapaData;
  return {
    lineas: parseTransporteFeatureCollection(body.lineas),
    source: (body.source as TerritorialDataSource) ?? "fallback",
  };
}
