import { getSupabaseServiceRoleClient } from "@/lib/data/supabase/service-role";
import type { ExportDownloadMeta } from "@/lib/reportes/export-meta";

export const EXPORT_DOWNLOADS_BUCKET = "export-downloads";

export function buildExportStoragePath(
  userId: string,
  exportId: string,
  fileName: string | null | undefined,
): string | null {
  const name = fileName?.trim();
  if (!userId.trim() || !exportId.trim() || !name || exportId.startsWith("local-")) {
    return null;
  }
  return `${userId}/${exportId}/${name}`;
}

export function resolveExportStoragePath(input: {
  parsed: ExportDownloadMeta | null;
  userId: string;
  exportId: string;
  fileName: string | null | undefined;
}): string | null {
  const explicit = input.parsed?.storagePath?.trim();
  if (explicit) return explicit;
  return buildExportStoragePath(input.userId, input.exportId, input.fileName);
}

export async function exportFileExists(storagePath: string): Promise<boolean> {
  const client = getSupabaseServiceRoleClient();
  if (!client) return false;

  const segments = storagePath.split("/");
  const fileName = segments.pop();
  const folder = segments.join("/");
  if (!fileName || !folder) return false;

  const { data, error } = await client.storage
    .from(EXPORT_DOWNLOADS_BUCKET)
    .list(folder, { limit: 20, search: fileName });

  if (error) return false;
  return data?.some((entry) => entry.name === fileName) ?? false;
}

export async function ensureExportDownloadsBucket(): Promise<void> {
  const client = getSupabaseServiceRoleClient();
  if (!client) throw new Error("Service role no configurado");

  const { data: buckets, error: listError } = await client.storage.listBuckets();
  if (listError) throw new Error(`Storage buckets: ${listError.message}`);

  if (buckets?.some((b) => b.name === EXPORT_DOWNLOADS_BUCKET)) return;

  const { error: createError } = await client.storage.createBucket(
    EXPORT_DOWNLOADS_BUCKET,
    { public: false, fileSizeLimit: 52_428_800 },
  );
  if (createError && !createError.message.toLowerCase().includes("already exists")) {
    throw new Error(`Crear bucket export-downloads: ${createError.message}`);
  }
}

export async function uploadExportFile(input: {
  userId: string;
  exportId: string;
  fileName: string;
  bytes: Uint8Array;
  mimeType: string;
}): Promise<string> {
  await ensureExportDownloadsBucket();
  const client = getSupabaseServiceRoleClient();
  if (!client) throw new Error("Service role no configurado");

  const storagePath = `${input.userId}/${input.exportId}/${input.fileName}`;
  const { error } = await client.storage
    .from(EXPORT_DOWNLOADS_BUCKET)
    .upload(storagePath, input.bytes, {
      contentType: input.mimeType,
      upsert: true,
    });

  if (error) throw new Error(`Subir exportación: ${error.message}`);
  return storagePath;
}

export async function downloadExportFile(storagePath: string): Promise<{
  bytes: Uint8Array;
  mimeType: string;
}> {
  const client = getSupabaseServiceRoleClient();
  if (!client) throw new Error("Service role no configurado");

  const { data, error } = await client.storage
    .from(EXPORT_DOWNLOADS_BUCKET)
    .download(storagePath);

  if (error || !data) {
    throw new Error(`Descargar exportación: ${error?.message ?? "sin datos"}`);
  }

  const buffer = await data.arrayBuffer();
  return {
    bytes: new Uint8Array(buffer),
    mimeType: data.type || "application/octet-stream",
  };
}

export async function deleteExportFile(storagePath: string): Promise<void> {
  const client = getSupabaseServiceRoleClient();
  if (!client) throw new Error("Service role no configurado");

  const { error } = await client.storage
    .from(EXPORT_DOWNLOADS_BUCKET)
    .remove([storagePath]);

  if (error) {
    throw new Error(`Eliminar exportación en storage: ${error.message}`);
  }
}
