import type { DashboardFilterState } from "@/lib/dashboard/apply-dashboard-filters";
import type { FilteredDashboardView } from "@/lib/dashboard/apply-dashboard-filters";
import type { MetricaAlcaldiaResumen } from "@/lib/domain/dashboard";
import {
  buildDashboardExportSnapshot,
  exportFilenameStem,
  type DashboardExportSnapshot,
} from "@/lib/dashboard/build-export-snapshot";
import { alcaldiaKpiDetalleToRecord } from "@/lib/dashboard/alcaldias-kpi-export";
import {
  buildPadronEspaciosCsv,
  buildPadronEspaciosJson,
  buildPadronEspaciosSheetAoa,
  PADRON_EXPORT_COLUMNAS,
  padronRowToJsonRecord,
  type EspacioPadronExportRow,
} from "@/lib/dashboard/padron-export";
import { formatCsvDocument, formatCsvRow } from "@/lib/utils/csv";
import { buildDashboardPdfBytes } from "@/lib/reportes/build-report-file";
import { downloadBlob, downloadText } from "@/lib/utils/download-file";

export type DashboardExportKind =
  | "pdf"
  | "csv-full"
  | "csv-espacios"
  | "json"
  | "json-espacios"
  | "geojson"
  | "xlsx"
  /** Padrón segmentado (exportación rápida): hoja Espacios primero. */
  | "xlsx-espacios";

export type DashboardExportInput = {
  filters: DashboardFilterState;
  filtered: FilteredDashboardView;
  anioCorte: number;
  conteoPorAlcaldia?: Record<string, number>;
  metricasPorAlcaldia?: Record<string, MetricaAlcaldiaResumen>;
};

function buildFullCsv(snapshot: DashboardExportSnapshot): string {
  const lines: string[] = [];
  lines.push("Informe Estadísticas GeoArteCDMX");
  lines.push(
    formatCsvRow([
      "Filtros",
      "Territorio",
      "Disciplina",
      "Periodo",
      "NSE",
      "Género",
      "Edad",
      "Año",
    ]),
  );
  lines.push(
    formatCsvRow([
      "",
      snapshot.territorio,
      snapshot.disciplina,
      snapshot.periodo,
      snapshot.nse,
      snapshot.genero,
      snapshot.edad,
      snapshot.anio,
    ]),
  );
  lines.push("");
  lines.push(formatCsvRow(["Espacios filtrados", snapshot.totalEspaciosFiltrados]));
  if (snapshot.filterNotice) {
    lines.push(formatCsvRow(["Aviso", snapshot.filterNotice]));
  }
  if (snapshot.muestraLineas.length > 0) {
    lines.push("Muestra (nombre · territorio)");
    for (const line of snapshot.muestraLineas) {
      lines.push(formatCsvRow([line]));
    }
  }
  lines.push("");
  lines.push("Participación por Género");
  lines.push(formatCsvRow(["Género", "Porcentaje (%)"]));
  for (let i = 0; i < snapshot.participacionEtiquetas.length; i++) {
    lines.push(
      formatCsvRow([
        snapshot.participacionEtiquetas[i],
        snapshot.participacionValores[i].toFixed(1),
      ]),
    );
  }
  lines.push("");
  lines.push(snapshot.tendenciaTitulo);
  lines.push(formatCsvRow(["Mes", "Cantidad"]));
  for (let i = 0; i < snapshot.tendenciaMeses.length; i++) {
    lines.push(
      formatCsvRow([snapshot.tendenciaMeses[i], Math.round(snapshot.tendenciaValores[i])]),
    );
  }
  if (snapshot.espaciosPorAlcaldiaNombres.length > 0) {
    lines.push("");
    lines.push("Espacios por alcaldía");
    lines.push(formatCsvRow(["Alcaldía", "Total espacios"]));
    for (let i = 0; i < snapshot.espaciosPorAlcaldiaNombres.length; i++) {
      lines.push(
        formatCsvRow([
          snapshot.espaciosPorAlcaldiaNombres[i],
          snapshot.espaciosPorAlcaldiaTotales[i] ?? 0,
        ]),
      );
    }
  }
  lines.push("");
  lines.push("Densidad Territorial");
  lines.push(formatCsvRow(["Zona", "Cobertura territorial"]));
  for (let i = 0; i < snapshot.densidadZonas.length; i++) {
    lines.push(
      formatCsvRow([snapshot.densidadZonas[i], snapshot.densidadPorcentajes[i]]),
    );
  }
  lines.push("");
  lines.push(formatCsvRow(["Generado", new Date().toISOString()]));
  return formatCsvDocument(lines);
}

function padronRows(snapshot: DashboardExportSnapshot): EspacioPadronExportRow[] {
  return snapshot.espaciosPadronExportRows;
}

function buildKpisSheetAoa(snapshot: DashboardExportSnapshot): (string | number)[][] {
  const lines: (string | number)[][] = [
    ["KPIs — Resumen (filtro actual)"],
    ["Indicador", "Valor", "Detalle"],
    ...snapshot.kpis.map((k) => [k.label, k.value, k.delta]),
  ];

  const esTodaLaCdmx = snapshot.territorio === "Todas";

  if (esTodaLaCdmx && snapshot.kpisPorAlcaldia.length > 0) {
    lines.push(
      [],
      [`KPIs por alcaldía — toda la CDMX · corte ${snapshot.anio}`],
      [
        "Alcaldía",
        "Espacios (SECTEI / métrica)",
        "Espacios en filtro actual",
        "Cobertura territorial (%)",
        "Brecha territorial (%)",
        "Tipologías activas (filtro)",
      ],
      ...snapshot.kpisPorAlcaldia.map((row) => [
        row.alcaldia,
        row.espaciosSectei ?? "",
        row.espaciosEnFiltro,
        row.coberturaPorcentaje ?? "",
        row.brechaPorcentaje ?? "",
        row.tipologiasEnFiltro,
      ]),
    );
  } else if (!esTodaLaCdmx) {
    lines.push(
      [],
      [
        "Nota",
        `Desglose de las 16 alcaldías solo con territorio «Todas». Demarcación actual: ${snapshot.territorio}.`,
      ],
    );
  }

  return lines;
}

function buildEspaciosSheetAoa(snapshot: DashboardExportSnapshot): (string | number)[][] {
  return buildPadronEspaciosSheetAoa(padronRows(snapshot));
}

function buildResumenSheetAoa(snapshot: DashboardExportSnapshot): (string | number)[][] {
  const lines: (string | number)[][] = [
    ["Informe Estadísticas GeoArteCDMX"],
    ["Filtros", snapshot.filterSummary],
    ["Territorio", snapshot.territorio],
    ["Disciplina", snapshot.disciplina],
    ["Periodo", snapshot.periodo],
    ["NSE", snapshot.nse],
    ["Género", snapshot.genero],
    ["Edad", snapshot.edad],
    ["Año corte", snapshot.anio],
    ["Espacios filtrados", snapshot.totalEspaciosFiltrados],
  ];
  if (snapshot.filterNotice) {
    lines.push(["Aviso", snapshot.filterNotice]);
  }
  lines.push(
    [],
    [
      "Hojas del archivo",
      "KPIs (resumen + 16 alcaldías si territorio es Todas) · Participación · Tendencia · Espacios",
    ],
  );
  return lines;
}

/** Excel del padrón segmentado (misma data que GeoJSON), hoja Espacios activa al abrir. */
async function exportXlsxPadron(snapshot: DashboardExportSnapshot, stem: string): Promise<void> {
  const XLSX = await import("xlsx");
  const wb = XLSX.utils.book_new();

  const espacios = buildEspaciosSheetAoa(snapshot);
  const resumen = [
    ...buildResumenSheetAoa(snapshot),
    [],
    [
      "Nota",
      "El padrón completo está en la hoja «Espacios» (mismas columnas que GeoJSON/CSV).",
    ],
  ];

  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(espacios), "Espacios");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(resumen), "Resumen");

  const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  downloadBlob(
    new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    `${stem}-espacios.xlsx`,
  );
}

/** Informe completo del dashboard (varias hojas de métricas + padrón). */
async function exportXlsxInforme(snapshot: DashboardExportSnapshot, stem: string): Promise<void> {
  const XLSX = await import("xlsx");

  const resumen = buildResumenSheetAoa(snapshot);

  const kpisSheet = buildKpisSheetAoa(snapshot);

  const participacionSheet = [
    ["Género", "Porcentaje (%)"],
    ...snapshot.participacionEtiquetas.map((etiqueta, i) => [
      etiqueta,
      snapshot.participacionValores[i],
    ]),
  ];

  const tendenciaSheet = [
    ["Periodo", "Valor"],
    ...snapshot.tendenciaMeses.map((mes, i) => [mes, snapshot.tendenciaValores[i]]),
  ];

  const espaciosSheet = buildEspaciosSheetAoa(snapshot);

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(resumen), "Resumen");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(kpisSheet), "KPIs");
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.aoa_to_sheet(participacionSheet),
    "Participación",
  );
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.aoa_to_sheet(tendenciaSheet),
    "Tendencia",
  );
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(espaciosSheet), "Espacios");

  const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  downloadBlob(
    new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    `${stem}-informe.xlsx`,
  );
}

function buildInformeContenido(snapshot: DashboardExportSnapshot) {
  return {
    titulo: "Informe Estadísticas GeoArteCDMX",
    exportadoEn: new Date().toISOString(),
    filtros: {
      territorio: snapshot.territorio,
      disciplina: snapshot.disciplina,
      periodo: snapshot.periodo,
      nse: snapshot.nse,
      edad: snapshot.edad,
      genero: snapshot.genero,
      anio: snapshot.anio,
      resumen: snapshot.filterSummary,
    },
    aviso: snapshot.filterNotice,
    kpis: snapshot.kpis,
    kpisPorAlcaldia:
      snapshot.territorio === "Todas"
        ? snapshot.kpisPorAlcaldia.map(alcaldiaKpiDetalleToRecord)
        : undefined,
    participacion: snapshot.participacionEtiquetas.map((etiqueta, i) => ({
      etiqueta,
      porcentaje: snapshot.participacionValores[i],
    })),
    tendencia: {
      titulo: snapshot.tendenciaTitulo,
      meses: snapshot.tendenciaMeses,
      valores: snapshot.tendenciaValores,
    },
    densidad: snapshot.densidadZonas.map((zona, i) => ({
      zona,
      cobertura: snapshot.densidadPorcentajes[i],
    })),
    espaciosPorAlcaldia: snapshot.espaciosPorAlcaldiaNombres.map((nombre, i) => ({
      alcaldia: nombre,
      total: snapshot.espaciosPorAlcaldiaTotales[i],
    })),
    tipologia: snapshot.distribucionTipologia,
    totalEspaciosFiltrados: snapshot.totalEspaciosFiltrados,
  };
}

function buildFullJson(snapshot: DashboardExportSnapshot): string {
  return JSON.stringify(
    {
      ...buildInformeContenido(snapshot),
      espacios: padronRows(snapshot).map(padronRowToJsonRecord),
    },
    null,
    2,
  );
}

/** Informe completo del dashboard + FeatureCollection (exportación rápida GeoJSON). */
function buildInformeGeoJson(snapshot: DashboardExportSnapshot): string {
  const rows = padronRows(snapshot);
  const features = rows.map((row) => {
    const hasGeom =
      row.latitud != null &&
      row.longitud != null &&
      Number.isFinite(row.latitud) &&
      Number.isFinite(row.longitud);

    return {
      type: "Feature" as const,
      geometry: hasGeom
        ? {
            type: "Point" as const,
            coordinates: [row.longitud, row.latitud],
          }
        : null,
      properties: padronRowToJsonRecord(row),
    };
  });

  return JSON.stringify(
    {
      type: "FeatureCollection" as const,
      metadata: {
        ...buildInformeContenido(snapshot),
        capa: "Espacios culturales (padrón segmentado)",
        totalFeatures: features.length,
        conGeometria: features.filter((f) => f.geometry != null).length,
        columnas: PADRON_EXPORT_COLUMNAS,
      },
      features,
    },
    null,
    2,
  );
}

async function exportPdf(snapshot: DashboardExportSnapshot, stem: string): Promise<void> {
  const bytes = await buildDashboardPdfBytes(
    snapshot,
    "Informe de Estadisticas GeoArteCDMX",
  );
  downloadBlob(
    new Blob([bytes as BlobPart], { type: "application/pdf" }),
    `${stem}.pdf`,
  );
}

/** Ejecuta la exportación del dashboard según el formato solicitado. */
export async function runDashboardExport(
  kind: DashboardExportKind,
  input: DashboardExportInput,
): Promise<string> {
  const snapshot = buildDashboardExportSnapshot(input);
  const stem = exportFilenameStem(snapshot);

  switch (kind) {
    case "pdf":
      await exportPdf(snapshot, stem);
      return "PDF descargado";
    case "csv-full":
      downloadText(
        buildFullCsv(snapshot),
        `${stem}-informe.csv`,
        "text/csv;charset=utf-8",
      );
      return "Informe CSV descargado";
    case "csv-espacios":
      downloadText(
        buildPadronEspaciosCsv(padronRows(snapshot)),
        `${stem}-espacios.csv`,
        "text/csv;charset=utf-8",
      );
      return `CSV descargado (${snapshot.totalEspaciosFiltrados} espacios)`;
    case "json":
      downloadText(
        buildFullJson(snapshot),
        `${stem}-informe.json`,
        "application/json;charset=utf-8",
      );
      return "Informe JSON descargado";
    case "json-espacios":
      downloadText(
        buildPadronEspaciosJson({
          rows: padronRows(snapshot),
          filterSummary: snapshot.filterSummary,
          filterNotice: snapshot.filterNotice,
          territorio: snapshot.territorio,
          disciplina: snapshot.disciplina,
          periodo: snapshot.periodo,
          nse: snapshot.nse,
          edad: snapshot.edad,
          genero: snapshot.genero,
          anioCorte: snapshot.anio,
        }),
        `${stem}-espacios.json`,
        "application/json;charset=utf-8",
      );
      return `JSON descargado (${snapshot.totalEspaciosFiltrados} espacios)`;
    case "geojson":
      downloadText(
        buildInformeGeoJson(snapshot),
        `${stem}-informe.geojson`,
        "application/geo+json;charset=utf-8",
      );
      return `Informe GeoJSON (${snapshot.totalEspaciosFiltrados} espacios · métricas en metadata)`;
    case "xlsx-espacios":
      await exportXlsxPadron(snapshot, stem);
      return `Excel padrón (${snapshot.totalEspaciosFiltrados} espacios)`;
    case "xlsx":
      await exportXlsxInforme(snapshot, stem);
      return `Informe Excel (${snapshot.totalEspaciosFiltrados} espacios · 5 hojas)`;
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }
}
