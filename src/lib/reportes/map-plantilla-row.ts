import type { ReporteFormato, ReportePlantillaDef } from "@/lib/reportes/plantillas-reporte";
import { filterFormatosCentroReportes } from "@/lib/reportes/plantillas-reporte";
import { parsePlantillaFiltrosDefault } from "@/lib/reportes/plantilla-filtros";

export type ReportePlantillaRow = {
  id: string;
  titulo: string;
  descripcion: string;
  categoria: string;
  formatos: string[] | null;
  filtros_default: unknown;
  orden: number | null;
  activo?: boolean | null;
};

function normalizeFormatos(raw: string[] | null): ReporteFormato[] {
  const out: ReporteFormato[] = [];
  for (const value of raw ?? []) {
    const fmt = value.trim().toUpperCase();
    if (fmt === "PDF" || fmt === "CSV" || fmt === "XLSX") {
      if (!out.includes(fmt)) out.push(fmt);
    }
  }
  return out;
}

export function mapReportePlantillaRow(row: ReportePlantillaRow): ReportePlantillaDef | null {
  const formatos = filterFormatosCentroReportes(normalizeFormatos(row.formatos));
  if (formatos.length === 0) return null;

  return {
    id: row.id,
    titulo: row.titulo.trim(),
    desc: row.descripcion.trim(),
    categoria: row.categoria.trim(),
    formatos,
    filtrosDefault: parsePlantillaFiltrosDefault(row.filtros_default),
    orden: row.orden ?? 0,
  };
}

export function mapReportePlantillaRows(rows: ReportePlantillaRow[]): ReportePlantillaDef[] {
  return rows
    .map((row) => mapReportePlantillaRow(row))
    .filter((row): row is ReportePlantillaDef => row != null);
}
