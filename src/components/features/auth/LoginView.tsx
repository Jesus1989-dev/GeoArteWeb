"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authRedirects, authRoutes } from "@/lib/data/mock/auth";
import { AuthRolePicker } from "@/components/features/auth/AuthRolePicker";
import { AuthShell } from "@/components/features/auth/AuthShell";
import { Button } from "@/components/shared/Button";
import { useAuth } from "@/contexts/AuthProvider";
import { navigateAfterAuth } from "@/lib/auth/navigate-after-auth";
import {
  credsForRol,
  useTestLoginAutofill,
} from "@/lib/auth/use-test-login-autofill";
import type { RolPerfil } from "@/lib/data/mock/perfil";
import type { AuthPageData } from "@/lib/services/auth.service";

type LoginViewProps = {
  data: AuthPageData;
};

const DEFAULT_ROL: RolPerfil = "ciudadano";

export function LoginView({ data }: LoginViewProps) {
  const { login, session, ready, usesSupabase } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next");
  const { loginCopy, demoUsers, roles, roleDescriptions, testLoginByRol } = data;

  const [rol, setRol] = useState<RolPerfil>(DEFAULT_ROL);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const rolRef = useRef(rol);
  rolRef.current = rol;

  const applyTestCredsForRol = useCallback(
    (nextRol: RolPerfil, source: Partial<Record<RolPerfil, { email: string; password: string }>>) => {
      const creds = credsForRol(source, nextRol);
      if (!creds) return;
      setEmail(creds.email);
      setPassword(creds.password);
      setError(null);
    },
    [],
  );

  const onTestLoginReady = useCallback(
    (source: Partial<Record<RolPerfil, { email: string; password: string }>>) => {
      applyTestCredsForRol(rolRef.current, source);
    },
    [applyTestCredsForRol],
  );

  const testLoginByRolResolved = useTestLoginAutofill(testLoginByRol, onTestLoginReady);

  const handleRolChange = useCallback(
    (nextRol: RolPerfil) => {
      setRol(nextRol);
      applyTestCredsForRol(nextRol, testLoginByRolResolved);
    },
    [applyTestCredsForRol, testLoginByRolResolved],
  );

  useEffect(() => {
    if (!ready || session == null) return;
    if (session.emailVerified === false) {
      router.replace(
        `${authRoutes.verificar}?email=${encodeURIComponent(session.email)}`,
      );
      return;
    }
    const destination =
      nextPath?.startsWith("/") && !nextPath.startsWith("//")
        ? nextPath
        : authRedirects[session.rol];
    if (navigateAfterAuth(destination, { usesSupabase, replace: true })) return;
    router.replace(destination);
  }, [ready, session, router, nextPath, usesSupabase]);

  const inputClass =
    "mt-1.5 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-geo-navy outline-none transition placeholder:text-gray-400 focus:border-geo-pink focus:ring-2 focus:ring-geo-pink/15";

  const activeTestCreds = credsForRol(testLoginByRolResolved, rol);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const err = await login({ email, password, rol });
    setLoading(false);
    if (err) setError(err);
  }

  function fillDemo(demoEmail: string, demoRol: RolPerfil) {
    setEmail(demoEmail);
    setPassword("demo123");
    setRol(demoRol);
    setError(null);
  }

  return (
    <AuthShell>
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-bold text-geo-navy">{loginCopy.titulo}</h1>
        <p className="mt-2 text-sm text-geo-muted">{loginCopy.subtitulo}</p>

        {usesSupabase && activeTestCreds != null && (
          <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-900">
            Credenciales de prueba. Pulsa «{loginCopy.submitLabel}» para iniciar sesión.
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <AuthRolePicker
            roles={roles}
            descriptions={roleDescriptions}
            value={rol}
            onChange={handleRolChange}
            label={loginCopy.rolLabel}
          />

          <div>
            <label htmlFor="login-email" className="text-sm font-medium text-geo-navy">
              {loginCopy.emailLabel}
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={loginCopy.emailPlaceholder}
              className={inputClass}
            />
          </div>

          <div>
            <div className="flex items-center justify-between gap-2">
              <label htmlFor="login-password" className="text-sm font-medium text-geo-navy">
                {loginCopy.passwordLabel}
              </label>
              <Link
                href={authRoutes.recuperar}
                className="text-xs font-medium text-geo-pink hover:underline"
              >
                {loginCopy.olvideLink}
              </Link>
            </div>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={loginCopy.passwordPlaceholder}
              className={inputClass}
            />
          </div>

          {error != null && (
            <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
              {error}
            </p>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
          >
            {loading ? "Entrando…" : loginCopy.submitLabel}
          </Button>
        </form>

        {!usesSupabase && (
          <div className="mt-6 rounded-xl border border-dashed border-gray-200 bg-geo-surface/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-geo-muted">
              {loginCopy.demoTitulo}
            </p>
            <p className="mt-1 text-xs text-geo-muted">{loginCopy.demoHint}</p>
            <ul className="mt-3 space-y-2">
              {demoUsers.map((u) => (
                <li key={u.email}>
                  <button
                    type="button"
                    onClick={() => fillDemo(u.email, u.rol)}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-left text-xs transition hover:border-geo-pink/40 hover:bg-geo-pink/5"
                  >
                    <span className="font-medium text-geo-navy">{u.nombre}</span>
                    <span className="mt-0.5 block text-geo-muted">
                      {u.email} · {u.rol}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="mt-6 text-center text-sm text-geo-muted">
          {loginCopy.registroPrompt}{" "}
          <Link href="/registro" className="font-medium text-geo-pink hover:underline">
            {loginCopy.registroLink}
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
