import type { User } from "@supabase/supabase-js";
import type { PerfilExportacion } from "@/lib/domain/perfil";
import type { EstadoReporte, ReporteHistorialRow } from "@/lib/domain/reportes";
import { normalizeExportFormatLabel } from "@/lib/reportes/export-format";
import {
  exportMetaDisplayLabel,
  parseExportMeta,
  type ExportDownloadMeta,
} from "@/lib/reportes/export-meta";
import { resolveExportDisplayTitle } from "@/lib/reportes/export-display-title";
import { resolveExportDownloadSync } from "@/lib/reportes/resolve-export-download";

export type ExportDownloadRowInput = {
  id?: string;
  file_name: string | null;
  format: string | null;
  meta: string | null;
  created_at: string | null;
};

function formatFecha(iso: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatFechaHora(iso: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function normalizeFormat(raw: string | null): string {
  return normalizeExportFormatLabel(raw);
}

export function inferExportEstado(parsed: ExportDownloadMeta | null): EstadoReporte {
  if (
    parsed?.estado === "Publicado" ||
    parsed?.estado === "Generado" ||
    parsed?.estado === "Borrador"
  ) {
    return parsed.estado;
  }
  if (parsed?.source === "mobile") return "Publicado";
  if (parsed?.storagePath) return "Generado";
  return "Publicado";
}

export function resolveExportAutor(
  parsed: ExportDownloadMeta | null,
  fallbackAutor?: string,
): string {
  if (parsed?.autor?.trim()) return parsed.autor.trim();
  if (fallbackAutor?.trim()) return fallbackAutor.trim();
  return "Sin autor registrado";
}

export function resolveExportAutorFromUser(
  user: User,
  profileDisplayName?: string | null,
): string {
  if (profileDisplayName?.trim()) return profileDisplayName.trim();
  const meta = user.user_metadata?.display_name;
  if (typeof meta === "string" && meta.trim()) return meta.trim();
  const local = user.email?.split("@")[0]?.replace(/\./g, " ") ?? "Usuario";
  return local.charAt(0).toUpperCase() + local.slice(1);
}

function inferCategoria(
  parsed: ExportDownloadMeta | null,
  meta: string | null,
  formato: string,
): string {
  if (parsed?.plantillaId === "p1") return "Diagnóstico Territorial";
  if (parsed?.plantillaId === "p2") return "Impacto Social";
  if (parsed?.plantillaId === "p3") return "Resumen Ejecutivo";
  if (parsed?.label) {
    const part = parsed.label.split("·")[0]?.trim();
    if (part) return part;
  }
  const trimmed = meta?.trim();
  if (trimmed && !trimmed.startsWith("{")) {
    return trimmed.split("·")[0]?.trim() || trimmed;
  }
  if (formato === "PDF") return "Informe PDF";
  if (formato === "CSV") return "Conjunto de datos CSV";
  if (formato === "XLSX" || formato === "EXCEL") return "Hoja de cálculo Excel";
  return "Exportación";
}

function buildDownloadFields(id: string, parsed: ExportDownloadMeta | null) {
  const availability = resolveExportDownloadSync(id, parsed);
  return {
    canDownload: availability.canDownload,
    downloadUrl: availability.downloadUrl,
    mobileOnly: availability.mobileOnly,
    downloadUnavailableReason: availability.downloadUnavailableReason,
  };
}

export function mapExportRowToHistorial(
  row: ExportDownloadRowInput,
  index: number,
  fallbackAutor?: string,
): ReporteHistorialRow {
  const parsed = parseExportMeta(row.meta);
  const formato = normalizeFormat(row.format);
  const id = row.id ?? `export-${index}`;
  const { canDownload, downloadUrl, mobileOnly, downloadUnavailableReason } =
    buildDownloadFields(id, parsed);
  const nombreArchivo = row.file_name?.trim() || undefined;

  return {
    id,
    titulo: resolveExportDisplayTitle(nombreArchivo, parsed),
    nombreArchivo,
    estado: inferExportEstado(parsed),
    categoria: inferCategoria(parsed, row.meta, formato),
    fecha: formatFecha(row.created_at),
    autor: resolveExportAutor(parsed, fallbackAutor),
    formato: formato || "—",
    canDownload,
    downloadUrl,
    mobileOnly,
    downloadUnavailableReason,
  };
}

export function mapExportRowToPerfil(
  row: ExportDownloadRowInput,
  index: number,
  fallbackAutor?: string,
): PerfilExportacion {
  const parsed = parseExportMeta(row.meta);
  const formato = normalizeFormat(row.format);
  const id = row.id ?? `${row.created_at ?? "export"}-${index}`;
  const { canDownload, downloadUrl, mobileOnly, downloadUnavailableReason } =
    buildDownloadFields(id, parsed);
  const nombreArchivo = row.file_name?.trim() || undefined;

  return {
    id,
    nombre: resolveExportDisplayTitle(nombreArchivo, parsed),
    nombreArchivo,
    formato: formato || "—",
    meta: exportMetaDisplayLabel(row.meta),
    exportadoEl: formatFechaHora(row.created_at),
    autor: resolveExportAutor(parsed, fallbackAutor),
    estado: inferExportEstado(parsed),
    canDownload,
    downloadUrl,
    mobileOnly,
    downloadUnavailableReason,
  };
}
