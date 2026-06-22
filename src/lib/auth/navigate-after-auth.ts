/**
 * Tras login/logout con Supabase, la navegación cliente (router.push) puede
 * desincronizar cookies SSR y middleware (común en Vercel/producción).
 * Un reload completo evita quedar atascado en login o dentro de la app.
 */
export function navigateAfterAuth(
  destination: string,
  options?: { usesSupabase?: boolean; replace?: boolean },
): boolean {
  const usesSupabase = options?.usesSupabase ?? true;
  if (!usesSupabase || typeof window === "undefined") {
    return false;
  }

  if (options?.replace) {
    window.location.replace(destination);
  } else {
    window.location.assign(destination);
  }
  return true;
}
