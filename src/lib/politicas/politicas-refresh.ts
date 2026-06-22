import { getQueryClient } from "@/contexts/QueryProvider";
import { queryKeys } from "@/lib/cache/query-keys";

export const POLITICAS_REFRESH_STORAGE_KEY = "geoarte-politicas-refresh";

export function markPoliticasForRefresh(): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.setItem(POLITICAS_REFRESH_STORAGE_KEY, String(Date.now()));
  getQueryClient().invalidateQueries({ queryKey: queryKeys.politicas });
}

export function consumePoliticasRefreshFlag(): boolean {
  if (typeof sessionStorage === "undefined") return false;
  const flag = sessionStorage.getItem(POLITICAS_REFRESH_STORAGE_KEY);
  if (!flag) return false;
  sessionStorage.removeItem(POLITICAS_REFRESH_STORAGE_KEY);
  return true;
}
