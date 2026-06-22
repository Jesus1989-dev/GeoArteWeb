import type { DashboardFilterState } from "@/lib/dashboard/apply-dashboard-filters";
import {
  applyDashboardFilters,
  applyMockDashboardFilters,
} from "@/lib/dashboard/apply-dashboard-filters";
import type { DashboardPageData } from "@/lib/services/dashboard.service";

export function buildFilteredDashboardForReport(
  dashboard: DashboardPageData,
  filters: DashboardFilterState,
) {
  if (dashboard.raw != null) {
    return applyDashboardFilters(
      dashboard.raw,
      filters,
      dashboard.raw.densidadCiudad,
    );
  }

  return applyMockDashboardFilters(
    {
      dashboardKpis: dashboard.dashboardKpis,
      participacionGenero: dashboard.participacionGenero,
      participacionMaxY: dashboard.participacionMaxY,
      tendenciaAsistencia: dashboard.tendenciaAsistencia,
      tendenciaTitulo: dashboard.tendenciaTitulo,
      densidadInfra: dashboard.densidadInfra,
      distribucionTipologia: dashboard.distribucionTipologia,
      espaciosTablaRows: dashboard.espaciosTablaRows,
      anioCorte: dashboard.anioCorte,
    },
    filters,
  );
}
