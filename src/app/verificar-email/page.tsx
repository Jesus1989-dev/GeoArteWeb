import { Suspense } from "react";
import { AuthShell } from "@/components/features/auth/AuthShell";
import { VerificarEmailController } from "@/components/features/auth/VerificarEmailController";

export const metadata = {
  title: "Verificar correo",
};

function VerificarFallback() {
  return (
    <AuthShell>
      <p className="text-center text-sm text-geo-muted">Cargando…</p>
    </AuthShell>
  );
}

export default function VerificarEmailPage() {
  return (
    <Suspense fallback={<VerificarFallback />}>
      <VerificarEmailController />
    </Suspense>
  );
}
