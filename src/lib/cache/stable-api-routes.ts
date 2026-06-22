import { PAGE_REVALIDATE_SECONDS } from "@/lib/cache/timing";

/** Rutas GET estáticas cacheables (sin parámetros dinámicos). */
export const STABLE_DATA_API_ROUTES = new Set([
  "/api/data/home",
  "/api/data/mapa",
  "/api/data/mapa/transporte",
  "/api/data/mapa/geometrias",
  "/api/data/politicas",
  "/api/data/sobre-el-proyecto",
  "/api/data/contacto",
]);

export function isStableDataApiRoute(path: string): boolean {
  const base = path.split("?")[0] ?? path;
  return STABLE_DATA_API_ROUTES.has(base);
}

export { PAGE_REVALIDATE_SECONDS };
