"use client";

import Link from "next/link";
import { useState } from "react";
import { AuthShell } from "@/components/features/auth/AuthShell";
import { AuthStatusCard } from "@/components/features/auth/AuthStatusCard";
import { Button } from "@/components/shared/Button";
import { useAuth } from "@/contexts/AuthProvider";
import { authDemoResetToken, authRoutes } from "@/lib/data/mock/auth";
import type { AuthPageData } from "@/lib/services/auth.service";

type RecuperarContrasenaViewProps = {
  data: Pick<AuthPageData, "recuperarCopy">;
};

export function RecuperarContrasenaView({ data }: RecuperarContrasenaViewProps) {
  const { recuperarCopy } = data;
  const { recoverPassword, usesSupabase } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const inputClass =
    "mt-1.5 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-geo-navy outline-none transition placeholder:text-gray-400 focus:border-geo-pink focus:ring-2 focus:ring-geo-pink/15";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const err = await recoverPassword(email);
    setLoading(false);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setSent(true);
  }

  return (
    <AuthShell>
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-bold text-geo-navy">{recuperarCopy.titulo}</h1>
        <p className="mt-2 text-sm text-geo-muted">{recuperarCopy.subtitulo}</p>

        {!sent ? (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="rec-email" className="text-sm font-medium text-geo-navy">
                {recuperarCopy.emailLabel}
              </label>
              <input
                id="rec-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={recuperarCopy.emailPlaceholder}
                className={inputClass}
              />
            </div>
            {error != null && (
              <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
                {error}
              </p>
            )}
            <Button type="submit" variant="primary" size="lg" className="w-full">
              {loading ? "Enviando…" : recuperarCopy.submitLabel}
            </Button>
          </form>
        ) : (
          <div className="mt-6 space-y-4">
            <AuthStatusCard
              variant="info"
              titulo={recuperarCopy.exitoTitulo}
              texto={
                usesSupabase
                  ? "Revisa tu bandeja de entrada y sigue el enlace para restablecer tu contraseña."
                  : recuperarCopy.exitoTexto
              }
            >
              {!usesSupabase && (
                <>
                  <p className="text-xs text-geo-muted">{recuperarCopy.demoEnlaceHint}</p>
                  <Button
                    href={`${authRoutes.restablecer}?token=${authDemoResetToken}&email=${encodeURIComponent(email.trim())}`}
                    variant="secondary"
                    size="sm"
                    className="mt-2 w-full"
                  >
                    {recuperarCopy.demoEnlaceLabel}
                  </Button>
                </>
              )}
            </AuthStatusCard>
          </div>
        )}

        <p className="mt-6 text-center text-sm text-geo-muted">
          {recuperarCopy.loginPrompt}{" "}
          <Link href={authRoutes.login} className="font-medium text-geo-pink hover:underline">
            {recuperarCopy.loginLink}
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
