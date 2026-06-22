import type { SupabaseClient } from "@supabase/supabase-js";
import type { AdminEspacioFormInput, AdminEspacioRow } from "@/lib/domain/admin";
import { normalizeEspacioFormInput, type EspacioDbPayload } from "@/lib/admin/espacio-form";
import {
  deriveEstadoEspacio,
  getEspacioPublishBlocker,
  resolveCamposPublicacion,
} from "@/lib/espacios/espacio-registro";

type EspacioDbRow = {
  id: string;
  nombre: string | null;
  direccion: string | null;
  alcaldia: string | null;
  tipo: string | null;
  horario: string | null;
  telefono: string | null;
  latitud: number | null;
  longitud: number | null;
  descripcion: string | null;
  updated_at: string | null;
};

function formatUltimaModif(iso: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";

  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return "Hace un momento";
  if (diffMin < 60) return `Hace ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `Hace ${diffH} h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD === 1) return "Ayer";
  if (diffD < 30) return `Hace ${diffD} días`;
  return date.toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function mapEspacioDbRow(row: EspacioDbRow): AdminEspacioRow {
  return {
    id: row.id.slice(0, 8).toUpperCase(),
    fullId: row.id,
    nombre: row.nombre?.trim() || "Sin nombre",
    alcaldia: row.alcaldia?.trim() || "CDMX",
    tipo: row.tipo?.trim() || "Sin clasificar",
    estado: deriveEstadoEspacio(row),
    ultimaModif: formatUltimaModif(row.updated_at),
    direccion: row.direccion?.trim() || "",
    horario: row.horario?.trim() || "",
    telefono: row.telefono?.trim() || "",
    latitud: row.latitud,
    longitud: row.longitud,
    descripcion: row.descripcion?.trim() || "",
  };
}

const ESPACIO_SELECT =
  "id, nombre, direccion, alcaldia, tipo, horario, telefono, latitud, longitud, descripcion, updated_at";

export async function getEspacioById(
  admin: SupabaseClient,
  id: string,
): Promise<AdminEspacioRow | null> {
  const { data, error } = await admin
    .from("espacios_culturales")
    .select(ESPACIO_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  return mapEspacioDbRow(data as EspacioDbRow);
}

export async function createEspacio(
  admin: SupabaseClient,
  input: AdminEspacioFormInput,
): Promise<{ row?: AdminEspacioRow; error?: string }> {
  const normalized = normalizeEspacioFormInput(input);
  if (normalized.error) return { error: normalized.error };

  const { data, error } = await admin
    .from("espacios_culturales")
    .insert(normalized.payload satisfies EspacioDbPayload)
    .select(ESPACIO_SELECT)
    .single();

  if (error) return { error: error.message };
  return { row: mapEspacioDbRow(data as EspacioDbRow) };
}

export async function updateEspacio(
  admin: SupabaseClient,
  id: string,
  input: AdminEspacioFormInput,
): Promise<{ row?: AdminEspacioRow; error?: string }> {
  const normalized = normalizeEspacioFormInput(input);
  if (normalized.error) return { error: normalized.error };

  const { data, error } = await admin
    .from("espacios_culturales")
    .update({
      ...normalized.payload,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select(ESPACIO_SELECT)
    .maybeSingle();

  if (error) return { error: error.message };
  if (!data) return { error: "Espacio no encontrado" };
  return { row: mapEspacioDbRow(data as EspacioDbRow) };
}

export async function deleteEspacio(
  admin: SupabaseClient,
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  const { error, count } = await admin
    .from("espacios_culturales")
    .delete({ count: "exact" })
    .eq("id", id);

  if (error) return { ok: false, error: error.message };
  if ((count ?? 0) === 0) return { ok: false, error: "Espacio no encontrado" };
  return { ok: true };
}

export async function fetchCategoriasNombres(admin: SupabaseClient): Promise<string[]> {
  const { data, error } = await admin
    .from("categorias_espacios")
    .select("nombre")
    .order("orden", { ascending: true });

  if (error) return [];
  return (data ?? [])
    .map((row) => String(row.nombre ?? "").trim())
    .filter(Boolean);
}

/** Completa horario/teléfono si faltan y deja el registro en estado Publicado. */
export async function publishEspacio(
  admin: SupabaseClient,
  id: string,
): Promise<{ row?: AdminEspacioRow; error?: string }> {
  const current = await getEspacioById(admin, id);
  if (!current) return { error: "Espacio no encontrado" };

  const blocker = getEspacioPublishBlocker(current);
  if (blocker) return { error: blocker };

  const { horario, telefono } = resolveCamposPublicacion(current);

  return updateEspacio(admin, id, {
    nombre: current.nombre,
    direccion: current.direccion,
    alcaldia: current.alcaldia,
    tipo: current.tipo === "Sin clasificar" ? "" : current.tipo,
    horario,
    telefono,
    latitud: current.latitud ?? null,
    longitud: current.longitud ?? null,
    descripcion: current.descripcion,
  });
}

export async function fetchEspaciosFlujo(admin: SupabaseClient): Promise<AdminEspacioRow[]> {
  const { data, error } = await admin
    .from("espacios_culturales")
    .select(ESPACIO_SELECT)
    .order("updated_at", { ascending: false })
    .limit(3000);

  if (error) throw new Error(error.message);

  return ((data ?? []) as EspacioDbRow[])
    .map(mapEspacioDbRow)
    .filter((row) => row.estado === "Revisión" || row.estado === "Borrador");
}
