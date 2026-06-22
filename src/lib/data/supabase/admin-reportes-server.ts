import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  AdminReportePlantillaFormInput,
  AdminReportePlantillaRow,
  AdminReportesCentroConfigFormInput,
} from "@/lib/domain/admin";
import { parsePlantillaFiltrosDefault } from "@/lib/reportes/plantilla-filtros";

const FORMATOS = new Set(["PDF", "CSV", "XLSX"]);

type PlantillaDbRow = {
  id: string;
  titulo: string;
  descripcion: string;
  categoria: string;
  formatos: string[] | null;
  filtros_default: unknown;
  orden: number | null;
  activo: boolean | null;
};

function stringifyFiltrosDefault(raw: unknown): string {
  const parsed = parsePlantillaFiltrosDefault(raw);
  return JSON.stringify(parsed, null, 2);
}

function mapPlantillaRow(row: PlantillaDbRow): AdminReportePlantillaRow {
  return {
    id: row.id,
    titulo: row.titulo,
    descripcion: row.descripcion,
    categoria: row.categoria,
    formatos: (row.formatos ?? []).map((f) => f.toUpperCase()),
    filtrosDefaultJson: stringifyFiltrosDefault(row.filtros_default),
    orden: Number(row.orden) || 0,
    activo: Boolean(row.activo),
  };
}

function normalizePlantillaInput(
  input: AdminReportePlantillaFormInput,
  options?: { requireId?: boolean },
): { payload: Record<string, unknown>; error?: string } {
  const id = input.id?.trim().toLowerCase() ?? "";
  const titulo = input.titulo?.trim() ?? "";
  const descripcion = input.descripcion?.trim() ?? "";
  const categoria = input.categoria?.trim() ?? "";
  const orden = Number(input.orden);

  if (options?.requireId !== false && !id) {
    return { payload: {}, error: "El identificador (id) es obligatorio" };
  }
  if (id && !/^p[a-z0-9_-]{0,31}$/.test(id)) {
    return { payload: {}, error: "El id debe comenzar con p y ser alfanumérico (ej. p4)" };
  }
  if (!titulo) return { payload: {}, error: "El título es obligatorio" };
  if (!descripcion) return { payload: {}, error: "La descripción es obligatoria" };
  if (!categoria) return { payload: {}, error: "La categoría es obligatoria" };

  const formatos = [...new Set((input.formatos ?? []).map((f) => f.toUpperCase()))];
  if (formatos.length === 0) {
    return { payload: {}, error: "Selecciona al menos un formato" };
  }
  if (!formatos.every((f) => FORMATOS.has(f))) {
    return { payload: {}, error: "Formatos permitidos: PDF, CSV, XLSX" };
  }

  let filtrosDefault: unknown;
  try {
    filtrosDefault = JSON.parse(input.filtrosDefaultJson?.trim() || "{}");
  } catch {
    return { payload: {}, error: "filtros_default debe ser JSON válido" };
  }
  parsePlantillaFiltrosDefault(filtrosDefault);

  return {
    payload: {
      ...(id ? { id } : {}),
      titulo,
      descripcion,
      categoria,
      formatos,
      filtros_default: filtrosDefault,
      orden: Number.isFinite(orden) ? orden : 0,
      activo: Boolean(input.activo),
      updated_at: new Date().toISOString(),
    },
  };
}

export async function listReportePlantillasAdmin(
  client: SupabaseClient,
): Promise<AdminReportePlantillaRow[]> {
  const { data, error } = await client
    .from("reporte_plantillas")
    .select("id, titulo, descripcion, categoria, formatos, filtros_default, orden, activo")
    .order("orden", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => mapPlantillaRow(row as PlantillaDbRow));
}

export async function createReportePlantillaAdmin(
  client: SupabaseClient,
  input: AdminReportePlantillaFormInput,
): Promise<{ row?: AdminReportePlantillaRow; error?: string }> {
  const normalized = normalizePlantillaInput(input, { requireId: true });
  if (normalized.error) return { error: normalized.error };

  const { data, error } = await client
    .from("reporte_plantillas")
    .insert(normalized.payload)
    .select("id, titulo, descripcion, categoria, formatos, filtros_default, orden, activo")
    .single();

  if (error) {
    if (error.code === "23505") return { error: "Ya existe una plantilla con ese id" };
    return { error: error.message };
  }

  return { row: mapPlantillaRow(data as PlantillaDbRow) };
}

export async function updateReportePlantillaAdmin(
  client: SupabaseClient,
  id: string,
  input: AdminReportePlantillaFormInput,
): Promise<{ row?: AdminReportePlantillaRow; error?: string }> {
  const normalized = normalizePlantillaInput(
    { ...input, id },
    { requireId: false },
  );
  if (normalized.error) return { error: normalized.error };

  const payload = { ...normalized.payload };
  delete payload.id;

  const { data, error } = await client
    .from("reporte_plantillas")
    .update(payload)
    .eq("id", id)
    .select("id, titulo, descripcion, categoria, formatos, filtros_default, orden, activo")
    .maybeSingle();

  if (error) return { error: error.message };
  if (!data) return { error: "Plantilla no encontrada" };

  return { row: mapPlantillaRow(data as PlantillaDbRow) };
}

export async function setReportePlantillaActivoAdmin(
  client: SupabaseClient,
  id: string,
  activo: boolean,
): Promise<{ ok: boolean; error?: string }> {
  const { data, error } = await client
    .from("reporte_plantillas")
    .update({ activo, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) return { ok: false, error: error.message };
  if (!data) return { ok: false, error: "Plantilla no encontrada" };
  return { ok: true };
}

export async function getReportesCentroConfigAdmin(
  client: SupabaseClient,
): Promise<AdminReportesCentroConfigFormInput> {
  const { data, error } = await client
    .from("reportes_centro_config")
    .select("ayuda_texto, ayuda_enlace_label, ayuda_enlace_href")
    .eq("id", "default")
    .maybeSingle();

  if (error) throw new Error(error.message);

  return {
    ayudaTexto:
      String(data?.ayuda_texto ?? "").trim() ||
      "Genera informes PDF, CSV o Excel con filtros propios.",
    ayudaEnlaceLabel:
      String(data?.ayuda_enlace_label ?? "").trim() || "Ver historial en Mi perfil",
    ayudaEnlaceHref: String(data?.ayuda_enlace_href ?? "").trim() || "/perfil",
  };
}

export async function updateReportesCentroConfigAdmin(
  client: SupabaseClient,
  input: AdminReportesCentroConfigFormInput,
): Promise<{ config?: AdminReportesCentroConfigFormInput; error?: string }> {
  const ayudaTexto = input.ayudaTexto?.trim() ?? "";
  const ayudaEnlaceLabel = input.ayudaEnlaceLabel?.trim() ?? "";
  const ayudaEnlaceHref = input.ayudaEnlaceHref?.trim() ?? "";

  if (!ayudaTexto) return { error: "El texto de ayuda es obligatorio" };
  if (!ayudaEnlaceLabel) return { error: "La etiqueta del enlace es obligatoria" };
  if (!ayudaEnlaceHref) return { error: "La URL del enlace es obligatoria" };

  const { error } = await client.from("reportes_centro_config").upsert({
    id: "default",
    ayuda_texto: ayudaTexto,
    ayuda_enlace_label: ayudaEnlaceLabel,
    ayuda_enlace_href: ayudaEnlaceHref,
    updated_at: new Date().toISOString(),
  });

  if (error) return { error: error.message };

  return {
    config: {
      ayudaTexto,
      ayudaEnlaceLabel,
      ayudaEnlaceHref,
    },
  };
}
