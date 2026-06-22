import type { DashboardFilterState } from "@/lib/dashboard/apply-dashboard-filters";
import type { FilteredDashboardView } from "@/lib/dashboard/apply-dashboard-filters";
import type { MetricaAlcaldiaResumen, ParticipacionGeneroRow } from "@/lib/domain/dashboard";
import {
  buildAlcaldiasKpiDetalle,
  type AlcaldiaKpiDetalleRow,
} from "@/lib/dashboard/alcaldias-kpi-export";
import {
  padronExportFromTablaRows,
  type EspacioPadronExportRow,
} from "@/lib/dashboard/padron-export";

/** Vista agregada para exportar (alineada con DatosExportacionEstadisticas en Flutter). */
export type DashboardExportSnapshot = {
  territorio: string;
  disciplina: string;
  periodo: string;
  nse: string;
  genero: string;
  edad: string;
  anio: number;
  filterSummary: string;
  filterNotice: string | null;
  totalEspaciosFiltrados: number;
  muestraLineas: string[];
  participacionEtiquetas: string[];
  participacionValores: number[];
  tendenciaMeses: string[];
  tendenciaValores: number[];
  espaciosPorAlcaldiaNombres: string[];
  espaciosPorAlcaldiaTotales: number[];
  densidadZonas: string[];
  densidadPorcentajes: string[];
  kpis: FilteredDashboardView["dashboardKpis"];
  kpisPorAlcaldia: AlcaldiaKpiDetalleRow[];
  espaciosTablaRows: FilteredDashboardView["espaciosTablaRows"];
  espaciosPadronExportRows: EspacioPadronExportRow[];
  distribucionTipologia: FilteredDashboardView["distribucionTipologia"];
  tendenciaTitulo: string;
};

function aggregateParticipacion(rows: ParticipacionGeneroRow[]): {
  etiquetas: string[];
  valores: number[];
} {
  let hombres = 0;
  let mujeres = 0;
  let otros = 0;
  for (const row of rows) {
    hombres += row.hombres;
    mujeres += row.mujeres;
    otros += row.otros;
  }
  const total = hombres + mujeres + otros;
  if (total <= 0) {
    return { etiquetas: [], valores: [] };
  }
  return {
    etiquetas: ["Masculino", "Femenino", "Otros"],
    valores: [
      (hombres / total) * 100,
      (mujeres / total) * 100,
      (otros / total) * 100,
    ],
  };
}

function buildConteoPorAlcaldia(
  espaciosTablaRows: FilteredDashboardView["espaciosTablaRows"],
  conteoPorAlcaldia: Record<string, number> | undefined,
  filters: DashboardFilterState,
): { nombres: string[]; totales: number[] } {
  const padronSegmentado =
    filters.alcaldia !== "Todas" ||
    filters.disciplina !== "Todas" ||
    filters.nse !== "Todos" ||
    filters.edad !== "Todos" ||
    filters.genero !== "Todos";

  if (
    !padronSegmentado &&
    conteoPorAlcaldia &&
    Object.keys(conteoPorAlcaldia).length > 0
  ) {
    const entries = Object.entries(conteoPorAlcaldia).sort((a, b) =>
      a[0].localeCompare(b[0], "es"),
    );
    return {
      nombres: entries.map(([nombre]) => nombre),
      totales: entries.map(([, total]) => total),
    };
  }

  const counts = new Map<string, number>();
  for (const row of espaciosTablaRows) {
    counts.set(row.alcaldia, (counts.get(row.alcaldia) ?? 0) + 1);
  }
  const entries = [...counts.entries()].sort((a, b) =>
    a[0].localeCompare(b[0], "es"),
  );
  return {
    nombres: entries.map(([nombre]) => nombre),
    totales: entries.map(([, total]) => total),
  };
}

export function buildDashboardExportSnapshot(input: {
  filters: DashboardFilterState;
  filtered: FilteredDashboardView;
  anioCorte: number;
  conteoPorAlcaldia?: Record<string, number>;
  metricasPorAlcaldia?: Record<string, MetricaAlcaldiaResumen>;
}): DashboardExportSnapshot {
  const { filters, filtered, anioCorte, conteoPorAlcaldia, metricasPorAlcaldia } = input;
  const participacion = aggregateParticipacion(filtered.participacionGenero);
  const { nombres, totales } = buildConteoPorAlcaldia(
    filtered.espaciosTablaRows,
    conteoPorAlcaldia,
    filters,
  );

  const espaciosPadronExportRows =
    filtered.espaciosPadronExportRows.length > 0
      ? filtered.espaciosPadronExportRows
      : padronExportFromTablaRows(filtered.espaciosTablaRows);

  const kpisPorAlcaldia = buildAlcaldiasKpiDetalle({
    metricasPorAlcaldia: metricasPorAlcaldia ?? {},
    conteoPorAlcaldia,
    padronRows: espaciosPadronExportRows,
    incluirDesgloseCiudad: filters.alcaldia === "Todas",
  });

  const muestraLineas = filtered.espaciosTablaRows.slice(0, 20).map(
    (e) => `${e.nombre} · ${e.alcaldia}`,
  );

  return {
    territorio: filters.alcaldia,
    disciplina: filters.disciplina,
    periodo: filters.periodo,
    nse: filters.nse,
    genero: filters.genero,
    edad: filters.edad,
    anio: anioCorte,
    filterSummary: filtered.filterSummary,
    filterNotice: filtered.filterNotice,
    totalEspaciosFiltrados: filtered.espaciosTablaRows.length,
    muestraLineas,
    participacionEtiquetas: participacion.etiquetas,
    participacionValores: participacion.valores,
    tendenciaMeses: filtered.tendenciaAsistencia.map((r) => r.mes),
    tendenciaValores: filtered.tendenciaAsistencia.map((r) => r.visitas),
    espaciosPorAlcaldiaNombres: nombres,
    espaciosPorAlcaldiaTotales: totales,
    densidadZonas: filtered.densidadInfra.map((d) => d.zona),
    densidadPorcentajes: filtered.densidadInfra.map((d) => `${d.valor}%`),
    kpis: filtered.dashboardKpis,
    kpisPorAlcaldia,
    espaciosTablaRows: filtered.espaciosTablaRows,
    espaciosPadronExportRows,
    distribucionTipologia: filtered.distribucionTipologia,
    tendenciaTitulo: filtered.tendenciaTitulo,
  };
}

export function exportFilenameStem(snapshot: DashboardExportSnapshot): string {
  const slug = snapshot.territorio
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ-]/g, "")
    .toLowerCase();
  return `geoarte-dashboard-${slug}-${snapshot.anio}`;
}
