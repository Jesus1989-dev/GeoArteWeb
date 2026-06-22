import { Suspense } from "react";
import { AuthShell } from "@/components/features/auth/AuthShell";
import { RestablecerContrasenaController } from "@/components/features/auth/RestablecerContrasenaController";

export const metadata = {
  title: "Restablecer contraseña",
};

function RestablecerFallback() {
  return (
    <AuthShell>
      <p className="text-center text-sm text-geo-muted">Cargando…</p>
    </AuthShell>
  );
}

export default function RestablecerContrasenaPage() {
  return (
    <Suspense fallback={<RestablecerFallback />}>
      <RestablecerContrasenaController />
    </Suspense>
  );
}
