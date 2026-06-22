import {
  createDefaultTiposFiltro,
  type EspacioTipo,
} from "@/lib/domain/mapa";
import type { TerritorioGeometrias } from "@/lib/domain/territorio-geometrias";
import type { TransporteCapaData } from "@/lib/domain/transporte-capa";

export type AlcaldiaMetrica = {
  alcaldia: string;
  cantidadEspacios: number;
  porcentajeCobertura: number;
  porcentajeBrecha: number;
};

export type MacrozonaDensidad = {
  macrozona: string;
  porcentaje: number;
};

export type AlcaldiaCentroide = {
  alcaldia: string;
  lat: number;
  lng: number;
};

export type TerritorialDataSource = "supabase" | "geojson" | "fallback";

export type TerritorialDataSources = {
  metricas: TerritorialDataSource;
  densidad: TerritorialDataSource;
  geometrias: TerritorialDataSource;
  transporte: TerritorialDataSource;
};

export type MapaTerritorialData = {
  metricas: AlcaldiaMetrica[];
  densidadMacrozonas: MacrozonaDensidad[];
  centroids: AlcaldiaCentroide[];
  geometrias: TerritorioGeometrias;
  transporte: TransporteCapaData;
  sources: TerritorialDataSources;
};

export function formatTerritorialFuenteLabel(sources: TerritorialDataSources): string {
  const partes: string[] = [];
  if (sources.metricas === "supabase") partes.push("métricas");
  if (sources.densidad === "supabase") partes.push("densidad");
  if (sources.geometrias === "supabase") partes.push("polígonos");
  if (sources.transporte === "supabase") partes.push("transporte");
  if (sources.transporte === "geojson") partes.push("transporte (GeoJSON)");

  if (partes.length === 0) {
    return "Variables territoriales: estimación local (aplica migraciones y ejecuta seeds).";
  }
  return `Capas desde Supabase: ${partes.join(", ")}.`;
}

export const MAPA_OVERLAY_CAPAS = [
  "transporte",
  "densidad",
  "nivel",
  "cobertura",
] as const;

export type MapaCapasExtraId = (typeof MAPA_OVERLAY_CAPAS)[number];

export const MAPA_TOGGLE_CAPAS = [
  ...MAPA_OVERLAY_CAPAS,
  "recursosCualitativos",
] as const;

export type MapaCapasToggleId = (typeof MAPA_TOGGLE_CAPAS)[number];

export function pickOverlayCapas(
  capas: Record<MapaCapasToggleId, boolean>,
): Record<MapaCapasExtraId, boolean> {
  return {
    transporte: capas.transporte,
    densidad: capas.densidad,
    nivel: capas.nivel,
    cobertura: capas.cobertura,
  };
}

export function createDefaultCapasToggle(): Record<MapaCapasToggleId, boolean> {
  return {
    transporte: false,
    densidad: false,
    nivel: false,
    cobertura: false,
    recursosCualitativos: false,
  };
}

export type MapaFiltrosAvanzados = {
  tipos: Record<EspacioTipo, boolean>;
  brechaMinima: number;
  soloVacios: boolean;
};

export const DEFAULT_MAPA_FILTROS: MapaFiltrosAvanzados = {
  tipos: createDefaultTiposFiltro(false),
  brechaMinima: 0,
  soloVacios: false,
};
