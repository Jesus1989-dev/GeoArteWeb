import type { TerritorialDataSource } from "@/lib/domain/mapa-territorial";

export type TerritorioGeoJsonGeometry = {
  type: "Polygon" | "MultiPolygon";
  coordinates: number[][][] | number[][][][];
};

export type TerritorioGeoFeature = {
  type: "Feature";
  properties: {
    nombre: string;
    codigo: string;
    macrozona?: string;
  };
  geometry: TerritorioGeoJsonGeometry;
};

export type TerritorioFeatureCollection = {
  type: "FeatureCollection";
  features: TerritorioGeoFeature[];
};

export type TerritorioGeometrias = {
  alcaldias: TerritorioFeatureCollection;
  macrozonas: TerritorioFeatureCollection;
  source: TerritorialDataSource;
};

export const EMPTY_TERRITORIO_COLLECTION: TerritorioFeatureCollection = {
  type: "FeatureCollection",
  features: [],
};

export function emptyTerritorioGeometrias(): TerritorioGeometrias {
  return {
    alcaldias: { ...EMPTY_TERRITORIO_COLLECTION, features: [] },
    macrozonas: { ...EMPTY_TERRITORIO_COLLECTION, features: [] },
    source: "fallback",
  };
}
