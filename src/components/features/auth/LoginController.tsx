import { Suspense } from "react";
import { LoginView } from "@/components/features/auth/LoginView";
import { getAuthPageData } from "@/lib/services/auth.service";

/** Server Component: lee TEST_LOGIN_* del .env (mismos nombres que SECTEI). */
export function LoginController() {
  const data = getAuthPageData();
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center text-sm text-geo-muted">
          Cargando inicio de sesión…
        </div>
      }
    >
      <LoginView data={data} />
    </Suspense>
  );
}
