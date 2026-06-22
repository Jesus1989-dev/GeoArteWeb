export type GeoJsonFeatureCollection<TProps = Record<string, unknown>> = {
  type: "FeatureCollection";
  metadata?: Record<string, unknown>;
  features: GeoJsonFeature<TProps>[];
};

export type GeoJsonFeature<TProps = Record<string, unknown>> = {
  type: "Feature";
  geometry: GeoJsonGeometry | null;
  properties: TProps;
};

export type GeoJsonGeometry =
  | { type: "Point"; coordinates: [number, number] }
  | { type: "LineString"; coordinates: [number, number][] }
  | { type: "MultiLineString"; coordinates: [number, number][][] };

export type ApiV1EspacioProperties = {
  id: string;
  nombre: string;
  tipo: string;
  direccion: string;
  alcaldia?: string;
  imagenUrl?: string;
};

export type ApiV1TransporteProperties = {
  id: string;
  nombre: string;
  color: string;
  tipo: "metro" | "metrobús" | "cablebús" | "referencia";
};

export type ApiV1AlcaldiaStats = {
  id: string;
  alcaldia: string;
  cantidadEspacios: number;
  porcentajeCobertura: number;
  porcentajeBrecha: number;
  dataSource: "supabase" | "mock";
};

export type ApiV1SearchResult =
  | {
      type: "espacio";
      id: string;
      nombre: string;
      alcaldia: string;
      direccion?: string;
    }
  | {
      type: "alcaldia";
      id: string;
      nombre: string;
    };

export type ApiV1SearchResponse = {
  query: string;
  total: number;
  results: ApiV1SearchResult[];
  dataSource: "supabase" | "mock";
};
