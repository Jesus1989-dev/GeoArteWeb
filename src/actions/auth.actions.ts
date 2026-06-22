"use server";

import type { AuthSession } from "@/lib/data/mock/auth";
import type { RolPerfil } from "@/lib/data/mock/perfil";
import { isSupabaseConfigured } from "@/lib/data/supabase/config";
import {
  loadSupabaseAuthSessionServerBounded,
  requestPasswordResetServer,
  resendSignupVerificationServer,
  signInWithPasswordServer,
  signOutSupabaseServer,
  signUpWithPasswordServer,
  updatePasswordServer,
} from "@/lib/data/supabase/auth.repository.server";
import type {
  LoginInput,
  RegisterInput,
} from "@/lib/services/auth.service";

type AuthActionResult<T> = T | { error: string };

function notConfigured(): { error: string } {
  return { error: "Supabase no está configurado." };
}

/** Inicia sesión en el servidor (evita fetch directo navegador → Supabase). */
export async function loginAction(
  input: LoginInput,
): Promise<AuthActionResult<{ session: AuthSession }>> {
  if (!isSupabaseConfigured()) return notConfigured();
  return signInWithPasswordServer(input);
}

/** Registra cuenta en el servidor. */
export async function registerAction(input: RegisterInput): Promise<
  AuthActionResult<{
    session: AuthSession | null;
    needsVerification: boolean;
  }>
> {
  if (!isSupabaseConfigured()) return notConfigured();
  return signUpWithPasswordServer(input);
}

/** Cierra sesión en el servidor y limpia cookies. */
export async function logoutAction(): Promise<void> {
  if (!isSupabaseConfigured()) return;
  await signOutSupabaseServer();
}

/** Restaura sesión desde cookies en el servidor. */
export async function refreshSessionAction(): Promise<AuthSession | null> {
  if (!isSupabaseConfigured()) return null;
  return loadSupabaseAuthSessionServerBounded();
}

export async function recoverPasswordAction(
  email: string,
): Promise<{ error?: string }> {
  if (!isSupabaseConfigured()) return notConfigured();
  return requestPasswordResetServer(email);
}

export async function updatePasswordAction(input: {
  password: string;
}): Promise<{ error?: string }> {
  if (!isSupabaseConfigured()) return notConfigured();
  return updatePasswordServer(input.password);
}

export async function resendVerificationAction(
  email: string,
): Promise<{ error?: string }> {
  if (!isSupabaseConfigured()) return notConfigured();
  return resendSignupVerificationServer(email);
}
