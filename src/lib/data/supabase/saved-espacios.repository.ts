import type { PerfilEspacioGuardado } from "@/lib/domain/perfil";
import { getSupabaseBrowserClient } from "@/lib/data/supabase/client";

const UUID_RE =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

export function isUuidEspacioId(id: string): boolean {
  return UUID_RE.test(id.trim());
}

type SavedEspacioRow = {
  created_at: string | null;
  espacio_id: string;
  espacios_culturales:
    | {
        id: string;
        nombre: string | null;
        alcaldia: string | null;
        tipo: string | null;
      }
    | {
        id: string;
        nombre: string | null;
        alcaldia: string | null;
        tipo: string | null;
      }[]
    | null;
};

function formatGuardadoEl(iso: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function resolveEspacioFromRow(row: SavedEspacioRow): PerfilEspacioGuardado | null {
  const rel = row.espacios_culturales;
  const espacio = Array.isArray(rel) ? rel[0] : rel;
  if (espacio == null) return null;

  const id = espacio.id?.trim() || row.espacio_id?.trim();
  if (!id) return null;

  return {
    id,
    nombre: espacio.nombre?.trim() || "Sin nombre",
    alcaldia: espacio.alcaldia?.trim() || "CDMX",
    tipo: espacio.tipo?.trim() || "Sin clasificar",
    guardadoEl: formatGuardadoEl(row.created_at),
    href: `/mapa?espacio=${encodeURIComponent(id)}`,
  };
}

export async function fetchSavedEspacioIdsForUser(userId: string): Promise<string[]> {
  const client = getSupabaseBrowserClient();
  if (!client) return [];

  const { data, error } = await client
    .from("saved_espacios")
    .select("espacio_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.warn("[perfil] saved_espacios ids:", error.message);
    return [];
  }

  return (data ?? [])
    .map((row) => String((row as { espacio_id?: string }).espacio_id ?? "").trim())
    .filter(isUuidEspacioId);
}

export async function fetchSavedEspaciosForUser(
  userId: string,
): Promise<PerfilEspacioGuardado[]> {
  const client = getSupabaseBrowserClient();
  if (!client) return [];

  const { data, error } = await client
    .from("saved_espacios")
    .select(
      `
      created_at,
      espacio_id,
      espacios_culturales (
        id,
        nombre,
        alcaldia,
        tipo
      )
    `,
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    return fetchSavedEspaciosFallback(userId);
  }

  const mapped = ((data ?? []) as SavedEspacioRow[])
    .map(resolveEspacioFromRow)
    .filter((row): row is PerfilEspacioGuardado => row != null);

  if (mapped.length > 0 || (data ?? []).length === 0) {
    return mapped;
  }

  return fetchSavedEspaciosFallback(userId);
}

async function fetchSavedEspaciosFallback(
  userId: string,
): Promise<PerfilEspacioGuardado[]> {
  const client = getSupabaseBrowserClient();
  if (!client) return [];

  const { data: savedRows, error: savedError } = await client
    .from("saved_espacios")
    .select("created_at, espacio_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (savedError) {
    throw new Error(`Supabase saved_espacios: ${savedError.message}`);
  }

  const ids = (savedRows ?? [])
    .map((row) => String((row as { espacio_id?: string }).espacio_id ?? "").trim())
    .filter(isUuidEspacioId);

  if (ids.length === 0) return [];

  const { data: espacios, error: espaciosError } = await client
    .from("espacios_culturales")
    .select("id, nombre, alcaldia, tipo")
    .in("id", ids);

  if (espaciosError) {
    throw new Error(`Supabase espacios_culturales: ${espaciosError.message}`);
  }

  const byId = new Map(
    (espacios ?? []).map((row) => {
      const e = row as {
        id: string;
        nombre: string | null;
        alcaldia: string | null;
        tipo: string | null;
      };
      return [e.id, e] as const;
    }),
  );

  return (savedRows ?? [])
    .map((row) => {
      const saved = row as { created_at: string | null; espacio_id: string };
      const espacio = byId.get(saved.espacio_id);
      if (espacio == null) return null;
      return {
        id: espacio.id,
        nombre: espacio.nombre?.trim() || "Sin nombre",
        alcaldia: espacio.alcaldia?.trim() || "CDMX",
        tipo: espacio.tipo?.trim() || "Sin clasificar",
        guardadoEl: formatGuardadoEl(saved.created_at),
        href: `/mapa?espacio=${encodeURIComponent(espacio.id)}`,
      } satisfies PerfilEspacioGuardado;
    })
    .filter((row): row is PerfilEspacioGuardado => row != null);
}

export async function countSavedEspaciosForUser(userId: string): Promise<number> {
  const client = getSupabaseBrowserClient();
  if (!client) return 0;

  const { count, error } = await client
    .from("saved_espacios")
    .select("espacio_id", { count: "exact", head: true })
    .eq("user_id", userId);

  if (error) {
    console.warn("[perfil] saved_espacios count:", error.message);
    return 0;
  }

  return count ?? 0;
}

export async function countExportDownloadsForUser(userId: string): Promise<number> {
  const client = getSupabaseBrowserClient();
  if (!client) return 0;

  const { count, error } = await client
    .from("export_downloads")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  if (error) {
    console.warn("[perfil] export_downloads count:", error.message);
    return 0;
  }

  return count ?? 0;
}

export async function deleteSavedEspacioForUser(
  userId: string,
  espacioId: string,
): Promise<void> {
  if (!isUuidEspacioId(espacioId)) return;

  const client = getSupabaseBrowserClient();
  if (!client) return;

  const { error } = await client
    .from("saved_espacios")
    .delete()
    .eq("user_id", userId)
    .eq("espacio_id", espacioId.trim());

  if (error) {
    throw new Error(`Supabase delete saved_espacios: ${error.message}`);
  }
}

export async function insertSavedEspacioForUser(
  userId: string,
  espacioId: string,
): Promise<void> {
  if (!isUuidEspacioId(espacioId)) return;

  const client = getSupabaseBrowserClient();
  if (!client) return;

  const { error } = await client.from("saved_espacios").upsert({
    user_id: userId,
    espacio_id: espacioId.trim(),
  });

  if (error) {
    throw new Error(`Supabase insert saved_espacios: ${error.message}`);
  }
}
