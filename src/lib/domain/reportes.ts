import type { PlantillaFiltrosDefault } from "@/lib/reportes/plantilla-filtros";

export type EstadoReporte = "Publicado" | "Generado" | "Borrador";

export type ReporteKpiIcon = "fileText" | "download" | "database" | "clock";

export type ReporteKpi = {
  label: string;
  value: string;
  delta: string;
  positive: boolean;
  icon: ReporteKpiIcon;
  accent: "navy" | "pink";
};

export type ReporteFormato = "PDF" | "CSV" | "XLSX";

export type ReporteHistorialRow = {
  id: string;
  titulo: string;
  /** Nombre de archivo original (descarga). */
  nombreArchivo?: string;
  estado: EstadoReporte;
  categoria: string;
  fecha: string;
  autor: string;
  formato: string;
  canDownload: boolean;
  downloadUrl: string | null;
  mobileOnly?: boolean;
  /** Motivo cuando no hay descarga web (p. ej. solo app móvil). */
  downloadUnavailableReason?: string;
};

export type ReportePlantilla = {
  id: string;
  titulo: string;
  desc: string;
  formatos: ReporteFormato[];
  categoria: string;
  filtrosDefault: PlantillaFiltrosDefault;
};

export type ReportesFiltroOpciones = {
  alcaldia: string[];
  disciplina: string[];
  periodo: string[];
  nivelSocioeconomico: string[];
  rangoEdad: string[];
  genero: string[];
};

export type ReporteAyuda = {
  texto: string;
  enlaceApi: string;
  enlaceHref: string;
};
