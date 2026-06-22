"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  authRedirects,
  authRoutes,
  type AuthSession,
} from "@/lib/data/mock/auth";
import {
  clearAuthSession,
  readAuthSession,
  writeAuthSession,
} from "@/lib/auth/storage";
import {
  buildSessionFromLogin,
  buildSessionFromRegister,
  validateLogin,
  validateRegister,
  validateRecuperarEmail,
  validateRestablecer,
  type LoginInput,
  type RegisterInput,
} from "@/lib/services/auth.service";
import { isSupabaseConfigured } from "@/lib/data/supabase/config";
import {
  loginAction,
  logoutAction,
  recoverPasswordAction,
  refreshSessionAction,
  registerAction,
  resendVerificationAction,
  updatePasswordAction as updatePasswordServerAction,
} from "@/actions/auth.actions";
import { getSupabaseBrowserClient } from "@/lib/data/supabase/client";
import { navigateAfterAuth } from "@/lib/auth/navigate-after-auth";

type AuthContextValue = {
  session: AuthSession | null;
  ready: boolean;
  usesSupabase: boolean;
  login: (input: LoginInput) => Promise<string | null>;
  register: (input: RegisterInput) => Promise<string | null>;
  logout: () => Promise<void>;
  recoverPassword: (email: string) => Promise<string | null>;
  updatePassword: (input: {
    password: string;
    confirmPassword: string;
  }) => Promise<string | null>;
  resendVerification: (email?: string) => Promise<string | null>;
  /** Solo modo demo sin Supabase */
  markEmailVerified: () => string | null;
  /** Recarga sesión desde Supabase (p. ej. tras editar perfil). */
  refreshSession: () => Promise<AuthSession | null>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function redirectAfterAuth(
  session: AuthSession,
  router: ReturnType<typeof useRouter>,
  usesSupabase: boolean,
) {
  if (session.emailVerified === false) {
    const dest = `${authRoutes.verificar}?email=${encodeURIComponent(session.email)}`;
    if (navigateAfterAuth(dest, { usesSupabase, replace: true })) return;
    router.push(dest);
    return;
  }
  const dest = authRedirects[session.rol];
  if (navigateAfterAuth(dest, { usesSupabase })) return;
  router.push(dest);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const usesSupabase = isSupabaseConfigured();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [ready, setReady] = useState(false);

  const refreshSupabaseSession = useCallback(async () => {
    const next = await refreshSessionAction();
    setSession(next);
    return next;
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        if (usesSupabase) {
          const next = await refreshSessionAction();
          if (!cancelled) {
            setSession(next);
            setReady(true);
          }
          return;
        }

        const stored = readAuthSession();
        if (stored != null && stored.emailVerified === undefined) {
          writeAuthSession({ ...stored, emailVerified: true });
          if (!cancelled) setSession({ ...stored, emailVerified: true });
        } else if (!cancelled) {
          setSession(stored);
        }
        if (!cancelled) setReady(true);
      } catch (err) {
        console.error("[auth] No se pudo restaurar la sesión:", err);
        if (!cancelled) {
          setSession(null);
          setReady(true);
        }
      }
    }

    void bootstrap();

    if (!usesSupabase) {
      return () => {
        cancelled = true;
      };
    }

    const client = getSupabaseBrowserClient();
    if (client == null) {
      return () => {
        cancelled = true;
      };
    }

    let authRefreshTimer: ReturnType<typeof setTimeout> | null = null;

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((event) => {
      if (cancelled) return;
      if (event === "SIGNED_OUT") {
        setSession(null);
        return;
      }
      if (authRefreshTimer != null) clearTimeout(authRefreshTimer);
      authRefreshTimer = setTimeout(() => {
        void refreshSupabaseSession();
      }, 300);
    });

    return () => {
      cancelled = true;
      if (authRefreshTimer != null) clearTimeout(authRefreshTimer);
      subscription.unsubscribe();
    };
  }, [usesSupabase, refreshSupabaseSession]);

  const persistDemo = useCallback((next: AuthSession) => {
    writeAuthSession(next);
    setSession(next);
  }, []);

  const login = useCallback(
    async (input: LoginInput) => {
      const validationError = validateLogin(input, usesSupabase);
      if (validationError) return validationError;

      if (usesSupabase) {
        const result = await loginAction(input);
        if ("error" in result) return result.error;
        setSession(result.session);
        const params = new URLSearchParams(window.location.search);
        const next = params.get("next");
        if (next?.startsWith("/") && !next.startsWith("//")) {
          if (navigateAfterAuth(next, { usesSupabase })) return null;
          router.push(next);
        } else {
          redirectAfterAuth(result.session, router, usesSupabase);
        }
        return null;
      }

      const next = buildSessionFromLogin(input);
      persistDemo(next);
      redirectAfterAuth(next, router, usesSupabase);
      return null;
    },
    [persistDemo, router, usesSupabase],
  );

  const register = useCallback(
    async (input: RegisterInput) => {
      const validationError = validateRegister(input);
      if (validationError) return validationError;

      if (usesSupabase) {
        const result = await registerAction(input);
        if ("error" in result) return result.error;

      if (result.session != null) {
        setSession(result.session);
        if (result.session.emailVerified !== false) {
          redirectAfterAuth(result.session, router, usesSupabase);
          return null;
        }
      }

      router.push(
          `${authRoutes.verificar}?email=${encodeURIComponent(input.email.trim().toLowerCase())}`,
        );
        return null;
      }

      const next = buildSessionFromRegister(input);
      persistDemo(next);
      router.push(
        `${authRoutes.verificar}?email=${encodeURIComponent(next.email)}`,
      );
      return null;
    },
    [persistDemo, router, usesSupabase],
  );

  const markEmailVerified = useCallback(() => {
    if (usesSupabase) {
      return "La verificación se completa desde el enlace del correo.";
    }
    if (session == null) return "No hay una sesión activa.";
    const next = { ...session, emailVerified: true };
    persistDemo(next);
    return null;
  }, [session, persistDemo, usesSupabase]);

  const resendVerification = useCallback(
    async (email?: string) => {
      const target = email?.trim() || session?.email;
      if (!target) return "Indica un correo para reenviar la verificación.";

      if (usesSupabase) {
        const result = await resendVerificationAction(target);
        return result.error ?? null;
      }

      return null;
    },
    [session, usesSupabase],
  );

  const recoverPassword = useCallback(
    async (email: string) => {
      const validationError = validateRecuperarEmail(email);
      if (validationError) return validationError;

      if (usesSupabase) {
        const result = await recoverPasswordAction(email);
        return result.error ?? null;
      }

      return null;
    },
    [usesSupabase],
  );

  const updatePasswordAction = useCallback(
    async (input: { password: string; confirmPassword: string }) => {
      const validationError = validateRestablecer(input);
      if (validationError) return validationError;

      if (usesSupabase) {
        const result = await updatePasswordServerAction({
          password: input.password,
        });
        if (result.error) return result.error;
        await refreshSupabaseSession();
        return null;
      }

      return null;
    },
    [refreshSupabaseSession, usesSupabase],
  );

  const logout = useCallback(async () => {
    if (usesSupabase) {
      await logoutAction();
    } else {
      clearAuthSession();
    }
    setSession(null);
    if (navigateAfterAuth(authRoutes.login, { usesSupabase, replace: true })) return;
    router.push(authRoutes.login);
  }, [router, usesSupabase]);

  const value = useMemo(
    () => ({
      session,
      ready,
      usesSupabase,
      login,
      register,
      logout,
      recoverPassword,
      updatePassword: updatePasswordAction,
      markEmailVerified,
      resendVerification,
      refreshSession: refreshSupabaseSession,
    }),
    [
      session,
      ready,
      usesSupabase,
      login,
      register,
      logout,
      recoverPassword,
      updatePasswordAction,
      markEmailVerified,
      resendVerification,
      refreshSupabaseSession,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return ctx;
}
