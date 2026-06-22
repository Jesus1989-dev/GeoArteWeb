/** Normaliza texto para búsqueda insensible a acentos y mayúsculas. */
export function normalizeSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

export function mapaSearchUrl(input: {
  q?: string;
  alcaldia?: string;
  espacioId?: string;
}): string {
  const params = new URLSearchParams();
  const q = input.q?.trim();
  const alcaldia = input.alcaldia?.trim();
  if (q) params.set("q", q);
  if (alcaldia) params.set("alcaldia", alcaldia);
  if (input.espacioId) params.set("espacio", input.espacioId);
  const query = params.toString();
  return query ? `/mapa?${query}` : "/mapa";
}

/** Resuelve si la consulta corresponde a una alcaldía conocida. */
export function resolveAlcaldiaFromQuery(
  query: string,
  alcaldias: readonly string[],
): string | null {
  const term = normalizeSearchText(query);
  if (!term) return null;

  const exact = alcaldias.find((nombre) => normalizeSearchText(nombre) === term);
  if (exact) return exact;

  const partialMatches = alcaldias.filter((nombre) => {
    const normalized = normalizeSearchText(nombre);
    return normalized.includes(term) || term.includes(normalized);
  });

  if (partialMatches.length === 1) return partialMatches[0] ?? null;

  const startsWith = partialMatches.filter((nombre) =>
    normalizeSearchText(nombre).startsWith(term),
  );
  if (startsWith.length === 1) return startsWith[0] ?? null;

  return null;
}

/** Alcaldía activa en mapa: URL, búsqueda resuelta o filtro avanzado aplicado. */
export function resolveAlcaldiaActiva(
  alcaldiaFromUrl: string,
  busqueda: string,
  alcaldias: readonly string[],
): string | null {
  const fromUrl = alcaldiaFromUrl.trim();
  if (fromUrl) return fromUrl;
  return resolveAlcaldiaFromQuery(busqueda, alcaldias);
}

export function alcaldiasCoincidentes(
  alcaldias: readonly string[],
  query: string,
  limit = 16,
): string[] {
  const term = normalizeSearchText(query);
  if (!term) return [...alcaldias].slice(0, limit);

  return alcaldias
    .filter((nombre) => normalizeSearchText(nombre).includes(term))
    .slice(0, limit);
}
