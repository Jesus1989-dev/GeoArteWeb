import type { ReporteFormato } from "@/lib/domain/reportes";

/** Valores permitidos por export_downloads_format_check en Supabase. */
export const EXPORT_DOWNLOAD_DB_FORMATS = ["PDF", "CSV", "XLSX"] as const;

export type ExportDownloadDbFormat = (typeof EXPORT_DOWNLOAD_DB_FORMATS)[number];

/** Normaliza el formato UI/API al valor persistido en export_downloads.format. */
export function toExportDownloadDbFormat(format: ReporteFormato): ExportDownloadDbFormat {
  if (format === "PDF" || format === "CSV" || format === "XLSX") return format;
  const _exhaustive: never = format;
  return _exhaustive;
}

/** Etiqueta legible para historial (acepta legacy EXCEL en lecturas). */
export function normalizeExportFormatLabel(raw: string | null): string {
  const fmt = raw?.trim().toUpperCase() ?? "";
  if (fmt === "EXCEL") return "XLSX";
  return fmt || "—";
}

export function isSpreadsheetExportFormat(fmt: string): boolean {
  const u = fmt.toUpperCase();
  return u === "XLSX" || u === "EXCEL" || u === "CSV";
}
