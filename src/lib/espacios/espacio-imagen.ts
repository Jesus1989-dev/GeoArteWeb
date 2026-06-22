/** Resuelve la URL de imagen del espacio: Storage Supabase primero, SIC como respaldo. */
export function resolveEspacioImagenUrl(input: {
  imagePath?: string | null;
  urlImagenSic?: string | null;
}): string | undefined {
  const primary = input.imagePath?.trim();
  if (primary) return primary;

  const fallback = input.urlImagenSic?.trim();
  if (fallback) return fallback;

  return undefined;
}
