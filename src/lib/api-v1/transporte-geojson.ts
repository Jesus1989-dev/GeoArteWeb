import type {
  GeoJsonFeatureCollection,
  GeoJsonGeometry,
  ApiV1TransporteProperties,
} from "@/lib/domain/api-v1";
import { fetchTransporteCapaServer } from "@/lib/data/supabase/mapa-transporte.repository.server";

export async function buildTransporteGeoJsonV1(): Promise<
  GeoJsonFeatureCollection<ApiV1TransporteProperties>
> {
  const capa = await fetchTransporteCapaServer();
  const fromGeoJson = capa.source === "geojson";
  const fromSupabase = capa.source === "supabase";

  const features = capa.lineas.features.map((feature) => ({
    type: "Feature" as const,
    geometry: feature.geometry as GeoJsonGeometry,
    properties: {
      id: feature.properties.id,
      nombre: feature.properties.nombre,
      color: feature.properties.color,
      tipo: feature.properties.tipo,
    },
  }));

  return {
    type: "FeatureCollection",
    metadata: {
      layer: "transporte",
      source: fromSupabase
        ? "Supabase · capa_transporte_linea"
        : fromGeoJson
          ? "GeoArte CDMX · GeoJSON empaquetado (Metro + Metrobús)"
          : "GeoArte CDMX · referencia",
      disclaimer: fromSupabase
        ? "Trazos publicados en el padrón GeoArte; verifique vigencia con fuentes oficiales."
        : fromGeoJson
          ? "Geometría cartográfica empaquetada; no sustituye datos operativos oficiales del STC/SEMOVI."
          : "Geometría de referencia simplificada; no sustituye datos oficiales de Metro, Metrobús o Cablebús.",
      exportedAt: new Date().toISOString(),
      totalFeatures: features.length,
    },
    features,
  };
}
