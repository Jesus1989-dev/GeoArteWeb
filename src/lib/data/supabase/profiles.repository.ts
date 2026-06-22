import type { SupabaseClient } from "@supabase/supabase-js";
import {
  joinFullName,
  splitFullName,
} from "@/lib/auth/profile-name";
import {
  appRolToSupabaseRol,
  supabaseRolToAppRol,
  type SupabaseRol,
} from "@/lib/data/supabase/rol";
import type { RolPerfil } from "@/lib/data/mock/perfil";

export type ProfileRow = {
  id: string;
  rol: string | null;
  display_name: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  created_at?: string;
  updated_at?: string;
};

export async function fetchProfileByUserId(
  client: SupabaseClient,
  userId: string,
): Promise<ProfileRow | null> {
  const { data, error } = await client
    .from("profiles")
    .select("id, rol, display_name, first_name, last_name, avatar_url, created_at, updated_at")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Supabase profiles: ${error.message}`);
  }

  return (data as ProfileRow | null) ?? null;
}

export async function updateUserProfile(
  client: SupabaseClient,
  userId: string,
  updates: {
    displayName?: string;
    firstName?: string;
    lastName?: string;
    rol?: RolPerfil | SupabaseRol;
    avatarUrl?: string | null;
  },
): Promise<void> {
  const payload: Record<string, string | null> = {
    updated_at: new Date().toISOString(),
  };

  if (updates.firstName !== undefined || updates.lastName !== undefined) {
    const firstName = (updates.firstName ?? "").trim();
    const lastName = (updates.lastName ?? "").trim();
    payload.first_name = firstName || null;
    payload.last_name = lastName || null;
    payload.display_name = joinFullName(firstName, lastName) || null;
  } else if (updates.displayName != null) {
    const trimmed = updates.displayName.trim();
    const parts = splitFullName(trimmed);
    payload.display_name = trimmed || null;
    payload.first_name = parts.firstName || null;
    payload.last_name = parts.lastName || null;
  }

  if (updates.avatarUrl !== undefined) {
    payload.avatar_url = updates.avatarUrl;
  }

  if (updates.rol != null) {
    payload.rol =
      typeof updates.rol === "string" &&
      (updates.rol === "Ciudadano" ||
        updates.rol === "Investigador" ||
        updates.rol === "Autoridad")
        ? updates.rol
        : appRolToSupabaseRol(updates.rol as RolPerfil);
  }

  const { error } = await client.from("profiles").update(payload).eq("id", userId);

  if (error) {
    throw new Error(`Supabase profiles update: ${error.message}`);
  }
}

export function resolveAppRolFromProfile(
  profile: ProfileRow | null,
  fallback?: RolPerfil,
): RolPerfil | null {
  const fromProfile = supabaseRolToAppRol(profile?.rol);
  return fromProfile ?? fallback ?? null;
}
