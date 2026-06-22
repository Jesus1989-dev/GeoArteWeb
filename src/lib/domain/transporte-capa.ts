import type { TerritorialDataSource } from "@/lib/domain/mapa-territorial";

export type TransporteSistema = "metro" | "metrobús" | "cablebús" | "referencia";

export type TransporteGeoJsonGeometry = {
  type: "LineString" | "MultiLineString";
  coordinates: number[][] | number[][][];
};

export type TransporteGeoFeature = {
  type: "Feature";
  properties: {
    id: string;
    nombre: string;
    color: string;
    tipo: TransporteSistema;
    sistema?: TransporteSistema;
  };
  geometry: TransporteGeoJsonGeometry;
};

export type TransporteFeatureCollection = {
  type: "FeatureCollection";
  features: TransporteGeoFeature[];
};

export type TransporteCapaData = {
  lineas: TransporteFeatureCollection;
  source: TerritorialDataSource;
};

export const EMPTY_TRANSPORTE_COLLECTION: TransporteFeatureCollection = {
  type: "FeatureCollection",
  features: [],
};

export function emptyTransporteCapa(): TransporteCapaData {
  return {
    lineas: { ...EMPTY_TRANSPORTE_COLLECTION, features: [] },
    source: "fallback",
  };
}

export function parseTransporteFeatureCollection(value: unknown): TransporteFeatureCollection {
  if (
    value != null &&
    typeof value === "object" &&
    "type" in value &&
    (value as { type: string }).type === "FeatureCollection" &&
    "features" in value &&
    Array.isArray((value as { features: unknown }).features)
  ) {
    return value as TransporteFeatureCollection;
  }

  return { type: "FeatureCollection", features: [] };
}
