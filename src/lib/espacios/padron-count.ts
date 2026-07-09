import type { SupabaseClient } from "@supabase/supabase-js";

/** Conteo en vivo de filas en `espacios_culturales` (padrón SECTEI). */
export async function fetchPadronEspaciosCount(
  client: SupabaseClient,
): Promise<number> {
  const { count, error } = await client
    .from("espacios_culturales")
    .select("id", { count: "exact", head: true });

  if (error) {
    throw new Error(`Supabase espacios_culturales (conteo padrón): ${error.message}`);
  }

  return count ?? 0;
}

/** KPI Total Espacios: siempre el padrón vivo, nunca `estadisticas` cacheadas. */
export function resolveTotalEspaciosPadron(livePadronCount: number): number {
  return Math.max(0, livePadronCount);
}
