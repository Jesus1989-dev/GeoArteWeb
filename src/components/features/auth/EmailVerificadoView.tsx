"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { AuthShell } from "@/components/features/auth/AuthShell";
import { AuthStatusCard } from "@/components/features/auth/AuthStatusCard";
import { Button } from "@/components/shared/Button";
import { useAuth } from "@/contexts/AuthProvider";
import { authRedirects, authRoutes } from "@/lib/data/mock/auth";
import type { AuthPageData } from "@/lib/services/auth.service";

type EmailVerificadoViewProps = {
  data: Pick<AuthPageData, "emailVerificadoCopy">;
};

export function EmailVerificadoView({ data }: EmailVerificadoViewProps) {
  const { emailVerificadoCopy } = data;
  const { session, ready, markEmailVerified } = useAuth();
  const searchParams = useSearchParams();
  const fromLink = searchParams.get("from") === "email";

  useEffect(() => {
    if (fromLink && session && !session.emailVerified) {
      markEmailVerified();
    }
  }, [fromLink, session, markEmailVerified]);

  const destino =
    session != null ? authRedirects[session.rol] : authRoutes.login;

  return (
    <AuthShell>
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <AuthStatusCard
          variant="success"
          titulo={emailVerificadoCopy.titulo}
          texto={emailVerificadoCopy.subtitulo}
        >
          <div className="flex flex-col gap-2">
            {session != null ? (
              <Button href={destino} variant="primary" size="md" className="w-full">
                {emailVerificadoCopy.perfilLabel}
              </Button>
            ) : null}
            <Button
              href={authRoutes.login}
              variant={session != null ? "outline" : "primary"}
              size="md"
              className="w-full"
            >
              {emailVerificadoCopy.loginLabel}
            </Button>
          </div>
        </AuthStatusCard>
        {!ready && (
          <p className="mt-4 text-center text-xs text-geo-muted">Cargando sesión…</p>
        )}
      </div>
    </AuthShell>
  );
}
