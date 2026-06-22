"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AuthShell } from "@/components/features/auth/AuthShell";
import { AuthStatusCard } from "@/components/features/auth/AuthStatusCard";
import { Button } from "@/components/shared/Button";
import { useAuth } from "@/contexts/AuthProvider";
import { authRedirects, authRoutes } from "@/lib/data/mock/auth";
import type { AuthPageData } from "@/lib/services/auth.service";

type VerificarEmailViewProps = {
  data: Pick<AuthPageData, "verificarCopy">;
};

export function VerificarEmailView({ data }: VerificarEmailViewProps) {
  const { verificarCopy } = data;
  const { session, ready, markEmailVerified, resendVerification, usesSupabase } =
    useAuth();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email");

  const email = emailParam ?? session?.email ?? "";
  const [reenviado, setReenviado] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (ready && session?.emailVerified) {
      window.location.href = authRedirects[session.rol];
    }
  }, [ready, session]);

  async function handleResend() {
    setResendError(null);
    setResending(true);
    const err = await resendVerification(email);
    setResending(false);
    if (err) {
      setResendError(err);
      return;
    }
    setReenviado(true);
  }

  function handleVerifyDemo() {
    const err = markEmailVerified();
    if (!err && session) {
      window.location.href = authRedirects[session.rol];
    }
  }

  if (!ready) {
    return (
      <AuthShell>
        <p className="text-center text-sm text-geo-muted">Cargando…</p>
      </AuthShell>
    );
  }

  if (session == null && !email) {
    return (
      <AuthShell>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm sm:p-8">
          <p className="text-sm text-geo-muted">
            Inicia sesión o regístrate para verificar tu correo.
          </p>
          <Button href={authRoutes.login} variant="primary" size="md" className="mt-4">
            {verificarCopy.loginLink}
          </Button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-bold text-geo-navy">{verificarCopy.titulo}</h1>
        <p className="mt-2 text-sm text-geo-muted">{verificarCopy.subtitulo}</p>

        <div className="mt-6">
          <AuthStatusCard
            variant="info"
            titulo="Correo pendiente"
            texto="Abre el enlace que enviamos a la siguiente dirección:"
          >
            <p className="text-sm font-medium text-geo-navy break-all">{email}</p>
            {!usesSupabase && (
              <p className="mt-3 text-xs leading-relaxed text-geo-muted">
                {verificarCopy.demoHint}
              </p>
            )}
          </AuthStatusCard>
        </div>

        {reenviado && (
          <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            {verificarCopy.reenviarExito}
          </p>
        )}

        {resendError != null && (
          <p className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
            {resendError}
          </p>
        )}

        <div className="mt-6 flex flex-col gap-3">
          <Button
            type="button"
            variant="outline"
            size="md"
            className="w-full"
            onClick={handleResend}
          >
            {resending ? "Reenviando…" : verificarCopy.reenviarLabel}
          </Button>
          {!usesSupabase && session != null && (
            <Button
              type="button"
              variant="primary"
              size="lg"
              className="w-full"
              onClick={handleVerifyDemo}
            >
              {verificarCopy.demoLabel}
            </Button>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-geo-muted">
          {verificarCopy.cambiarCorreo}{" "}
          <Link href={authRoutes.registro} className="font-medium text-geo-pink hover:underline">
            {verificarCopy.registroLink}
          </Link>
          {" · "}
          <Link href={authRoutes.login} className="font-medium text-geo-pink hover:underline">
            {verificarCopy.loginLink}
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
