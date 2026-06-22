export const INVESTIGACION_REFRESH_STORAGE_KEY = "geoarte-investigacion-refresh";

export function markInvestigacionForRefresh(): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.setItem(INVESTIGACION_REFRESH_STORAGE_KEY, String(Date.now()));
}

export function consumeInvestigacionRefreshFlag(): boolean {
  if (typeof sessionStorage === "undefined") return false;
  const flag = sessionStorage.getItem(INVESTIGACION_REFRESH_STORAGE_KEY);
  if (!flag) return false;
  sessionStorage.removeItem(INVESTIGACION_REFRESH_STORAGE_KEY);
  return true;
}
