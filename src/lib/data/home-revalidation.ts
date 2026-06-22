import { getQueryClient } from "@/contexts/QueryProvider";
import { queryKeys } from "@/lib/cache/query-keys";

const STALE_KEY = "geoarte:home-data-stale";
export const HOME_DATA_STALE_EVENT = "geoarte:home-data-stale";

/** Marca los datos del inicio como desactualizados (p. ej. tras editar en Admin). */
export function markHomeDataStale(): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(STALE_KEY, String(Date.now()));
  getQueryClient().invalidateQueries({ queryKey: queryKeys.home });
  window.dispatchEvent(new CustomEvent(HOME_DATA_STALE_EVENT));
}

/** Indica si hay una revalidación pendiente y limpia la marca. */
export function consumeHomeDataStale(): boolean {
  if (typeof window === "undefined") return false;
  const stale = sessionStorage.getItem(STALE_KEY) != null;
  if (stale) sessionStorage.removeItem(STALE_KEY);
  return stale;
}

export function isHomeDataStale(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(STALE_KEY) != null;
}
