import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  AdminRecursoCualitativoFormInput,
  AdminRecursoCualitativoRow,
} from "@/lib/domain/admin";
import type { TipoRecursoDb } from "@/lib/domain/investigacion";
import { parseTranscripcion } from "@/lib/investigacion/tipo-recurso";

const TIPOS: TipoRecursoDb[] = ["entrevista", "encuesta", "grupo_focal"];

type RecursoDbRow = {
  id: string;
  tipo: string;
  fecha: string;
  titulo: string;
  alcaldia: string;
  snippet: string;
  verificado: boolean;
  digitalizado: boolean;
  investigador: string;
  fecha_detalle: string;
  resumen: string;
  transcripcion: unknown;
  lat: number | null;
  lng: number | null;
  orden: number;
  activo: boolean;
};

function mapTipo(raw: string): TipoRecursoDb | null {
  return TIPOS.includes(raw as TipoRecursoDb) ? (raw as TipoRecursoDb) : null;
}

function mapRow(row: RecursoDbRow): AdminRecursoCualitativoRow | null {
  const tipo = mapTipo(row.tipo);
  if (!tipo) return null;

  const lat = row.lat != null ? Number(row.lat) : null;
  const lng = row.lng != null ? Number(row.lng) : null;

  return {
    id: row.id,
    tipo,
    fecha: row.fecha,
    titulo: row.titulo,
    alcaldia: row.alcaldia,
    snippet: row.snippet,
    verificado: Boolean(row.verificado),
    digitalizado: Boolean(row.digitalizado),
    investigador: row.investigador,
    fechaDetalle: row.fecha_detalle,
    resumen: row.resumen,
    transcripcion: parseTranscripcion(row.transcripcion),
    lat: Number.isFinite(lat) ? lat : null,
    lng: Number.isFinite(lng) ? lng : null,
    orden: Number(row.orden) || 0,
    activo: Boolean(row.activo),
  };
}

function normalizeInput(
  input: AdminRecursoCualitativoFormInput,
  options?: { requireId?: boolean },
): { payload: Record<string, unknown>; error?: string } {
  const id = input.id?.trim().toLowerCase() ?? "";
  const titulo = input.titulo?.trim() ?? "";
  const alcaldia = input.alcaldia?.trim() ?? "";
  const snippet = input.snippet?.trim() ?? "";
  const fecha = input.fecha?.trim() ?? "";
  const investigador = input.investigador?.trim() ?? "";
  const fechaDetalle = input.fechaDetalle?.trim() ?? "";
  const resumen = input.resumen?.trim() ?? "";

  if (options?.requireId !== false && !id) {
    return { payload: {}, error: "El identificador (id) es obligatorio" };
  }
  if (id && !/^[a-z][a-z0-9]{0,31}$/.test(id)) {
    return {
      payload: {},
      error: "El id debe ser minúsculas y alfanumérico (ej. c6, enc01)",
    };
  }

  const tipo = mapTipo(input.tipo);
  if (!tipo) return { payload: {}, error: "Tipo de recurso inválido" };
  if (!titulo) return { payload: {}, error: "El título es obligatorio" };
  if (!alcaldia) return { payload: {}, error: "La alcaldía es obligatoria" };
  if (!snippet) return { payload: {}, error: "El fragmento (snippet) es obligatorio" };
  if (!fecha) return { payload: {}, error: "La fecha de listado es obligatoria" };
  if (!investigador) return { payload: {}, error: "El investigador es obligatorio" };
  if (!fechaDetalle) return { payload: {}, error: "La fecha de detalle es obligatoria" };
  if (!resumen) return { payload: {}, error: "El resumen es obligatorio" };

  const transcripcion = input.transcripcion ?? [];
  if (transcripcion.length === 0) {
    return { payload: {}, error: "Agrega al menos un bloque de transcripción" };
  }

  const lat = input.lat;
  const lng = input.lng;
  if (lat != null && !Number.isFinite(lat)) {
    return { payload: {}, error: "Latitud inválida" };
  }
  if (lng != null && !Number.isFinite(lng)) {
    return { payload: {}, error: "Longitud inválida" };
  }

  const payload: Record<string, unknown> = {
    tipo,
    fecha,
    titulo,
    alcaldia,
    snippet,
    verificado: Boolean(input.verificado),
    digitalizado: Boolean(input.digitalizado),
    investigador,
    fecha_detalle: fechaDetalle,
    resumen,
    transcripcion,
    lat,
    lng,
    orden: Math.max(0, Math.round(Number(input.orden) || 0)),
    activo: input.activo ?? true,
    updated_at: new Date().toISOString(),
  };

  if (id) payload.id = id;

  return { payload };
}

const SELECT_COLS =
  "id, tipo, fecha, titulo, alcaldia, snippet, verificado, digitalizado, investigador, fecha_detalle, resumen, transcripcion, lat, lng, orden, activo";

export async function listRecursosCualitativosAdmin(
  admin: SupabaseClient,
): Promise<AdminRecursoCualitativoRow[]> {
  const { data, error } = await admin
    .from("recursos_cualitativos")
    .select(SELECT_COLS)
    .order("orden", { ascending: true })
    .order("id", { ascending: true });

  if (error) throw new Error(error.message);

  return ((data ?? []) as RecursoDbRow[])
    .map(mapRow)
    .filter((row): row is AdminRecursoCualitativoRow => row != null);
}

export async function createRecursoCualitativoAdmin(
  admin: SupabaseClient,
  input: AdminRecursoCualitativoFormInput,
): Promise<{ row?: AdminRecursoCualitativoRow; error?: string }> {
  const normalized = normalizeInput(input, { requireId: true });
  if (normalized.error) return { error: normalized.error };

  const { data, error } = await admin
    .from("recursos_cualitativos")
    .insert(normalized.payload)
    .select(SELECT_COLS)
    .single();

  if (error) {
    if (error.code === "23505") {
      return { error: "Ya existe un recurso con ese id" };
    }
    return { error: error.message };
  }

  const row = mapRow(data as RecursoDbRow);
  if (!row) return { error: "Datos guardados con formato inválido" };
  return { row };
}

export async function updateRecursoCualitativoAdmin(
  admin: SupabaseClient,
  id: string,
  input: AdminRecursoCualitativoFormInput,
): Promise<{ row?: AdminRecursoCualitativoRow; error?: string }> {
  const normalized = normalizeInput({ ...input, id }, { requireId: false });
  if (normalized.error) return { error: normalized.error };

  const { id: _ignored, ...updatePayload } = normalized.payload;

  const { data, error } = await admin
    .from("recursos_cualitativos")
    .update(updatePayload)
    .eq("id", id)
    .select(SELECT_COLS)
    .maybeSingle();

  if (error) return { error: error.message };
  if (!data) return { error: "Recurso no encontrado" };

  const row = mapRow(data as RecursoDbRow);
  if (!row) return { error: "Datos guardados con formato inválido" };
  return { row };
}

export async function setRecursoCualitativoActivoAdmin(
  admin: SupabaseClient,
  id: string,
  activo: boolean,
): Promise<{ ok: boolean; error?: string }> {
  const { data, error } = await admin
    .from("recursos_cualitativos")
    .update({ activo, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) return { ok: false, error: error.message };
  if (!data) return { ok: false, error: "Recurso no encontrado" };
  return { ok: true };
}
