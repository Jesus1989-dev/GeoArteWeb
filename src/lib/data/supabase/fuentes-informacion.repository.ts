import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  FuenteInformacion,
  FuenteInformacionTipoEstado,
} from "@/lib/domain/fuentes-informacion";
import { createSupabasePublicClient } from "@/lib/data/supabase/server-public";

export type FuenteDbRow = {
  id: string;
  institucion: string;
  dataset: string;
  estado: string;
  tipo_estado: string;
  url_fuente: string | null;
  ultima_sincronizacion: string | null;
  orden?: number;
  activo?: boolean;
};

function mapTipoEstado(raw: string): FuenteInformacionTipoEstado {
  if (raw === "estatico" || raw === "api" || raw === "procesado") return raw;
  return "activo";
}

export function mapFuenteRow(row: FuenteDbRow): FuenteInformacion {
  return {
    id: row.id,
    institucion: row.institucion.trim(),
    dataset: row.dataset.trim(),
    estado: row.estado.trim(),
    tipoEstado: mapTipoEstado(row.tipo_estado),
    urlFuente: row.url_fuente?.trim() || null,
    ultimaSincronizacion: row.ultima_sincronizacion,
  };
}

export async function fetchFuentesInformacion(
  client: SupabaseClient,
): Promise<FuenteInformacion[]> {
  const { data, error } = await client
    .from("fuentes_informacion")
    .select(
      "id, institucion, dataset, estado, tipo_estado, url_fuente, ultima_sincronizacion",
    )
    .eq("activo", true)
    .order("orden", { ascending: true });

  if (error) {
    throw new Error(`Supabase fuentes_informacion: ${error.message}`);
  }

  return ((data ?? []) as FuenteDbRow[]).map(mapFuenteRow);
}

export async function fetchFuentesInformacionFromServer(): Promise<FuenteInformacion[]> {
  const client = createSupabasePublicClient();
  return fetchFuentesInformacion(client);
}
