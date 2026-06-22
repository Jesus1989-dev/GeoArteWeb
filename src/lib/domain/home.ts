import type { EspacioTipo } from "@/lib/domain/mapa";

export type HomeStatIcon = "building" | "map" | "layers" | "calendar";

export type HomeStatItem = {
  iconKey: HomeStatIcon;
  value: string;
  label: string;
  description: string;
};

export type Prioridad = "Crítico" | "Atención" | "Estable";

export type BrechaAlcaldia = {
  alcaldia: string;
  espacios: number;
  brecha: number;
  prioridad: Prioridad;
};

export type GrowthDataPoint = {
  year: string;
  value: number;
};

export type QuickAccessIconKey = "map" | "barChart" | "fileText" | "circlePlus";

export type QuickAccessItem = {
  iconKey: QuickAccessIconKey;
  title: string;
  description: string;
  href: string;
  highlighted: boolean;
};

export type SpatialPreviewPin = {
  id: string;
  nombre: string;
  tipo: EspacioTipo;
  top: string;
  left: string;
};

export type SpatialPreviewLegendItem = {
  tipo: EspacioTipo;
  label: string;
  count: number;
  dotClassName: string;
};

export type SpatialExplorerPreviewData = {
  pins: SpatialPreviewPin[];
  totalGeoref: number;
  legend: SpatialPreviewLegendItem[];
  subtitle: string;
};
