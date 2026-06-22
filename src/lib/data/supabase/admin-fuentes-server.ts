import type { SupabaseClient } from "@supabase/supabase-js";
import type { AdminFuenteFormInput } from "@/lib/domain/admin";
import type {
  FuenteInformacion,
  FuenteInformacionTipoEstado,
} from "@/lib/domain/fuentes-informacion";
import { mapFuenteRow, type FuenteDbRow } from "@/lib/data/supabase/fuentes-informacion.repository";

function mapTipoEstado(raw: string): FuenteInformacionTipoEstado {
  if (raw === "estatico" || raw === "api" || raw === "procesado") return raw;
  return "activo";
}

function normalizeFuenteInput(input: AdminFuenteFormInput): {
  payload: Record<string, unknown>;
  error?: string;
} {
  const institucion = input.institucion?.trim() ?? "";
  const dataset = input.dataset?.trim() ?? "";
  const estado = input.estado?.trim() ?? "";

  if (!institucion) return { payload: {}, error: "La institución es obligatoria" };
  if (!dataset) return { payload: {}, error: "El dataset es obligatorio" };
  if (!estado) return { payload: {}, error: "El estado es obligatorio" };

  const tipo = mapTipoEstado(input.tipoEstado ?? "activo");
  const url = input.urlFuente?.trim();

  return {
    payload: {
      institucion,
      dataset,
      estado,
      tipo_estado: tipo,
      url_fuente: url === "" ? null : url ?? null,
      orden: input.orden ?? 0,
      activo: input.activo ?? true,
      updated_at: new Date().toISOString(),
    },
  };
}

export async function listFuentesAdmin(admin: SupabaseClient): Promise<FuenteInformacion[]> {
  const { data, error } = await admin
    .from("fuentes_informacion")
    .select(
      "id, institucion, dataset, estado, tipo_estado, url_fuente, ultima_sincronizacion, orden, activo",
    )
    .order("orden", { ascending: true });

  if (error) throw new Error(error.message);
  return ((data ?? []) as FuenteDbRow[]).map(mapFuenteRow);
}

export async function createFuenteAdmin(
  admin: SupabaseClient,
  input: AdminFuenteFormInput,
): Promise<{ row?: FuenteInformacion; error?: string }> {
  const normalized = normalizeFuenteInput(input);
  if (normalized.error) return { error: normalized.error };

  const { data, error } = await admin
    .from("fuentes_informacion")
    .insert(normalized.payload)
    .select(
      "id, institucion, dataset, estado, tipo_estado, url_fuente, ultima_sincronizacion",
    )
    .single();

  if (error) return { error: error.message };
  return { row: mapFuenteRow(data as FuenteDbRow) };
}

export async function updateFuenteAdmin(
  admin: SupabaseClient,
  id: string,
  input: AdminFuenteFormInput,
): Promise<{ row?: FuenteInformacion; error?: string }> {
  const normalized = normalizeFuenteInput(input);
  if (normalized.error) return { error: normalized.error };

  const { data, error } = await admin
    .from("fuentes_informacion")
    .update(normalized.payload)
    .eq("id", id)
    .select(
      "id, institucion, dataset, estado, tipo_estado, url_fuente, ultima_sincronizacion",
    )
    .maybeSingle();

  if (error) return { error: error.message };
  if (!data) return { error: "Fuente no encontrada" };
  return { row: mapFuenteRow(data as FuenteDbRow) };
}

export async function deleteFuenteAdmin(
  admin: SupabaseClient,
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  const { error, count } = await admin
    .from("fuentes_informacion")
    .delete({ count: "exact" })
    .eq("id", id);

  if (error) return { ok: false, error: error.message };
  if ((count ?? 0) === 0) return { ok: false, error: "Fuente no encontrada" };
  return { ok: true };
}
