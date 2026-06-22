"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  resolveAnioCorteFromFilters,
  type DashboardFilterState,
} from "@/lib/dashboard/apply-dashboard-filters";
import type { ReporteFormato, ReporteHistorialRow } from "@/lib/domain/reportes";
import { buildDefaultFiltersFromPlantilla } from "@/lib/reportes/plantilla-filtros";
import { buildReportFile } from "@/lib/reportes/build-report-file";
import { buildFilteredDashboardForReport } from "@/lib/reportes/filter-dashboard-for-report";
import type { ReportesPageData } from "@/lib/services/reportes.service";
import type { DashboardPageData } from "@/lib/services/dashboard.service";
import { downloadBlob } from "@/lib/utils/download-file";

function defaultFilters(data: ReportesPageData): DashboardFilterState {
  const plantilla = data.plantillasReporte[0];
  if (!plantilla) {
    return {
      alcaldia: "Todas",
      disciplina: "Todas",
      periodo: data.filtroOpciones.periodo[0] ?? "",
      nse: "Todos",
      edad: "Todos",
      genero: "Todos",
    };
  }
  return buildDefaultFiltersFromPlantilla(plantilla.filtrosDefault, data.filtroOpciones);
}

export type ReportesFilterPreview = {
  filterSummary: string;
  filterNotice: string | null;
  totalEspacios: number;
  anioCorte: number;
  loading: boolean;
};

export function useReportesController(
  data: ReportesPageData,
  input: {
    autor: string;
    onReload: () => Promise<unknown>;
    initialPlantillaId?: string | null;
  },
) {
  const [plantillaId, setPlantillaId] = useState(() => {
    const fromUrl = input.initialPlantillaId?.trim();
    if (fromUrl && data.plantillasReporte.some((p) => p.id === fromUrl)) return fromUrl;
    return data.plantillasReporte[0]?.id ?? "p1";
  });
  const [filters, setFilters] = useState<DashboardFilterState>(() =>
    defaultFilters(data),
  );
  const [generatingFormat, setGeneratingFormat] = useState<ReporteFormato | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [historialExtra, setHistorialExtra] = useState<ReporteHistorialRow[]>([]);
  const [eliminandoHistorialId, setEliminandoHistorialId] = useState<string | null>(null);
  const [filterPreview, setFilterPreview] = useState<ReportesFilterPreview>({
    filterSummary: "",
    filterNotice: null,
    totalEspacios: 0,
    anioCorte: data.anioCorte,
    loading: true,
  });

  useEffect(() => {
    setPlantillaId((current) => {
      const nextId = data.plantillasReporte.some((p) => p.id === current)
        ? current
        : (data.plantillasReporte[0]?.id ?? "p1");
      const plantilla =
        data.plantillasReporte.find((p) => p.id === nextId) ?? data.plantillasReporte[0];
      if (plantilla) {
        setFilters(
          buildDefaultFiltersFromPlantilla(plantilla.filtrosDefault, data.filtroOpciones),
        );
      } else {
        setFilters(defaultFilters(data));
      }
      return nextId;
    });
  }, [data.filtroOpciones, data.plantillasReporte]);

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setFilterPreview((prev) => ({ ...prev, loading: true }));
      try {
        const anioCorte = resolveAnioCorteFromFilters(filters, data.anioCorte);
        const res = await fetch(
          `/api/data/dashboard?anioCorte=${encodeURIComponent(String(anioCorte))}`,
          { cache: "no-store" },
        );
        const dashboard = (await res.json()) as DashboardPageData & { error?: string };
        if (!res.ok) {
          throw new Error(dashboard.error ?? "No se pudieron cargar métricas");
        }

        const filtered = buildFilteredDashboardForReport(dashboard, filters);
        if (cancelled) return;
        setFilterPreview({
          filterSummary: filtered.filterSummary,
          filterNotice: filtered.filterNotice,
          totalEspacios: filtered.espaciosTablaRows.length,
          anioCorte: dashboard.anioCorte,
          loading: false,
        });
      } catch {
        if (!cancelled) {
          setFilterPreview((prev) => ({ ...prev, loading: false }));
        }
      }
    }, 450);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [filters, data.anioCorte]);

  const plantilla = useMemo(() => {
    return (
      data.plantillasReporte.find((p) => p.id === plantillaId) ??
      data.plantillasReporte[0] ?? {
        id: "p1",
        titulo: "Reporte",
        desc: "",
        categoria: "Exportación",
        formatos: ["PDF"] as ReporteFormato[],
        filtrosDefault: {},
      }
    );
  }, [data.plantillasReporte, plantillaId]);

  const historialReportes = useMemo(
    () => [...historialExtra, ...data.historialReportes],
    [historialExtra, data.historialReportes],
  );

  function selectPlantilla(id: string) {
    const next = data.plantillasReporte.find((p) => p.id === id);
    if (!next) return;
    setPlantillaId(id);
    setFilters(buildDefaultFiltersFromPlantilla(next.filtrosDefault, data.filtroOpciones));
  }

  const setAlcaldia = useCallback((alcaldia: string) => {
    setFilters((f) => ({ ...f, alcaldia }));
  }, []);
  const setDisciplina = useCallback((disciplina: string) => {
    setFilters((f) => ({ ...f, disciplina }));
  }, []);
  const setPeriodo = useCallback((periodo: string) => {
    setFilters((f) => ({ ...f, periodo }));
  }, []);
  const setNse = useCallback((nse: string) => {
    setFilters((f) => ({ ...f, nse }));
  }, []);
  const setEdad = useCallback((edad: string) => {
    setFilters((f) => ({ ...f, edad }));
  }, []);
  const setGenero = useCallback((genero: string) => {
    setFilters((f) => ({ ...f, genero }));
  }, []);

  async function generarLocal(format: ReporteFormato) {
    const anioCorte = resolveAnioCorteFromFilters(filters, data.anioCorte);
    const res = await fetch(
      `/api/data/dashboard?anioCorte=${encodeURIComponent(String(anioCorte))}`,
      { cache: "no-store" },
    );
    const dashboard = (await res.json()) as DashboardPageData & { error?: string };
    if (!res.ok) {
      throw new Error(dashboard.error ?? "No se pudieron cargar métricas");
    }

    const filtered = buildFilteredDashboardForReport(dashboard, filters);
    const file = await buildReportFile({
      plantillaTitulo: plantilla.titulo,
      plantillaCategoria: plantilla.categoria,
      format,
      filters,
      filtered,
      anioCorte: dashboard.anioCorte,
      conteoPorAlcaldia: dashboard.raw?.conteoPorAlcaldia,
    });

    downloadBlob(
      new Blob([new Uint8Array(file.bytes)], { type: file.mimeType }),
      file.fileName,
    );

    const demoRow: ReporteHistorialRow = {
      id: `local-${Date.now()}`,
      titulo: file.fileName,
      estado: "Generado",
      categoria: plantilla.categoria,
      fecha: new Date().toLocaleDateString("es-MX", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      autor: input.autor,
      formato: format,
      canDownload: false,
      downloadUrl: null,
    };
    setHistorialExtra((prev) => [demoRow, ...prev]);
    return `${format} descargado (modo demo)`;
  }

  async function generarReporte(format: ReporteFormato) {
    if (generatingFormat != null) return;
    if (!plantilla.formatos.includes(format)) {
      setStatusMessage(`El formato ${format} no está disponible para esta plantilla.`);
      return;
    }

    setGeneratingFormat(format);
    setStatusMessage(null);

    try {
      if (data.canGenerateRemote) {
        const res = await fetch("/api/reportes/generar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plantillaId, format, filters }),
        });
        const body = (await res.json()) as {
          error?: string;
          downloadUrl?: string;
          fileName?: string;
          id?: string;
          format?: string;
          metaLabel?: string;
        };

        if (!res.ok) {
          throw new Error(body.error ?? "Error al generar el reporte");
        }

        if (body.downloadUrl) {
          const dl = await fetch(body.downloadUrl);
          if (!dl.ok) {
            const errBody = (await dl.json().catch(() => null)) as { error?: string } | null;
            throw new Error(errBody?.error ?? "No se pudo descargar el archivo generado");
          }
          const blob = await dl.blob();
          downloadBlob(blob, body.fileName ?? "geoarte-reporte.bin");
        }

        await input.onReload();
        setStatusMessage(`${format} generado y guardado en tu historial.`);
      } else {
        const msg = await generarLocal(format);
        setStatusMessage(msg);
      }
    } catch (err) {
      const detail =
        err instanceof Error ? err.message : "No se pudo generar el reporte";
      setStatusMessage(`Error: ${detail}`);
    } finally {
      setGeneratingFormat(null);
      window.setTimeout(() => setStatusMessage(null), 4000);
    }
  }

  async function descargarHistorial(row: ReporteHistorialRow) {
    if (!row.canDownload || !row.downloadUrl) {
      setStatusMessage(
        row.downloadUnavailableReason ??
          "Esta exportación no tiene archivo descargable en la web.",
      );
      window.setTimeout(() => setStatusMessage(null), 4000);
      return;
    }

    try {
      const res = await fetch(row.downloadUrl);
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? "No se pudo descargar el archivo");
      }
      const blob = await res.blob();
      downloadBlob(blob, row.nombreArchivo ?? row.titulo);
      setStatusMessage("Descarga iniciada.");
    } catch (err) {
      const detail = err instanceof Error ? err.message : "Error de descarga";
      setStatusMessage(`Error: ${detail}`);
    } finally {
      window.setTimeout(() => setStatusMessage(null), 3200);
    }
  }

  async function eliminarHistorial(row: ReporteHistorialRow) {
    if (eliminandoHistorialId != null) return;

    if (row.id.startsWith("local-")) {
      setHistorialExtra((prev) => prev.filter((item) => item.id !== row.id));
      setStatusMessage("Registro demo eliminado.");
      window.setTimeout(() => setStatusMessage(null), 3200);
      return;
    }

    const confirmed = window.confirm(
      `¿Eliminar "${row.titulo}" del historial? Esta acción no se puede deshacer.`,
    );
    if (!confirmed) return;

    setEliminandoHistorialId(row.id);
    try {
      const res = await fetch(
        `/api/reportes/eliminar?id=${encodeURIComponent(row.id)}`,
        { method: "DELETE" },
      );
      const body = (await res.json().catch(() => null)) as { error?: string } | null;
      if (!res.ok) {
        throw new Error(body?.error ?? "No se pudo eliminar la exportación");
      }

      setHistorialExtra((prev) => prev.filter((item) => item.id !== row.id));
      await input.onReload();
      setStatusMessage("Exportación eliminada del historial.");
    } catch (err) {
      const detail =
        err instanceof Error ? err.message : "No se pudo eliminar la exportación";
      setStatusMessage(`Error: ${detail}`);
    } finally {
      setEliminandoHistorialId(null);
      window.setTimeout(() => setStatusMessage(null), 3200);
    }
  }

  return {
    plantillaId,
    plantilla,
    selectPlantilla,
    filters,
    setAlcaldia,
    setDisciplina,
    setPeriodo,
    setNse,
    setEdad,
    setGenero,
    generatingFormat,
    statusMessage,
    filterPreview,
    historialReportes,
    generarReporte,
    descargarHistorial,
    eliminarHistorial,
    eliminandoHistorialId,
  };
}

export type ReportesControllerState = ReturnType<typeof useReportesController>;
