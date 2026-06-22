import type { RolPerfil } from "@/lib/data/mock/perfil";

/** Valores en columna `profiles.rol` (misma convención que Flutter/SECTEI). */
export type SupabaseRol = "Ciudadano" | "Investigador" | "Autoridad";

const APP_TO_SUPABASE: Record<RolPerfil, SupabaseRol> = {
  ciudadano: "Ciudadano",
  investigador: "Investigador",
  autoridad: "Autoridad",
};

const SUPABASE_TO_APP: Record<string, RolPerfil> = {
  ciudadano: "ciudadano",
  investigador: "investigador",
  autoridad: "autoridad",
  Ciudadano: "ciudadano",
  Investigador: "investigador",
  Autoridad: "autoridad",
};

export function appRolToSupabaseRol(rol: RolPerfil): SupabaseRol {
  return APP_TO_SUPABASE[rol];
}

export function supabaseRolToAppRol(raw: string | null | undefined): RolPerfil | null {
  if (raw == null || raw.trim() === "") return null;
  return SUPABASE_TO_APP[raw.trim()] ?? null;
}
