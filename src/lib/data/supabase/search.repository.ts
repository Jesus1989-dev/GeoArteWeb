import type { SupabaseClient } from "@supabase/supabase-js";
import { espaciosMock } from "@/lib/data/mock/mapa";
import type { EspacioSearchResponse, EspacioSearchSuggestion } from "@/lib/domain/search";
import { filterAlcaldias } from "@/lib/mapa/filter-espacios";
import { normalizeSearchText } from "@/lib/mapa/search-utils";
import { isSupabaseConfigured } from "@/lib/data/supabase/config";
import { getSupabaseBrowserClient } from "@/lib/data/supabase/client";

const CDMX_ALCALDIAS = [
  "Álvaro Obregón",
  "Azcapotzalco",
  "Benito Juárez",
  "Coyoacán",
  "Cuajimalpa de Morelos",
  "Cuauhtémoc",
  "Gustavo A. Madero",
  "Iztacalco",
  "Iztapalapa",
  "La Magdalena Contreras",
  "Miguel Hidalgo",
  "Milpa Alta",
  "Tláhuac",
  "Tlalpan",
  "Venustiano Carranza",
  "Xochimilco",
];

function sanitizeIlikeTerm(term: string): string {
  return term.replace(/[%_,]/g, " ").trim();
}

function buildAlcaldiaSuggestions(alcaldias: string[], query: string): EspacioSearchSuggestion[] {
  return filterAlcaldias(alcaldias, query, 5).map((nombre) => ({
    id: `alcaldia-${nombre}`,
    label: nombre,
    subtitle: "Alcaldía · CDMX",
    kind: "alcaldia" as const,
  }));
}

function searchMock(query: string, alcaldias: string[]): EspacioSearchResponse {
  const term = normalizeSearchText(query);
  const suggestions: EspacioSearchSuggestion[] = [...buildAlcaldiaSuggestions(alcaldias, query)];

  for (const espacio of espaciosMock) {
    const haystack = normalizeSearchText(`${espacio.nombre} ${espacio.direccion}`);
    if (!haystack.includes(term)) continue;
    suggestions.push({
      id: espacio.id,
      label: espacio.nombre,
      subtitle: espacio.direccion,
      kind: "espacio",
      espacioId: espacio.id,
    });
    if (suggestions.length >= 10) break;
  }

  return { suggestions, dataSource: "mock" };
}

export async function searchEspaciosCulturalesWithClient(
  client: SupabaseClient,
  query: string,
  alcaldiasSeed: string[] = CDMX_ALCALDIAS,
): Promise<EspacioSearchResponse> {
  const term = sanitizeIlikeTerm(query);
  if (term.length < 2) {
    return { suggestions: [], dataSource: "supabase" };
  }

  const pattern = `%${term}%`;

  const [espaciosRes, alcaldiasRes] = await Promise.all([
    client
      .from("espacios_culturales")
      .select("id, nombre, alcaldia, direccion")
      .or(`nombre.ilike.${pattern},alcaldia.ilike.${pattern},direccion.ilike.${pattern}`)
      .not("latitud", "is", null)
      .order("nombre", { ascending: true })
      .limit(6),
    client
      .from("alcaldias")
      .select("nombre")
      .ilike("nombre", pattern)
      .order("nombre", { ascending: true })
      .limit(5),
  ]);

  if (espaciosRes.error) {
    throw new Error(`Supabase búsqueda espacios: ${espaciosRes.error.message}`);
  }

  const suggestions: EspacioSearchSuggestion[] = [];

  for (const row of alcaldiasRes.data ?? []) {
    const nombre = String(row.nombre ?? "").trim();
    if (!nombre) continue;
    suggestions.push({
      id: `alcaldia-${nombre}`,
      label: nombre,
      subtitle: "Alcaldía · CDMX",
      kind: "alcaldia",
    });
  }

  if (suggestions.length === 0) {
    suggestions.push(...buildAlcaldiaSuggestions(alcaldiasSeed, query));
  }

  for (const row of espaciosRes.data ?? []) {
    const id = String(row.id ?? "");
    const nombre = String(row.nombre ?? "Sin nombre").trim();
    if (!id || !nombre) continue;
    suggestions.push({
      id,
      label: nombre,
      subtitle: String(row.alcaldia ?? row.direccion ?? "CDMX").trim(),
      kind: "espacio",
      espacioId: id,
    });
  }

  if (suggestions.length === 0) {
    return searchMock(term, alcaldiasSeed);
  }

  return {
    suggestions: mergeSearchSuggestions(suggestions).slice(0, 10),
    dataSource: "supabase",
  };
}

export async function searchEspaciosCulturales(
  query: string,
  alcaldiasSeed: string[] = CDMX_ALCALDIAS,
): Promise<EspacioSearchResponse> {
  const term = sanitizeIlikeTerm(query);
  if (term.length < 2) {
    return { suggestions: [], dataSource: isSupabaseConfigured() ? "supabase" : "mock" };
  }

  if (!isSupabaseConfigured()) {
    return searchMock(term, alcaldiasSeed);
  }

  const client = getSupabaseBrowserClient();
  if (!client) return searchMock(term, alcaldiasSeed);

  return searchEspaciosCulturalesWithClient(client, query, alcaldiasSeed);
}

function mergeSearchSuggestions(items: EspacioSearchSuggestion[]): EspacioSearchSuggestion[] {
  const alcaldias = items.filter((item) => item.kind === "alcaldia");
  const espacios = items.filter((item) => item.kind === "espacio");
  const seen = new Set<string>();
  const merged: EspacioSearchSuggestion[] = [];

  for (const item of [...alcaldias, ...espacios]) {
    const key = `${item.kind}:${item.label}`;
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(item);
  }

  return merged;
}

export { CDMX_ALCALDIAS };

export function listAlcaldiasForPicker(alcaldias: string[] = CDMX_ALCALDIAS): EspacioSearchSuggestion[] {
  return alcaldias.map((nombre) => ({
    id: `alcaldia-${nombre}`,
    label: nombre,
    subtitle: "Alcaldía · CDMX",
    kind: "alcaldia" as const,
  }));
}
