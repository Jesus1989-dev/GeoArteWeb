import { getQueryClient } from "@/contexts/QueryProvider";
import { queryKeys } from "@/lib/cache/query-keys";

export const CONTACTO_REFRESH_STORAGE_KEY = "geoarte-contacto-refresh";

export function markContactoForRefresh(): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.setItem(CONTACTO_REFRESH_STORAGE_KEY, String(Date.now()));
  getQueryClient().invalidateQueries({ queryKey: queryKeys.contacto });
}

export function consumeContactoRefreshFlag(): boolean {
  if (typeof sessionStorage === "undefined") return false;
  const flag = sessionStorage.getItem(CONTACTO_REFRESH_STORAGE_KEY);
  if (!flag) return false;
  sessionStorage.removeItem(CONTACTO_REFRESH_STORAGE_KEY);
  return true;
}
