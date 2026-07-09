import type { SupabaseClient } from "@supabase/supabase-js";
import type { EspacioInfraRow } from "@/lib/home/infrastructure-from-espacios";

const CHUNK_SIZE = 1000;
const MAX_CHUNKS = 10;

/** Carga filas mínimas de espacios_culturales para métricas del inicio. */
export async function fetchEspaciosInfraRows(
  client: SupabaseClient,
): Promise<EspacioInfraRow[]> {
  const all: EspacioInfraRow[] = [];
  let from = 0;
  let chunkIndex = 0;

  while (chunkIndex < MAX_CHUNKS) {
    chunkIndex += 1;
    const to = from + CHUNK_SIZE - 1;
    const { data, error } = await client
      .from("espacios_culturales")
      .select(
        "alcaldia, latitud, longitud, created_at, updated_at, fecha_fundacion, sic_fecha_modificacion",
      )
      .order("created_at", { ascending: true })
      .range(from, to);

    if (error) {
      throw new Error(`Supabase espacios_culturales (métricas): ${error.message}`);
    }

    const rows = (data ?? []) as EspacioInfraRow[];
    if (rows.length === 0) break;

    all.push(...rows);
    if (rows.length < CHUNK_SIZE) break;
    from += CHUNK_SIZE;
  }

  return all;
}
