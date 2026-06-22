import type { EstadoReporte } from "@/lib/domain/reportes";
import { normalizeExportFormatLabel } from "@/lib/reportes/export-format";

export type ExportDownloadMeta = {
  source: "web" | "mobile";
  label: string;
  storagePath?: string;
  sizeKb?: number;
  plantillaId?: string;
  autor?: string;
  estado?: EstadoReporte;
};

export function serializeExportMeta(meta: ExportDownloadMeta): string {
  if (meta.source === "web" && meta.storagePath) {
    return JSON.stringify(meta);
  }
  return meta.label;
}

export function parseExportMeta(raw: string | null): ExportDownloadMeta | null {
  if (!raw?.trim()) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<ExportDownloadMeta>;
    if (parsed && typeof parsed === "object") {
      const storagePath =
        typeof parsed.storagePath === "string" ? parsed.storagePath.trim() : undefined;
      const label =
        typeof parsed.label === "string" && parsed.label.trim()
          ? parsed.label.trim()
          : storagePath?.split("/").pop() ?? "Exportación";
      const source =
        parsed.source === "web" || parsed.source === "mobile"
          ? parsed.source
          : storagePath
            ? "web"
            : "mobile";

      if ("label" in parsed || storagePath) {
        return {
          source,
          label,
          storagePath,
          sizeKb: parsed.sizeKb,
          plantillaId: parsed.plantillaId,
          autor: parsed.autor,
          estado: parsed.estado,
        };
      }
    }
  } catch {
    /* meta legado en texto plano (app móvil) */
  }
  return { source: "mobile", label: raw.trim() };
}

export function exportMetaDisplayLabel(raw: string | null): string {
  return parseExportMeta(raw)?.label ?? raw?.trim() ?? "Exportación";
}

/** Resumen legible para listas de actividad (admin logs, auditoría). */
export function formatExportLogDetalle(
  format: string | null,
  meta: string | null,
): string {
  const parsed = parseExportMeta(meta);
  const fmt = normalizeExportFormatLabel(format);
  const parts: string[] = [fmt];
  const label = parsed?.label?.trim();
  if (label) parts.push(label);
  if (parsed?.sizeKb != null && parsed.sizeKb > 0) {
    parts.push(`${parsed.sizeKb} KB`);
  }
  return parts.join(" · ");
}
