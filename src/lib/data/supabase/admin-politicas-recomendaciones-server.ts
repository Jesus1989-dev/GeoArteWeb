import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  AdminPoliticaObjetivoId,
  AdminPoliticaRecomendacionFormInput,
  AdminPoliticaRecomendacionRow,
} from "@/lib/domain/admin";
import type { PrioridadAccion } from "@/lib/domain/politicas";

const OBJETIVOS: AdminPoliticaObjetivoId[] = [
  "genero",
  "periferias",
  "digitalizacion",
  "economia",
];

const PRIORIDADES: PrioridadAccion[] = [
  "Prioridad Alta",
  "Prioridad Media",
  "Prioridad Baja",
];

type PoliticaDbRow = {
  id: string;
  objetivo_id: string;
  titulo: string;
  prioridad: string;
  costo_nivel: number;
  alcaldia: string;
  descripcion: string;
  impacto: string;
  impacto_ciudadanos: number | null;
  presupuesto_mxn: number | null;
  orden: number;
  activo: boolean;
};

function mapObjetivo(raw: string): AdminPoliticaObjetivoId | null {
  return OBJETIVOS.includes(raw as AdminPoliticaObjetivoId)
    ? (raw as AdminPoliticaObjetivoId)
    : null;
}

function mapPrioridad(raw: string): PrioridadAccion | null {
  return PRIORIDADES.includes(raw as PrioridadAccion)
    ? (raw as PrioridadAccion)
    : null;
}

function mapRow(row: PoliticaDbRow): AdminPoliticaRecomendacionRow | null {
  const objetivoId = mapObjetivo(row.objetivo_id);
  const prioridad = mapPrioridad(row.prioridad);
  if (!objetivoId || !prioridad) return null;

  const costo = Number(row.costo_nivel);
  const costoNivel = (costo >= 1 && costo <= 3 ? costo : 1) as 1 | 2 | 3;

  return {
    id: row.id,
    objetivoId,
    titulo: row.titulo,
    prioridad,
    costoNivel,
    alcaldia: row.alcaldia,
    descripcion: row.descripcion,
    impacto: row.impacto,
    impactoCiudadanos:
      row.impacto_ciudadanos != null ? Number(row.impacto_ciudadanos) : null,
    presupuestoMxn: row.presupuesto_mxn != null ? Number(row.presupuesto_mxn) : null,
    orden: Number(row.orden) || 0,
    activo: Boolean(row.activo),
  };
}

function normalizePoliticaInput(
  input: AdminPoliticaRecomendacionFormInput,
  options?: { requireId?: boolean },
): { payload: Record<string, unknown>; error?: string } {
  const id = input.id?.trim().toLowerCase() ?? "";
  const titulo = input.titulo?.trim() ?? "";
  const alcaldia = input.alcaldia?.trim() ?? "";
  const descripcion = input.descripcion?.trim() ?? "";
  const impacto = input.impacto?.trim() ?? "";

  if (options?.requireId !== false && !id) {
    return { payload: {}, error: "El identificador (id) es obligatorio" };
  }
  if (id && !/^[a-z][a-z0-9]{0,31}$/.test(id)) {
    return {
      payload: {},
      error: "El id debe ser minúsculas y alfanumérico (ej. g3, p4)",
    };
  }

  const objetivoId = mapObjetivo(input.objetivoId);
  if (!objetivoId) return { payload: {}, error: "Objetivo inválido" };

  const prioridad = mapPrioridad(input.prioridad);
  if (!prioridad) return { payload: {}, error: "Prioridad inválida" };

  if (!titulo) return { payload: {}, error: "El título es obligatorio" };
  if (!alcaldia) return { payload: {}, error: "La alcaldía es obligatoria" };
  if (!descripcion) return { payload: {}, error: "La descripción es obligatoria" };
  if (!impacto) return { payload: {}, error: "El impacto (texto) es obligatorio" };

  const costo = Number(input.costoNivel);
  if (!Number.isFinite(costo) || costo < 1 || costo > 3) {
    return { payload: {}, error: "El costo debe ser entre 1 y 3" };
  }

  const impactoCiudadanos = input.impactoCiudadanos;
  if (
    impactoCiudadanos != null &&
    (!Number.isFinite(impactoCiudadanos) || impactoCiudadanos < 0)
  ) {
    return { payload: {}, error: "Ciudadanos beneficiados inválido" };
  }

  const presupuestoMxn = input.presupuestoMxn;
  if (presupuestoMxn != null && (!Number.isFinite(presupuestoMxn) || presupuestoMxn < 0)) {
    return { payload: {}, error: "Presupuesto MXN inválido" };
  }

  const payload: Record<string, unknown> = {
    objetivo_id: objetivoId,
    titulo,
    prioridad,
    costo_nivel: Math.round(costo),
    alcaldia,
    descripcion,
    impacto,
    impacto_ciudadanos: impactoCiudadanos,
    presupuesto_mxn: presupuestoMxn != null ? Math.round(presupuestoMxn) : null,
    orden: Math.max(0, Math.round(Number(input.orden) || 0)),
    activo: input.activo ?? true,
    updated_at: new Date().toISOString(),
  };

  if (id) payload.id = id;

  return { payload };
}

const SELECT_COLS =
  "id, objetivo_id, titulo, prioridad, costo_nivel, alcaldia, descripcion, impacto, impacto_ciudadanos, presupuesto_mxn, orden, activo";

export async function listPoliticasRecomendacionesAdmin(
  admin: SupabaseClient,
): Promise<AdminPoliticaRecomendacionRow[]> {
  const { data, error } = await admin
    .from("politicas_recomendaciones")
    .select(SELECT_COLS)
    .order("objetivo_id", { ascending: true })
    .order("orden", { ascending: true })
    .order("id", { ascending: true });

  if (error) throw new Error(error.message);

  return ((data ?? []) as PoliticaDbRow[])
    .map(mapRow)
    .filter((row): row is AdminPoliticaRecomendacionRow => row != null);
}

export async function createPoliticaRecomendacionAdmin(
  admin: SupabaseClient,
  input: AdminPoliticaRecomendacionFormInput,
): Promise<{ row?: AdminPoliticaRecomendacionRow; error?: string }> {
  const normalized = normalizePoliticaInput(input, { requireId: true });
  if (normalized.error) return { error: normalized.error };

  const { data, error } = await admin
    .from("politicas_recomendaciones")
    .insert(normalized.payload)
    .select(SELECT_COLS)
    .single();

  if (error) {
    if (error.code === "23505") {
      return { error: "Ya existe una recomendación con ese id" };
    }
    return { error: error.message };
  }

  const row = mapRow(data as PoliticaDbRow);
  if (!row) return { error: "Datos guardados con formato inválido" };
  return { row };
}

export async function updatePoliticaRecomendacionAdmin(
  admin: SupabaseClient,
  id: string,
  input: AdminPoliticaRecomendacionFormInput,
): Promise<{ row?: AdminPoliticaRecomendacionRow; error?: string }> {
  const normalized = normalizePoliticaInput(
    { ...input, id },
    { requireId: false },
  );
  if (normalized.error) return { error: normalized.error };

  const { id: _ignored, ...updatePayload } = normalized.payload;

  const { data, error } = await admin
    .from("politicas_recomendaciones")
    .update(updatePayload)
    .eq("id", id)
    .select(SELECT_COLS)
    .maybeSingle();

  if (error) return { error: error.message };
  if (!data) return { error: "Recomendación no encontrada" };

  const row = mapRow(data as PoliticaDbRow);
  if (!row) return { error: "Datos guardados con formato inválido" };
  return { row };
}

/** Desactiva en público (activo=false); no borra el registro. */
export async function setPoliticaRecomendacionActivoAdmin(
  admin: SupabaseClient,
  id: string,
  activo: boolean,
): Promise<{ ok: boolean; error?: string }> {
  const { data, error } = await admin
    .from("politicas_recomendaciones")
    .update({ activo, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) return { ok: false, error: error.message };
  if (!data) return { ok: false, error: "Recomendación no encontrada" };
  return { ok: true };
}
