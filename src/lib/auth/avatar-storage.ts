import type { SupabaseClient } from "@supabase/supabase-js";

/** Bucket Storage para fotos de perfil (misma convención que Flutter). */
export const AVATARS_BUCKET = "avatars";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_EXT = ["jpg", "png", "webp"] as const;

type AvatarExt = (typeof ALLOWED_EXT)[number];

function mimeForExt(ext: AvatarExt): string {
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  return "image/jpeg";
}

function resolveExt(file: File): AvatarExt | null {
  const name = file.name.toLowerCase();
  if (name.endsWith(".png") || file.type === "image/png") return "png";
  if (name.endsWith(".webp") || file.type === "image/webp") return "webp";
  if (
    name.endsWith(".jpg") ||
    name.endsWith(".jpeg") ||
    file.type === "image/jpeg"
  ) {
    return "jpg";
  }
  return null;
}

function publicUrlWithCacheBuster(client: SupabaseClient, path: string): string {
  const { data } = client.storage.from(AVATARS_BUCKET).getPublicUrl(path);
  const base = data.publicUrl;
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}t=${Date.now()}`;
}

async function removeOtherAvatarVariants(
  client: SupabaseClient,
  userId: string,
  keepExt: AvatarExt,
): Promise<void> {
  const bucket = client.storage.from(AVATARS_BUCKET);
  const toRemove = ALLOWED_EXT.filter((e) => e !== keepExt).map(
    (e) => `${userId}/avatar.${e}`,
  );
  if (toRemove.length === 0) return;
  const { error } = await bucket.remove(toRemove);
  if (error) {
    console.warn("[avatar] remove variantes:", error.message);
  }
}

/**
 * Sube la imagen a `{userId}/avatar.{ext}` y devuelve la URL pública con cache-buster.
 * Alineado con `SupabaseService.uploadAvatarImage` en la app móvil.
 */
export async function uploadAvatarImage(
  client: SupabaseClient,
  userId: string,
  file: File,
): Promise<string> {
  if (!file.size) {
    throw new Error("Selecciona una imagen válida.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("La imagen no puede superar 5 MB.");
  }

  const ext = resolveExt(file);
  if (ext == null) {
    throw new Error("Formato no permitido. Usa JPG, PNG o WebP.");
  }

  const path = `${userId}/avatar.${ext}`;
  const bucket = client.storage.from(AVATARS_BUCKET);

  await removeOtherAvatarVariants(client, userId, ext);

  const { error: uploadError } = await bucket.upload(path, file, {
    contentType: mimeForExt(ext),
    upsert: true,
  });

  if (uploadError) {
    throw new Error(`No se pudo subir la foto: ${uploadError.message}`);
  }

  return publicUrlWithCacheBuster(client, path);
}
