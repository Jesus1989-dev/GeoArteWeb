import { normalizeSearchText } from "@/lib/mapa/search-utils";

export function alcaldiaToSlug(name: string): string {
  return normalizeSearchText(name).replace(/\s+/g, "-");
}

export function resolveAlcaldiaFromApiId(id: string, nombres: string[]): string | null {
  const decoded = decodeURIComponent(id).trim();
  if (!decoded) return null;

  const targetSlug = alcaldiaToSlug(decoded);
  const targetNorm = normalizeSearchText(decoded);

  for (const nombre of nombres) {
    if (alcaldiaToSlug(nombre) === targetSlug) return nombre;
    if (normalizeSearchText(nombre) === targetNorm) return nombre;
  }

  return null;
}
