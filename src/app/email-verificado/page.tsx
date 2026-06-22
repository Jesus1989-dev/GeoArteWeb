import { Suspense } from "react";
import { AuthShell } from "@/components/features/auth/AuthShell";
import { EmailVerificadoController } from "@/components/features/auth/EmailVerificadoController";

export const metadata = {
  title: "Correo verificado",
};

function EmailVerificadoFallback() {
  return (
    <AuthShell>
      <p className="text-center text-sm text-geo-muted">Cargando…</p>
    </AuthShell>
  );
}

export default function EmailVerificadoPage() {
  return (
    <Suspense fallback={<EmailVerificadoFallback />}>
      <EmailVerificadoController />
    </Suspense>
  );
}
