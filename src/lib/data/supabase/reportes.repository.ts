import type {
  ReporteHistorialRow,
  ReporteKpi,
} from "@/lib/domain/reportes";
import { exportMetaDisplayLabel } from "@/lib/reportes/export-meta";
import { isSpreadsheetExportFormat, normalizeExportFormatLabel } from "@/lib/reportes/export-format";
import { mapExportRowToHistorial } from "@/lib/reportes/map-export-download-row";
import { getSupabaseBrowserClient } from "@/lib/data/supabase/client";

type ExportRow = {
  id?: string;
  file_name: string | null;
  format: string | null;
  meta: string | null;
  created_at: string | null;
};

export type ReportesExportStats = {
  total: number;
  pdf: number;
  csv: number;
  xlsx: number;
  exportsThisMonth: number;
  lastExportAt: string | null;
};

function formatLastExportLabel(iso: string | null): string {
  if (!iso) return "Sin exportaciones registradas";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Sin exportaciones registradas";
  return `Última exportación: ${date.toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })}`;
}

function isSameCalendarMonth(iso: string, reference = new Date()): boolean {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return false;
  return (
    date.getFullYear() === reference.getFullYear() &&
    date.getMonth() === reference.getMonth()
  );
}

function normalizeFormat(raw: string | null): string {
  return normalizeExportFormatLabel(raw);
}

export async function fetchReportesExportStats(
  userId: string,
): Promise<ReportesExportStats> {
  const client = getSupabaseBrowserClient();
  if (!client) {
    return {
      total: 0,
      pdf: 0,
      csv: 0,
      xlsx: 0,
      exportsThisMonth: 0,
      lastExportAt: null,
    };
  }

  const { data, error } = await client
    .from("export_downloads")
    .select("format, created_at")
    .eq("user_id", userId);

  if (error) {
    throw new Error(`Supabase export_downloads stats: ${error.message}`);
  }

  const stats: ReportesExportStats = {
    total: 0,
    pdf: 0,
    csv: 0,
    xlsx: 0,
    exportsThisMonth: 0,
    lastExportAt: null,
  };

  for (const row of data ?? []) {
    stats.total += 1;
    const fmt = normalizeFormat((row as { format?: string }).format ?? null);
    if (fmt === "PDF") stats.pdf += 1;
    else if (fmt === "CSV") stats.csv += 1;
    else if (fmt === "XLSX" || fmt === "EXCEL") stats.xlsx += 1;

    const createdAt = (row as { created_at?: string | null }).created_at ?? null;
    if (createdAt) {
      if (isSameCalendarMonth(createdAt)) {
        stats.exportsThisMonth += 1;
      }
      if (
        stats.lastExportAt == null ||
        new Date(createdAt).getTime() > new Date(stats.lastExportAt).getTime()
      ) {
        stats.lastExportAt = createdAt;
      }
    }
  }
  return stats;
}

export async function fetchReportesHistorialForUser(input: {
  userId: string;
  autor?: string;
  limit?: number;
}): Promise<ReporteHistorialRow[]> {
  const client = getSupabaseBrowserClient();
  if (!client) return [];

  const { data, error } = await client
    .from("export_downloads")
    .select("id, file_name, format, meta, created_at")
    .eq("user_id", input.userId)
    .order("created_at", { ascending: false })
    .limit(input.limit ?? 12);

  if (error) {
    throw new Error(`Supabase export_downloads historial: ${error.message}`);
  }

  return ((data ?? []) as ExportRow[]).map((row, index) =>
    mapExportRowToHistorial(row, index, input.autor),
  );
}

/** KPIs derivados de export_downloads del usuario. */
export function buildReportesKpisFromStats(stats: ReportesExportStats): ReporteKpi[] {
  return [
    {
      label: "Total exportaciones",
      value: stats.total.toLocaleString("es-MX"),
      delta: "Registradas en tu cuenta",
      positive: true,
      icon: "fileText",
      accent: "navy",
    },
    {
      label: "Informes PDF",
      value: stats.pdf.toLocaleString("es-MX"),
      delta: stats.pdf > 0 ? "Web y app móvil" : "Sin PDF aún",
      positive: stats.pdf > 0,
      icon: "download",
      accent: "pink",
    },
    {
      label: "Datos tabulares",
      value: stats.xlsx.toLocaleString("es-MX"),
      delta: "Excel (.xlsx)",
      positive: stats.xlsx > 0,
      icon: "database",
      accent: "navy",
    },
    {
      label: "Generador web",
      value: stats.exportsThisMonth.toLocaleString("es-MX"),
      delta:
        stats.total === 0
          ? "PDF · Excel disponibles"
          : formatLastExportLabel(stats.lastExportAt),
      positive: stats.exportsThisMonth > 0 || stats.total > 0,
      icon: "clock",
      accent: "pink",
    },
  ];
}

export { exportMetaDisplayLabel };
