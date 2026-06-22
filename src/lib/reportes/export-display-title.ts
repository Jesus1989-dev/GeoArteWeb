import type { ExportDownloadMeta } from "@/lib/reportes/export-meta";

/** Convierte nombres técnicos (con guiones bajos y timestamp) en títulos legibles. */
export function humanizeExportFileName(fileName: string): string {
  const base = fileName.replace(/\.(pdf|xlsx|csv|xls)$/i, "").trim();
  if (!base) return "Exportación";

  const withoutTimestamp = base.replace(/[_-]?\d{10,13}$/, "");
  const normalized = withoutTimestamp.replace(/_/g, " ").replace(/\s+/g, " ").trim();

  if (!normalized) return "Exportación";

  return normalized.replace(/GeoArteCDMX/gi, "GeoArte CDMX");
}

function labelLooksTechnical(label: string, rawFileName: string): boolean {
  if (rawFileName && label === rawFileName) return true;
  return /_\d{8,13}(\.(pdf|xlsx|csv|xls))?$/i.test(label) || /^[\w-]+\.(pdf|xlsx|csv|xls)$/i.test(label);
}

/** Título amigable para UI; conserva el nombre original aparte para descargas. */
export function resolveExportDisplayTitle(
  fileName: string | null | undefined,
  parsed: ExportDownloadMeta | null,
): string {
  const raw = fileName?.trim() || "";
  const label = parsed?.label?.trim();

  if (label && !labelLooksTechnical(label, raw)) {
    return label;
  }

  if (raw) return humanizeExportFileName(raw);
  return "Exportación sin nombre";
}
