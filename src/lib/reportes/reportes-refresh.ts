export const REPORTES_REFRESH_STORAGE_KEY = "geoarte-reportes-refresh";

export function markReportesForRefresh(): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.setItem(REPORTES_REFRESH_STORAGE_KEY, String(Date.now()));
}

export function consumeReportesRefreshFlag(): boolean {
  if (typeof sessionStorage === "undefined") return false;
  const flag = sessionStorage.getItem(REPORTES_REFRESH_STORAGE_KEY);
  if (!flag) return false;
  sessionStorage.removeItem(REPORTES_REFRESH_STORAGE_KEY);
  return true;
}
