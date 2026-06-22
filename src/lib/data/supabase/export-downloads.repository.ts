import type { PerfilExportacion } from "@/lib/domain/perfil";
import { mapExportRowToPerfil } from "@/lib/reportes/map-export-download-row";
import { getSupabaseBrowserClient } from "@/lib/data/supabase/client";

type ExportDownloadRow = {
  id?: string;
  file_name: string | null;
  format: string | null;
  meta: string | null;
  created_at: string | null;
};

export async function fetchExportDownloadsForUser(
  userId: string,
  limit = 40,
  fallbackAutor?: string,
): Promise<PerfilExportacion[]> {
  const client = getSupabaseBrowserClient();
  if (!client) return [];

  const { data, error } = await client
    .from("export_downloads")
    .select("id, file_name, format, meta, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Supabase export_downloads: ${error.message}`);
  }

  return ((data ?? []) as ExportDownloadRow[]).map((row, index) =>
    mapExportRowToPerfil(row, index, fallbackAutor),
  );
}
