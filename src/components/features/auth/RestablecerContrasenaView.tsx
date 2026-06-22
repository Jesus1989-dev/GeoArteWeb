"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AuthShell } from "@/components/features/auth/AuthShell";
import { AuthStatusCard } from "@/components/features/auth/AuthStatusCard";
import { Button } from "@/components/shared/Button";
import { useAuth } from "@/contexts/AuthProvider";
import { authRoutes } from "@/lib/data/mock/auth";
import { hasRecoverySession } from "@/lib/data/supabase/auth.repository";
import type { AuthPageData } from "@/lib/services/auth.service";
import {
  isValidResetToken,
  validateRestablecer,
} from "@/lib/services/auth.service";

type RestablecerContrasenaViewProps = {
  data: Pick<AuthPageData, "restablecerCopy" | "demoResetToken">;
};

export function RestablecerContrasenaView({ data }: RestablecerContrasenaViewProps) {
  const { restablecerCopy, demoResetToken } = data;
  const { updatePassword, usesSupabase } = useAuth();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [recoveryReady, setRecoveryReady] = useState<boolean | null>(
    usesSupabase ? null : true,
  );

  const tokenValido = useMemo(() => {
    if (usesSupabase) return recoveryReady === true;
    return isValidResetToken(token);
  }, [recoveryReady, token, usesSupabase]);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!usesSupabase) return;
    let cancelled = false;
    hasRecoverySession().then((ok) => {
      if (!cancelled) setRecoveryReady(ok);
    });
    return () => {
      cancelled = true;
    };
  }, [usesSupabase]);

  const inputClass =
    "mt-1.5 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-geo-navy outline-none transition placeholder:text-gray-400 focus:border-geo-pink focus:ring-2 focus:ring-geo-pink/15";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationError = validateRestablecer({ password, confirmPassword });
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!usesSupabase) {
      setError(null);
      setDone(true);
      return;
    }

    setLoading(true);
    const err = await updatePassword({ password, confirmPassword });
    setLoading(false);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setDone(true);
  }

  if (usesSupabase && recoveryReady == null) {
    return (
      <AuthShell>
        <p className="text-center text-sm text-geo-muted">Validando enlace…</p>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-bold text-geo-navy">{restablecerCopy.titulo}</h1>

        {!tokenValido ? (
          <div className="mt-6">
            <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
              {restablecerCopy.tokenInvalido}
            </p>
            <Button
              href={`${authRoutes.recuperar}`}
              variant="outline"
              size="md"
              className="mt-4 w-full"
            >
              Solicitar nuevo enlace
            </Button>
          </div>
        ) : !done ? (
          <>
            <p className="mt-2 text-sm text-geo-muted">{restablecerCopy.subtitulo}</p>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="new-pass" className="text-sm font-medium text-geo-navy">
                  {restablecerCopy.passwordLabel}
                </label>
                <input
                  id="new-pass"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={restablecerCopy.passwordPlaceholder}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="confirm-pass" className="text-sm font-medium text-geo-navy">
                  {restablecerCopy.confirmLabel}
                </label>
                <input
                  id="confirm-pass"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={restablecerCopy.confirmPlaceholder}
                  className={inputClass}
                />
              </div>
              {error != null && (
                <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
                  {error}
                </p>
              )}
              <Button type="submit" variant="primary" size="lg" className="w-full">
                {loading ? "Guardando…" : restablecerCopy.submitLabel}
              </Button>
            </form>
            {!usesSupabase && (
              <p className="mt-4 text-center text-xs text-geo-muted">
                Token demo: <code className="font-mono">{demoResetToken}</code>
              </p>
            )}
          </>
        ) : (
          <div className="mt-6">
            <AuthStatusCard
              variant="success"
              titulo={restablecerCopy.exitoTitulo}
              texto={restablecerCopy.exitoTexto}
            >
              <Button href={authRoutes.login} variant="primary" size="md" className="w-full">
                {restablecerCopy.loginLink}
              </Button>
            </AuthStatusCard>
          </div>
        )}

        {!done && tokenValido && (
          <p className="mt-6 text-center text-sm text-geo-muted">
            <Link href={authRoutes.login} className="font-medium text-geo-pink hover:underline">
              {restablecerCopy.loginLink}
            </Link>
          </p>
        )}
      </div>
    </AuthShell>
  );
}
