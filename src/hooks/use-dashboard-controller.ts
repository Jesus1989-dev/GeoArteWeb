"use client";

import { useEffect, useMemo, useState } from "react";
import type { DashboardPageData } from "@/lib/services/dashboard.service";
import {
  applyDashboardFilters,
  applyMockDashboardFilters,
  resolveAnioCorteFromFilters,
  type DashboardFilterState,
  type EspacioRawRow,
} from "@/lib/dashboard/apply-dashboard-filters";
import type { ParticipacionGeneroModo } from "@/components/features/dashboard/DashboardParidadCharts";
import { padronExportFromTablaRows } from "@/lib/dashboard/padron-export";
import {
  buildComparadorMetricas,
  buildHallazgoTerritorial,
  fetchDensidadMacrozona,
} from "@/lib/data/supabase/dashboard.repository";
import {
  runDashboardExport,
  type DashboardExportKind,
} from "@/lib/dashboard/export-dashboard";

export const DASHBOARD_TABLA_PAGE_SIZE = 20;

/** Controlador de UI — estado, filtros en vivo y eventos del dashboard. */
export function useDashboardController(initialData: DashboardPageData) {
  const [dashboardData, setDashboardData] = useState(initialData);
  const [periodoLoading, setPeriodoLoading] = useState(false);

  useEffect(() => {
    setDashboardData(initialData);
    setEspaciosLoading(
      initialData.dataSource === "supabase" &&
        initialData.raw != null &&
        initialData.raw.espacios.length === 0,
    );
  }, [initialData]);

  useEffect(() => {
    if (dashboardData.raw == null) return;
    if (dashboardData.raw.espacios.length > 0) return;
    if (dashboardData.dataSource !== "supabase") return;

    let cancelled = false;
    setEspaciosLoading(true);

    fetch("/api/data/dashboard/espacios", { cache: "no-store" })
      .then(async (res) => {
        const body = (await res.json()) as {
          espacios?: EspacioRawRow[];
          error?: string;
        };
        if (!res.ok) {
          throw new Error(body.error ?? "No se pudo cargar el padrón de espacios");
        }
        return body.espacios ?? [];
      })
      .then((espacios) => {
        if (cancelled) return;
        setDashboardData((prev) =>
          prev.raw == null ? prev : { ...prev, raw: { ...prev.raw, espacios } },
        );
      })
      .catch((err) => {
        console.error("[dashboard] espacios:", err);
      })
      .finally(() => {
        if (!cancelled) setEspaciosLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [dashboardData.raw, dashboardData.dataSource]);

  const { filtroOpciones, alcaldiasComparador } = dashboardData;

  const [alcaldia, setAlcaldia] = useState<string>(filtroOpciones.alcaldia[0] ?? "Todas");
  const [disciplina, setDisciplina] = useState<string>(
    filtroOpciones.disciplina[0] ?? "Todas",
  );
  const [periodo, setPeriodo] = useState<string>(filtroOpciones.periodo[0] ?? "");
  const [nse, setNse] = useState<string>(
    filtroOpciones.nivelSocioeconomico[0] ?? "Todos",
  );
  const [edad, setEdad] = useState<string>(filtroOpciones.rangoEdad[0] ?? "Todos");
  const [genero, setGenero] = useState<string>(filtroOpciones.genero[0] ?? "Todos");
  const [borA, setBorA] = useState<string>(alcaldiasComparador[0] ?? "");
  const [borB, setBorB] = useState<string>(
    alcaldiasComparador[1] ?? alcaldiasComparador[0] ?? "",
  );
  const [exportHint, setExportHint] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [espaciosLoading, setEspaciosLoading] = useState(
    () =>
      initialData.dataSource === "supabase" &&
      initialData.raw != null &&
      initialData.raw.espacios.length === 0,
  );
  const [densidadMacrozonas, setDensidadMacrozonas] = useState(
    initialData.raw?.densidadCiudad ?? [],
  );
  const [densidadLoading, setDensidadLoading] = useState(false);
  const [tablaPage, setTablaPage] = useState(1);
  const [tendenciaModo, setTendenciaModo] = useState<"acumulado" | "por_anio">("acumulado");
  const [participacionGeneroModo, setParticipacionGeneroModo] =
    useState<ParticipacionGeneroModo>("agregado");

  const filters: DashboardFilterState = useMemo(
    () => ({ alcaldia, disciplina, periodo, nse, edad, genero }),
    [alcaldia, disciplina, periodo, nse, edad, genero],
  );

  useEffect(() => {
    setTablaPage(1);
  }, [filters]);

  useEffect(() => {
    if (dashboardData.raw == null) return;

    const targetAnio = resolveAnioCorteFromFilters(
      { periodo },
      initialData.anioCorte,
    );
    if (targetAnio === dashboardData.anioCorte) return;

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setPeriodoLoading(true);
      try {
        const res = await fetch(
          `/api/data/dashboard?anioCorte=${encodeURIComponent(String(targetAnio))}&includeEspacios=false`,
          { cache: "no-store" },
        );
        const next = (await res.json()) as DashboardPageData & { error?: string };
        if (!res.ok) {
          throw new Error(next.error ?? "No se pudieron cargar métricas del periodo");
        }
        if (!cancelled) {
          setDashboardData((prev) => ({
            ...next,
            raw:
              next.raw != null
                ? {
                    ...next.raw,
                    espacios: prev.raw?.espacios.length ? prev.raw.espacios : next.raw.espacios,
                  }
                : null,
          }));
          setDensidadMacrozonas(next.raw?.densidadCiudad ?? []);
        }
      } catch (err) {
        console.error("[dashboard] periodo:", err);
      } finally {
        if (!cancelled) setPeriodoLoading(false);
      }
    }, 350);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [periodo, initialData.anioCorte, dashboardData.anioCorte, dashboardData.raw]);

  useEffect(() => {
    if (dashboardData.raw == null) return;

    let cancelled = false;

    async function loadDensidad() {
      if (alcaldia === "Todas") {
        setDensidadMacrozonas(dashboardData.raw!.densidadCiudad);
        setDensidadLoading(false);
        return;
      }

      setDensidadLoading(true);
      const rows = await fetchDensidadMacrozona(alcaldia);
      if (!cancelled) {
        setDensidadMacrozonas(
          rows.length > 0 ? rows : dashboardData.raw!.densidadCiudad,
        );
        setDensidadLoading(false);
      }
    }

    loadDensidad();

    return () => {
      cancelled = true;
    };
  }, [alcaldia, dashboardData.raw]);

  const filtered = useMemo(() => {
    if (dashboardData.raw != null) {
      return applyDashboardFilters(dashboardData.raw, filters, densidadMacrozonas);
    }

    if (dashboardData.dataSource === "supabase") {
      const usaExistencia =
        dashboardData.tendenciaTitulo.includes("Existencia") ||
        dashboardData.tendenciaTitulo.includes("existencia");
      return {
        dashboardKpis: dashboardData.dashboardKpis,
        participacionGenero: dashboardData.participacionGenero,
        participacionGeneroAgregado: {
          etiquetas: ["Mujeres", "Hombres", "Otros"],
          valores: [0, 0, 0],
          maxY: 100,
          tieneDatos: false,
        },
        participacionMaxY: dashboardData.participacionMaxY,
        tendenciaAsistencia: dashboardData.tendenciaAsistencia,
        tendenciaTitulo: dashboardData.tendenciaTitulo,
        tendenciaLeyendaPrincipal: usaExistencia
          ? "Espacios en padrón"
          : "Espacios en padrón",
        tendenciaLeyendaSecundaria: null,
        tendenciaInventario: {
          acumulado: dashboardData.tendenciaAsistencia,
          porAnio: dashboardData.tendenciaAsistencia,
          territorioLabel: "Toda la CDMX",
          tieneDatos: dashboardData.tendenciaAsistencia.length > 0,
        },
        participacionNse: {
          etiquetas: ["NSE bajo", "NSE medio", "NSE alto"],
          valores: [0, 0, 0],
          maxY: 52,
          tieneDatos: false,
          avisoFallbackGlobal: false,
        },
        movilidadPorModo: [],
        metricasNegocio: null,
        densidadInfra: dashboardData.densidadInfra,
        distribucionTipologia: dashboardData.distribucionTipologia,
        espaciosTablaRows: dashboardData.espaciosTablaRows,
        espaciosPadronExportRows: padronExportFromTablaRows(
          dashboardData.espaciosTablaRows,
        ),
        filterSummary: dashboardData.filterSummary,
        filterNotice: dashboardData.filterNotice,
        hasParticipacionDatos: dashboardData.participacionGenero.some(
          (r) => r.hombres > 0 || r.mujeres > 0 || r.otros > 0,
        ),
      };
    }

    return applyMockDashboardFilters(
      {
        dashboardKpis: dashboardData.dashboardKpis,
        participacionGenero: dashboardData.participacionGenero,
        participacionMaxY: dashboardData.participacionMaxY,
        tendenciaAsistencia: dashboardData.tendenciaAsistencia,
        tendenciaTitulo: dashboardData.tendenciaTitulo,
        densidadInfra: dashboardData.densidadInfra,
        distribucionTipologia: dashboardData.distribucionTipologia,
        espaciosTablaRows: dashboardData.espaciosTablaRows,
        anioCorte: dashboardData.anioCorte,
      },
      filters,
    );
  }, [dashboardData, filters, densidadMacrozonas]);

  const espaciosTablaAll = filtered.espaciosTablaRows;
  const espaciosTablaTotal = espaciosTablaAll.length;
  const tablaTotalPaginas = Math.max(
    1,
    Math.ceil(espaciosTablaTotal / DASHBOARD_TABLA_PAGE_SIZE),
  );

  const espaciosTabla = useMemo(() => {
    const page = Math.min(tablaPage, tablaTotalPaginas);
    const start = (page - 1) * DASHBOARD_TABLA_PAGE_SIZE;
    return espaciosTablaAll.slice(start, start + DASHBOARD_TABLA_PAGE_SIZE);
  }, [espaciosTablaAll, tablaPage, tablaTotalPaginas]);

  const comparadorMetricas = useMemo(() => {
    const dynamic = buildComparadorMetricas(
      dashboardData.metricasPorAlcaldia,
      borA,
      borB,
    );
    if (dynamic.length > 0) return dynamic;
    return dashboardData.comparadorMetricas;
  }, [
    borA,
    borB,
    dashboardData.comparadorMetricas,
    dashboardData.metricasPorAlcaldia,
  ]);

  const hallazgoTerritorial = useMemo(() => {
    if (Object.keys(dashboardData.metricasPorAlcaldia).length === 0) {
      return dashboardData.hallazgoTerritorial;
    }
    return buildHallazgoTerritorial(dashboardData.metricasPorAlcaldia, borA, borB);
  }, [borA, borB, dashboardData.hallazgoTerritorial, dashboardData.metricasPorAlcaldia]);

  async function exportDashboard(kind: DashboardExportKind) {
    if (exporting) return;
    setExporting(true);
    try {
      const message = await runDashboardExport(kind, {
        filters,
        filtered: {
          ...filtered,
          espaciosTablaRows: espaciosTablaAll,
          espaciosPadronExportRows: filtered.espaciosPadronExportRows,
        },
        anioCorte: dashboardData.anioCorte,
        conteoPorAlcaldia: dashboardData.raw?.conteoPorAlcaldia,
        metricasPorAlcaldia: dashboardData.metricasPorAlcaldia,
      });
      setExportHint(message);
    } catch (err) {
      const detail =
        err instanceof Error ? err.message : "No se pudo generar el archivo";
      setExportHint(`Error: ${detail}`);
    } finally {
      setExporting(false);
      window.setTimeout(() => setExportHint(null), 3200);
    }
  }

  function swapAlcaldias() {
    setBorA(borB);
    setBorB(borA);
  }

  return {
    dashboardData,
    alcaldia,
    setAlcaldia,
    disciplina,
    setDisciplina,
    periodo,
    setPeriodo,
    nse,
    setNse,
    edad,
    setEdad,
    genero,
    setGenero,
    borA,
    setBorA,
    borB,
    setBorB,
    exportHint,
    exporting,
    exportDashboard,
    swapAlcaldias,
    comparadorMetricas,
    hallazgoTerritorial,
    filtered,
    espaciosTabla,
    espaciosTablaTotal,
    tablaPage,
    setTablaPage,
    tablaTotalPaginas,
    densidadLoading,
    periodoLoading,
    espaciosLoading,
    filterSummary: filtered.filterSummary,
    filterNotice: filtered.filterNotice,
    tendenciaModo,
    setTendenciaModo,
    participacionGeneroModo,
    setParticipacionGeneroModo,
  };
}

export type DashboardControllerState = ReturnType<typeof useDashboardController>;
