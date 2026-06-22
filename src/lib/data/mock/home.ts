import {
  BarChart3,
  Building2,
  Calendar,
  CirclePlus,
  FileText,
  Layers,
  Map,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { BrechaAlcaldia, GrowthDataPoint, HomeStatItem, QuickAccessItem, SpatialExplorerPreviewData } from "@/lib/domain/home";
import { espaciosMock } from "@/lib/data/mock/mapa";
import { buildSpatialExplorerPreviewData } from "@/lib/home/spatial-preview";
import { CDMX_ALCALDIAS } from "@/lib/data/supabase/search.repository";

export const homeStatIcons = {
  building: Building2,
  map: Map,
  layers: Layers,
  calendar: Calendar,
} satisfies Record<HomeStatItem["iconKey"], LucideIcon>;

export const quickAccessIcons = {
  map: Map,
  barChart: BarChart3,
  fileText: FileText,
  circlePlus: CirclePlus,
} satisfies Record<QuickAccessItem["iconKey"], LucideIcon>;

export const homeStats: HomeStatItem[] = [
  {
    iconKey: "building",
    value: "2,485",
    label: "Total Espacios",
    description: "Infraestructura cultural georreferenciada",
  },
  {
    iconKey: "map",
    value: "16 / 16",
    label: "Alcaldías",
    description: "Cobertura total del territorio CDMX",
  },
  {
    iconKey: "layers",
    value: "78.4%",
    label: "Cobertura Prom.",
    description: "Índice de accesibilidad promedio",
  },
  {
    iconKey: "calendar",
    value: "2023-2",
    label: "Periodo",
    description: "Última actualización de datos",
  },
];

export const quickAccess: QuickAccessItem[] = [
  {
    iconKey: "map",
    title: "Visor Geográfico",
    description: "Análisis de capas y vacíos territoriales",
    href: "/mapa",
    highlighted: false,
  },
  {
    iconKey: "barChart",
    title: "Tablero Estadístico",
    description: "Gráficas y comparativas de datos",
    href: "/dashboard",
    highlighted: false,
  },
  {
    iconKey: "fileText",
    title: "Generador de Reportes",
    description: "Documentos de diagnóstico sectorial",
    href: "/reportes",
    highlighted: true,
  },
  {
    iconKey: "circlePlus",
    title: "Gestión de Datos",
    description: "Cargar nuevos registros de espacios",
    href: "/admin",
    highlighted: false,
  },
];

export const growthData: GrowthDataPoint[] = [
  { year: "2019", value: 1820 },
  { year: "2020", value: 1950 },
  { year: "2021", value: 2100 },
  { year: "2022", value: 2340 },
  { year: "2023", value: 2485 },
];

export const brechaAlcaldias: BrechaAlcaldia[] = [
  {
    alcaldia: "Milpa Alta",
    espacios: 45,
    brecha: 42,
    prioridad: "Crítico",
  },
  {
    alcaldia: "Tláhuac",
    espacios: 88,
    brecha: 35,
    prioridad: "Atención",
  },
  {
    alcaldia: "Xochimilco",
    espacios: 112,
    brecha: 28,
    prioridad: "Atención",
  },
  {
    alcaldia: "Iztapalapa",
    espacios: 342,
    brecha: 22,
    prioridad: "Estable",
  },
  {
    alcaldia: "Gustavo A. Madero",
    espacios: 285,
    brecha: 18,
    prioridad: "Estable",
  },
];

export const spatialExplorerPreview: SpatialExplorerPreviewData =
  buildSpatialExplorerPreviewData({
    espacios: espaciosMock,
    totalGeoref: espaciosMock.length,
    maxPins: 8,
  });

export const busquedaAlcaldias = [...CDMX_ALCALDIAS];
