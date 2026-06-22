"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthProvider";
import { authRoutes } from "@/lib/data/mock/auth";
import { isAuthPath, isProtectedPath } from "@/lib/auth/route-access";

function AuthLoading() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-3 bg-background px-4">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-geo-pink border-t-transparent" />
      <p className="text-sm text-geo-muted">Comprobando sesión…</p>
    </div>
  );
}

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { session, ready } = useAuth();

  const authRoute = isAuthPath(pathname);
  const protectedRoute = isProtectedPath(pathname);

  useEffect(() => {
    if (!ready || authRoute || session != null) return;
    const next =
      pathname === "/"
        ? ""
        : `?next=${encodeURIComponent(pathname)}`;
    router.replace(`${authRoutes.login}${next}`);
  }, [ready, authRoute, session, pathname, router]);

  if (authRoute || !protectedRoute) {
    return <>{children}</>;
  }

  if (!ready || session == null) {
    return <AuthLoading />;
  }

  return <>{children}</>;
}
