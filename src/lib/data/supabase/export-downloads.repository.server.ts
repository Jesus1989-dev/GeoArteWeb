import "server-only";

import type { PerfilExportacion } from "@/lib/domain/perfil";
import type { ReporteHistorialRow } from "@/lib/domain/reportes";
import { createSupabaseServerClient } from "@/lib/data/supabase/server";
import {
  mapExportRowToHistorial,
  mapExportRowToPerfil,
  type ExportDownloadRowInput,
} from "@/lib/reportes/map-export-download-row";
import { resolveExportDownloadServer } from "@/lib/reportes/resolve-export-download";

type ExportRow = ExportDownloadRowInput & { id?: string };

async function fetchExportRowsForUser(
  userId: string,
  limit: number,
): Promise<ExportRow[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("export_downloads")
    .select("id, file_name, format, meta, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Supabase export_downloads: ${error.message}`);
  }

  return (data ?? []) as ExportRow[];
}

async function enrichHistorialRows(
  rows: ReporteHistorialRow[],
  rawRows: ExportRow[],
  userId: string,
): Promise<ReporteHistorialRow[]> {
  return Promise.all(
    rows.map(async (row, index) => {
      const raw = rawRows[index];
      const availability = await resolveExportDownloadServer({
        exportId: row.id,
        userId,
        fileName: raw.file_name,
        meta: raw.meta,
      });

      return {
        ...row,
        canDownload: availability.canDownload,
        downloadUrl: availability.downloadUrl,
        mobileOnly: availability.mobileOnly,
        downloadUnavailableReason: availability.downloadUnavailableReason,
      };
    }),
  );
}

async function enrichPerfilRows(
  rows: PerfilExportacion[],
  rawRows: ExportRow[],
  userId: string,
): Promise<PerfilExportacion[]> {
  return Promise.all(
    rows.map(async (row, index) => {
      const raw = rawRows[index];
      const availability = await resolveExportDownloadServer({
        exportId: row.id,
        userId,
        fileName: raw.file_name,
        meta: raw.meta,
      });

      return {
        ...row,
        canDownload: availability.canDownload,
        downloadUrl: availability.downloadUrl,
        mobileOnly: availability.mobileOnly,
        downloadUnavailableReason: availability.downloadUnavailableReason,
      };
    }),
  );
}

export async function fetchReportesHistorialForUserServer(input: {
  userId: string;
  autor?: string;
  limit?: number;
}): Promise<ReporteHistorialRow[]> {
  const rawRows = await fetchExportRowsForUser(input.userId, input.limit ?? 12);
  const rows = rawRows.map((row, index) =>
    mapExportRowToHistorial(row, index, input.autor),
  );
  return enrichHistorialRows(rows, rawRows, input.userId);
}

export async function fetchExportDownloadsForUserServer(
  userId: string,
  limit = 40,
  fallbackAutor?: string,
): Promise<PerfilExportacion[]> {
  const rawRows = await fetchExportRowsForUser(userId, limit);
  const rows = rawRows.map((row, index) =>
    mapExportRowToPerfil(row, index, fallbackAutor),
  );
  return enrichPerfilRows(rows, rawRows, userId);
}
