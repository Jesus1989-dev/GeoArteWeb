import type { ReporteFormato } from "@/lib/domain/reportes";
import {
  buildDefaultFiltersFromPlantilla,
  type PlantillaFiltrosDefault,
} from "@/lib/reportes/plantilla-filtros";

export type { ReporteFormato };

/** Formatos disponibles en el Centro de reportes (sin CSV). */
export const REPORTE_CENTRO_FORMATOS = ["PDF", "XLSX"] as const satisfies readonly ReporteFormato[];

export function filterFormatosCentroReportes(
  formatos: readonly ReporteFormato[],
): ReporteFormato[] {
  const filtered = formatos.filter((f): f is ReporteFormato =>
    (REPORTE_CENTRO_FORMATOS as readonly string[]).includes(f),
  );
  return filtered.length > 0 ? [...filtered] : [...REPORTE_CENTRO_FORMATOS];
}

export type ReportePlantillaDef = {
  id: string;
  titulo: string;
  desc: string;
  categoria: string;
  formatos: ReporteFormato[];
  filtrosDefault: PlantillaFiltrosDefault;
  orden?: number;
};

export const REPORTE_PLANTILLAS_FALLBACK: ReportePlantillaDef[] = [
  {
    id: "p1",
    titulo: "Diagnóstico Territorial",
    desc: "Brechas y cobertura por demarcación",
    categoria: "Diagnóstico Territorial",
    formatos: ["PDF", "XLSX"],
    filtrosDefault: {
      alcaldia: { pick: "first_after_todos" },
      disciplina: "Todas",
      periodo: { pick: "first" },
      nse: "Todos",
      edad: "Todos",
      genero: "Todos",
    },
    orden: 1,
  },
  {
    id: "p2",
    titulo: "Impacto Social",
    desc: "Participación por género, NSE y edad",
    categoria: "Impacto Social",
    formatos: ["PDF", "XLSX"],
    filtrosDefault: {
      alcaldia: "Todas",
      disciplina: "Todas",
      periodo: { pick: "first" },
      nse: { pick: "first_after_todos" },
      edad: { pick: "first_after_todos" },
      genero: "Todos",
    },
    orden: 2,
  },
  {
    id: "p3",
    titulo: "Resumen Ejecutivo",
    desc: "Panorama CDMX para autoridades",
    categoria: "Resumen Ejecutivo",
    formatos: ["PDF", "XLSX"],
    filtrosDefault: {
      alcaldia: "Todas",
      disciplina: "Todas",
      periodo: { pick: "first" },
      nse: "Todos",
      edad: "Todos",
      genero: "Todos",
    },
    orden: 3,
  },
];

/** Compatibilidad con imports existentes. */
export const REPORTE_PLANTILLAS = REPORTE_PLANTILLAS_FALLBACK;

export function getPlantillaById(
  id: string,
  source: readonly ReportePlantillaDef[] = REPORTE_PLANTILLAS_FALLBACK,
): ReportePlantillaDef | undefined {
  return source.find((p) => p.id === id);
}

export function buildPlantillaDefaultFilters(
  plantilla: ReportePlantillaDef,
  opciones: {
    filtroOpciones: {
      alcaldia: string[];
      disciplina: string[];
      periodo: string[];
      nivelSocioeconomico: string[];
      rangoEdad: string[];
      genero: string[];
    };
  },
) {
  return buildDefaultFiltersFromPlantilla(plantilla.filtrosDefault, opciones.filtroOpciones);
}

export function slugifyReportName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9-]/g, "")
    .toLowerCase()
    .slice(0, 48);
}

export function toReportePlantillaUi(plantilla: ReportePlantillaDef) {
  return {
    id: plantilla.id,
    titulo: plantilla.titulo,
    desc: plantilla.desc,
    formatos: filterFormatosCentroReportes(plantilla.formatos),
    categoria: plantilla.categoria,
    filtrosDefault: plantilla.filtrosDefault,
  };
}
