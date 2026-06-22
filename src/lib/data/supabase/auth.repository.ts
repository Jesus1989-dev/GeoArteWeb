import type { User } from "@supabase/supabase-js";
import type { AuthSession } from "@/lib/data/mock/auth";
import type { RolPerfil } from "@/lib/data/mock/perfil";
import { getSupabaseBrowserClient } from "@/lib/data/supabase/client";
import {
  resolveProfileFullName,
  resolveProfileNameParts,
  splitFullName,
} from "@/lib/auth/profile-name";
import {
  fetchProfileByUserId,
  resolveAppRolFromProfile,
  updateUserProfile,
} from "@/lib/data/supabase/profiles.repository";
import { appRolToSupabaseRol, supabaseRolToAppRol } from "@/lib/data/supabase/rol";
import { translateAuthError } from "@/lib/data/supabase/auth-errors";
import { withTimeout } from "@/lib/utils/with-timeout";

const PROFILE_FETCH_TIMEOUT_MS = 8_000;
const GET_SESSION_TIMEOUT_MS = 6_000;
const LOAD_SESSION_TIMEOUT_MS = 12_000;

function isAuthNetworkError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const msg = err.message.toLowerCase();
  return (
    msg.includes("failed to fetch") ||
    msg.includes("networkerror") ||
    msg.includes("network request failed") ||
    msg.includes("load failed")
  );
}

/** Borra cookies/localStorage de auth sin llamar a la red (evita bucles Failed to fetch). */
export async function clearLocalSupabaseSession(): Promise<void> {
  const client = getSupabaseBrowserClient();
  if (!client) return;
  try {
    await client.auth.signOut({ scope: "local" });
  } catch {
    /* ignorar */
  }
}

function readInstitucion(user: User): string | undefined {
  const raw = user.user_metadata?.institucion;
  return typeof raw === "string" && raw.trim() ? raw.trim() : undefined;
}

function readDisplayNameFallback(user: User): string {
  const meta = user.user_metadata?.display_name;
  if (typeof meta === "string" && meta.trim()) return meta.trim();
  const local = user.email?.split("@")[0]?.replace(/\./g, " ") ?? "Usuario";
  return local.charAt(0).toUpperCase() + local.slice(1);
}

function readRolFromMetadata(user: User): RolPerfil | null {
  const raw = user.user_metadata?.app_rol;
  if (typeof raw !== "string") return null;
  if (raw === "ciudadano" || raw === "investigador" || raw === "autoridad") {
    return raw;
  }
  return supabaseRolToAppRol(raw);
}

export async function mapSupabaseUserToSession(
  user: User,
  selectedRol?: RolPerfil,
  options?: { syncProfileRol?: boolean },
): Promise<{ session: AuthSession } | { error: string }> {
  const client = getSupabaseBrowserClient();
  if (!client) return { error: "Supabase no está configurado." };

  const syncProfileRol = options?.syncProfileRol !== false;

  let profile = null;
  try {
    profile = await withTimeout(
      fetchProfileByUserId(client, user.id),
      PROFILE_FETCH_TIMEOUT_MS,
      "Perfil",
    );
  } catch (err) {
    console.warn("[auth] No se pudo leer profiles:", err);
  }

  let rol =
    resolveAppRolFromProfile(profile, selectedRol) ??
    readRolFromMetadata(user) ??
    selectedRol ??
    null;

  if (rol == null) {
    return {
      error:
        "Tu perfil no tiene un rol asignado. Completa el registro o contacta soporte.",
    };
  }

  if (syncProfileRol && profile?.rol == null) {
    void updateUserProfile(client, user.id, { rol }).catch((err) => {
      console.warn("[auth] No se pudo sincronizar rol en profiles:", err);
    });
  }

  if (selectedRol != null && rol !== selectedRol) {
    return {
      error: `Esta cuenta está registrada como ${rol}, no como ${selectedRol}.`,
    };
  }

  const emailVerified =
    user.email_confirmed_at != null && user.email_confirmed_at.trim() !== "";

  const nameParts = resolveProfileNameParts(profile ?? {});
  const nombre =
    resolveProfileFullName(profile ?? {}) || readDisplayNameFallback(user);

  return {
    session: {
      userId: user.id,
      email: user.email ?? "",
      nombre,
      firstName: nameParts.firstName || undefined,
      lastName: nameParts.lastName || undefined,
      rol,
      institucion: readInstitucion(user),
      emailVerified,
      avatarUrl: profile?.avatar_url?.trim() || null,
    },
  };
}

/** Origen para enlaces de correo (verificación / recuperación). */
export function getAuthRedirectOrigin(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  if (typeof window !== "undefined") return window.location.origin;
  return "http://localhost:3000";
}

export async function signInWithPassword(input: {
  email: string;
  password: string;
  rol: RolPerfil;
}): Promise<{ session: AuthSession } | { error: string }> {
  const client = getSupabaseBrowserClient();
  if (!client) return { error: "Supabase no está configurado." };

  const { data, error } = await client.auth.signInWithPassword({
    email: input.email.trim(),
    password: input.password,
  });

  if (error) return { error: translateAuthError(error.message) };
  if (data.user == null) return { error: "No se pudo iniciar sesión." };

  const mapped = await mapSupabaseUserToSession(data.user, input.rol);
  if ("error" in mapped) {
    await client.auth.signOut();
    return mapped;
  }

  return mapped;
}

export async function signUpWithPassword(input: {
  nombre: string;
  email: string;
  password: string;
  rol: RolPerfil;
  institucion?: string;
  cargo?: string;
  areaInvestigacion?: string;
}): Promise<{ session: AuthSession | null; needsVerification: boolean } | { error: string }> {
  const client = getSupabaseBrowserClient();
  if (!client) return { error: "Supabase no está configurado." };

  const origin = getAuthRedirectOrigin();
  const email = input.email.trim().toLowerCase();

  const { data, error } = await client.auth.signUp({
    email,
    password: input.password,
    options: {
      data: {
        display_name: input.nombre.trim(),
        institucion: input.institucion?.trim() || null,
        cargo: input.cargo?.trim() || null,
        area_investigacion: input.areaInvestigacion?.trim() || null,
        app_rol: input.rol,
      },
      emailRedirectTo: `${origin}/auth/callback?next=/email-verificado`,
    },
  });

  if (error) return { error: translateAuthError(error.message) };
  if (data.user == null) {
    return {
      error:
        "No se pudo crear la cuenta. Si ese correo ya está en uso, inicia sesión.",
    };
  }

  const emailVerified =
    data.user.email_confirmed_at != null &&
    data.user.email_confirmed_at.trim() !== "";

  const signupNameParts = splitFullName(input.nombre.trim());

  if (data.session != null && emailVerified) {
    await updateUserProfile(client, data.user.id, {
      firstName: signupNameParts.firstName,
      lastName: signupNameParts.lastName,
      rol: appRolToSupabaseRol(input.rol),
    });

    const mapped = await mapSupabaseUserToSession(data.user, input.rol);
    if ("error" in mapped) return mapped;
    return { session: mapped.session, needsVerification: false };
  }

  if (data.session != null && !emailVerified) {
    await client.auth.signOut();
  }

  return {
    session: {
      userId: data.user.id,
      email,
      nombre: input.nombre.trim(),
      firstName: signupNameParts.firstName || undefined,
      lastName: signupNameParts.lastName || undefined,
      rol: input.rol,
      institucion: input.institucion?.trim() || undefined,
      emailVerified: false,
    },
    needsVerification: true,
  };
}

export async function signOutSupabase(): Promise<void> {
  const client = getSupabaseBrowserClient();
  if (!client) return;
  try {
    await client.auth.signOut();
  } catch (err) {
    console.warn("[auth] signOut remoto falló, limpiando sesión local:", err);
    await clearLocalSupabaseSession();
  }
}

export async function loadSupabaseAuthSession(): Promise<AuthSession | null> {
  const client = getSupabaseBrowserClient();
  if (!client) return null;

  try {
    const {
      data: { session },
      error,
    } = await withTimeout(
      client.auth.getSession(),
      GET_SESSION_TIMEOUT_MS,
      "Sesión",
    );

    if (error) {
      console.warn("[auth] getSession:", error.message);
      if (
        error.message.toLowerCase().includes("refresh") ||
        error.message.toLowerCase().includes("invalid")
      ) {
        await clearLocalSupabaseSession();
      }
      return null;
    }

    const user = session?.user;
    if (user == null) return null;

    const mapped = await mapSupabaseUserToSession(user, undefined, {
      syncProfileRol: true,
    });
    if ("error" in mapped) {
      console.warn("[auth]", mapped.error);
      return null;
    }
    return mapped.session;
  } catch (err) {
    console.warn("[auth] loadSupabaseAuthSession:", err);
    if (isAuthNetworkError(err)) {
      await clearLocalSupabaseSession();
    }
    return null;
  }
}

/** Igual que loadSupabaseAuthSession pero con tope de tiempo total (bootstrap UI). */
export async function loadSupabaseAuthSessionBounded(): Promise<AuthSession | null> {
  try {
    return await withTimeout(
      loadSupabaseAuthSession(),
      LOAD_SESSION_TIMEOUT_MS,
      "Sesión",
    );
  } catch (err) {
    console.warn("[auth]", err);
    return null;
  }
}

export async function requestPasswordReset(email: string): Promise<{ error?: string }> {
  const client = getSupabaseBrowserClient();
  if (!client) return { error: "Supabase no está configurado." };

  const origin = getAuthRedirectOrigin();
  const { error } = await client.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: `${origin}/auth/callback?next=/restablecer-contrasena`,
  });

  if (error) return { error: translateAuthError(error.message) };
  return {};
}

export async function updatePassword(password: string): Promise<{ error?: string }> {
  const client = getSupabaseBrowserClient();
  if (!client) return { error: "Supabase no está configurado." };

  const { error } = await client.auth.updateUser({ password });
  if (error) return { error: translateAuthError(error.message) };
  return {};
}

export async function resendSignupVerification(email: string): Promise<{ error?: string }> {
  const client = getSupabaseBrowserClient();
  if (!client) return { error: "Supabase no está configurado." };

  const origin = getAuthRedirectOrigin();
  const { error } = await client.auth.resend({
    type: "signup",
    email: email.trim(),
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=/email-verificado`,
    },
  });

  if (error) return { error: translateAuthError(error.message) };
  return {};
}

export async function hasRecoverySession(): Promise<boolean> {
  const client = getSupabaseBrowserClient();
  if (!client) return false;

  const {
    data: { session },
  } = await client.auth.getSession();

  return session != null;
}

