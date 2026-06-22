import type { SupabaseClient } from "@supabase/supabase-js";
import type { AdminCapaFormInput, AdminCapaSigRow } from "@/lib/domain/admin";

type CategoriaDbRow = {
  id: string;
  nombre: string | null;
  descripcion: string | null;
  created_at: string | null;
  orden: number | null;
};

function formatActualizacion(iso: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function mapCapaDbRow(
  row: CategoriaDbRow,
  espaciosVinculados = 0,
): AdminCapaSigRow {
  const fullId = String(row.id ?? "");
  return {
    id: fullId.slice(0, 8).toUpperCase(),
    fullId,
    nombre: String(row.nombre ?? "Capa").trim() || "Sin nombre",
    descripcion: String(row.descripcion ?? "").trim(),
    formato: "Tipología SIC",
    estado: "Activa",
    actualizacion: formatActualizacion(row.created_at),
    orden: Number.isFinite(row.orden) ? Number(row.orden) : 0,
    espaciosVinculados,
  };
}

function normalizeCapaInput(input: AdminCapaFormInput): {
  payload: Record<string, unknown>;
  error?: string;
} {
  const nombre = input.nombre?.trim() ?? "";
  if (!nombre) return { payload: {}, error: "El nombre es obligatorio" };

  const descripcion = input.descripcion?.trim() ?? "";
  const orden = input.orden ?? 0;
  if (!Number.isFinite(orden)) return { payload: {}, error: "El orden no es válido" };

  return {
    payload: {
      nombre,
      descripcion: descripcion === "" ? null : descripcion,
      orden: Math.round(orden),
    },
  };
}

async function countEspaciosPorCategoria(
  admin: SupabaseClient,
  categoriaIds: string[],
): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  if (categoriaIds.length === 0) return counts;

  for (const categoriaId of categoriaIds) {
    const { count, error } = await admin
      .from("espacios_culturales")
      .select("id", { count: "exact", head: true })
      .eq("categoria_id", categoriaId);

    if (!error) counts.set(categoriaId, count ?? 0);
  }

  return counts;
}

export async function listCapasAdmin(admin: SupabaseClient): Promise<AdminCapaSigRow[]> {
  const { data, error } = await admin
    .from("categorias_espacios")
    .select("id, nombre, descripcion, created_at, orden")
    .order("orden", { ascending: true });

  if (error) throw new Error(error.message);

  const rows = (data ?? []) as CategoriaDbRow[];
  const counts = await countEspaciosPorCategoria(
    admin,
    rows.map((r) => String(r.id)),
  );

  return rows.map((row) =>
    mapCapaDbRow(row, counts.get(String(row.id)) ?? 0),
  );
}

export async function createCapaAdmin(
  admin: SupabaseClient,
  input: AdminCapaFormInput,
): Promise<{ row?: AdminCapaSigRow; error?: string }> {
  const normalized = normalizeCapaInput(input);
  if (normalized.error) return { error: normalized.error };

  const { data, error } = await admin
    .from("categorias_espacios")
    .insert(normalized.payload)
    .select("id, nombre, descripcion, created_at, orden")
    .single();

  if (error) return { error: error.message };
  return { row: mapCapaDbRow(data as CategoriaDbRow, 0) };
}

export async function updateCapaAdmin(
  admin: SupabaseClient,
  id: string,
  input: AdminCapaFormInput,
): Promise<{ row?: AdminCapaSigRow; error?: string }> {
  const normalized = normalizeCapaInput(input);
  if (normalized.error) return { error: normalized.error };

  const { data, error } = await admin
    .from("categorias_espacios")
    .update(normalized.payload)
    .eq("id", id)
    .select("id, nombre, descripcion, created_at, orden")
    .maybeSingle();

  if (error) return { error: error.message };
  if (!data) return { error: "Capa no encontrada" };

  const { count } = await admin
    .from("espacios_culturales")
    .select("id", { count: "exact", head: true })
    .eq("categoria_id", id);

  return { row: mapCapaDbRow(data as CategoriaDbRow, count ?? 0) };
}

export async function deleteCapaAdmin(
  admin: SupabaseClient,
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  const { count, error: countError } = await admin
    .from("espacios_culturales")
    .select("id", { count: "exact", head: true })
    .eq("categoria_id", id);

  if (countError) return { ok: false, error: countError.message };
  if ((count ?? 0) > 0) {
    return {
      ok: false,
      error: `No se puede eliminar: ${count} espacio(s) usan esta tipología`,
    };
  }

  const { error, count: deleted } = await admin
    .from("categorias_espacios")
    .delete({ count: "exact" })
    .eq("id", id);

  if (error) return { ok: false, error: error.message };
  if ((deleted ?? 0) === 0) return { ok: false, error: "Capa no encontrada" };
  return { ok: true };
}
