import { authRoutes } from "@/lib/data/mock/auth";

export function isAuthPath(pathname: string): boolean {
  return Object.values(authRoutes).some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

/** Rutas de la aplicación que requieren sesión activa. */
export function isProtectedPath(pathname: string): boolean {
  if (pathname.startsWith("/api")) return false;
  return !isAuthPath(pathname);
}
