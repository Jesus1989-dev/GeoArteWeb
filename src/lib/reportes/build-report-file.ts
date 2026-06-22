import type { MetricaAlcaldiaResumen } from "@/lib/domain/dashboard";
import type { DashboardExportInput } from "@/lib/dashboard/export-dashboard";
import {
  buildDashboardExportSnapshot,
  exportFilenameStem,
  type DashboardExportSnapshot,
} from "@/lib/dashboard/build-export-snapshot";
import type { ReporteFormato } from "@/lib/reportes/plantillas-reporte";
import { slugifyReportName } from "@/lib/reportes/plantillas-reporte";
import { buildPadronEspaciosSheetAoa } from "@/lib/dashboard/padron-export";
import { formatCsvDocument, formatCsvRow } from "@/lib/utils/csv";
import type { CuestionarioExportInput } from "@/lib/cuestionario/export-cuestionario";
import { buildCuestionarioReportSheets } from "@/lib/cuestionario/export-cuestionario";
import { createGeoArtePdfWriter } from "@/lib/pdf/geoarte-pdf";

export type ReportFileBuildInput = DashboardExportInput & {
  plantillaTitulo: string;
  plantillaCategoria: string;
  cuestionario?: CuestionarioExportInput | null;
};

function buildFullCsv(snapshot: DashboardExportSnapshot, reportTitle: string): string {
  const lines: string[] = [];
  lines.push(reportTitle);
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
      formatCsvRow([
        snapshot.tendenciaMeses[i],
        Math.round(snapshot.tendenciaValores[i]),
      ]),
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

export type BuildDashboardPdfOptions = {
  metricasPorAlcaldia?: Record<string, MetricaAlcaldiaResumen>;
  /** Filas del padrón incluidas al final del PDF (anexo). */
  maxEspaciosAnexo?: number;
  /** Aviso cuando el padrón completo se entrega en un archivo aparte. */
  anexoExternoNote?: string;
  cuestionario?: CuestionarioExportInput | null;
};

export async function buildDashboardPdfBytes(
  snapshot: DashboardExportSnapshot,
  reportTitle: string,
  options: BuildDashboardPdfOptions = {},
): Promise<Uint8Array> {
  const pdf = await createGeoArtePdfWriter();

  pdf.writeDocumentTitle(reportTitle);
  pdf.writeMetaLine(`Generado: ${new Date().toLocaleString("es-MX")}`);
  pdf.addGap(2);

  pdf.writeSectionTitle("Contexto del informe");
  pdf.addKeyValueTable([
    ["Resumen de filtros", snapshot.filterSummary],
    ["Territorio", snapshot.territorio],
    ["Disciplina", snapshot.disciplina],
    ["Periodo", snapshot.periodo],
    ["NSE", snapshot.nse],
    ["Genero", snapshot.genero],
    ["Edad", snapshot.edad],
    ["Ano de corte", snapshot.anio],
    ["Espacios filtrados", snapshot.totalEspaciosFiltrados],
    ...(snapshot.filterNotice ? [["Aviso", snapshot.filterNotice] as [string, string]] : []),
  ]);

  if (snapshot.muestraLineas.length > 0) {
    pdf.writeSectionTitle("Muestra del padrón");
    pdf.addDataTable(
      ["Espacio", "Territorio"],
      snapshot.muestraLineas.slice(0, 12).map((line) => {
        const parts = line.split(" · ");
        const territorio = parts.pop() ?? "";
        return [parts.join(" · "), territorio];
      }),
    );
  }

  pdf.writeSectionTitle("Indicadores clave");
  pdf.addDataTable(
    ["Indicador", "Valor", "Detalle"],
    snapshot.kpis.map((kpi) => [kpi.label, kpi.value, kpi.delta]),
  );

  if (snapshot.participacionEtiquetas.length > 0) {
    pdf.writeSectionTitle("Participacion por genero (%)");
    pdf.addDataTable(
      ["Genero", "Porcentaje"],
      snapshot.participacionEtiquetas.map((etiqueta, i) => [
        etiqueta,
        `${snapshot.participacionValores[i]?.toFixed(1) ?? 0}%`,
      ]),
    );
  }

  if (snapshot.tendenciaMeses.length > 0) {
    pdf.writeSectionTitle(snapshot.tendenciaTitulo);
    pdf.addDataTable(
      ["Periodo", "Valor"],
      snapshot.tendenciaMeses.map((mes, i) => [
        mes,
        Math.round(snapshot.tendenciaValores[i] ?? 0),
      ]),
    );
  }

  if (snapshot.espaciosPorAlcaldiaNombres.length > 0) {
    pdf.writeSectionTitle("Espacios por alcaldia");
    pdf.addDataTable(
      ["Alcaldia", "Total espacios"],
      snapshot.espaciosPorAlcaldiaNombres.map((nombre, i) => [
        nombre,
        snapshot.espaciosPorAlcaldiaTotales[i] ?? 0,
      ]),
    );
  }

  if (snapshot.densidadZonas.length > 0) {
    pdf.writeSectionTitle("Densidad territorial");
    pdf.addDataTable(
      ["Macrozona", "Cobertura"],
      snapshot.densidadZonas.map((zona, i) => [zona, snapshot.densidadPorcentajes[i] ?? ""]),
    );
  }

  const metricas = options.metricasPorAlcaldia ?? {};
  const metricasEntries = Object.entries(metricas).sort(([a], [b]) =>
    a.localeCompare(b, "es"),
  );
  if (metricasEntries.length > 0) {
    pdf.writeSectionTitle("Indicadores por alcaldia");
    pdf.addDataTable(
      ["Alcaldia", "Espacios", "Cobertura (%)", "Brecha (%)"],
      metricasEntries.map(([nombre, m]) => [
        nombre,
        m.cantidadEspacios,
        m.porcentajeCobertura,
        m.porcentajeBrecha,
      ]),
    );
  }

  if (snapshot.distribucionTipologia.length > 0) {
    pdf.writeSectionTitle("Distribucion por tipologia");
    pdf.addDataTable(
      ["Tipologia", "Espacios"],
      snapshot.distribucionTipologia.map((row) => [row.name, row.value]),
    );
  }

  const maxAnexo = options.maxEspaciosAnexo ?? 0;
  if (maxAnexo > 0 && snapshot.espaciosPadronExportRows.length > 0) {
    const showing = Math.min(maxAnexo, snapshot.espaciosPadronExportRows.length);
    const anexoTitulo =
      showing >= snapshot.totalEspaciosFiltrados
        ? `Anexo - Padron completo (${snapshot.totalEspaciosFiltrados} espacios)`
        : `Anexo - Padron de espacios (primeros ${showing} de ${snapshot.totalEspaciosFiltrados})`;
    pdf.writeSectionTitle(anexoTitulo);
    pdf.addDataTable(
      ["Nombre", "Alcaldia", "Estado", "Completitud (%)", "Contacto"],
      snapshot.espaciosPadronExportRows.slice(0, maxAnexo).map((row) => {
        const contacto = [row.direccion, row.telefono].filter(Boolean).join(" | ");
        return [row.nombre, row.alcaldia, row.estado, row.completitudPorcentaje, contacto || "-"];
      }),
      {
        fontSize: 7,
        columnStyles: {
          0: { cellWidth: 48 },
          4: { cellWidth: 42 },
        },
      },
    );
  } else if (options.anexoExternoNote) {
    pdf.writeSectionTitle("Anexo de datos");
    pdf.writeParagraph(options.anexoExternoNote);
  }

  if (options.cuestionario) {
    pdf.writeSectionTitle("Cuestionario SECTEI (captura movil)");
    pdf.addKeyValueTable([
      ["Periodo", options.cuestionario.periodo],
      [
        "Detalle institucional",
        `${options.cuestionario.detalleInstitucional.length} espacio(s) - ver hoja Excel Cuestionario`,
      ],
    ]);
    if (options.cuestionario.resumenAlcaldia.length > 0) {
      pdf.addDataTable(
        ["Alcaldia", "Respuestas", "Usuarios inscritos"],
        options.cuestionario.resumenAlcaldia.slice(0, 16).map((r) => [
          r.alcaldiaNombre,
          r.respuestasCapturadas,
          r.totalUsuariosInscritos,
        ]),
      );
    }
  }

  pdf.writeFooter();
  return pdf.toBytes();
}

async function buildXlsxBytes(
  snapshot: DashboardExportSnapshot,
  cuestionario?: CuestionarioExportInput | null,
): Promise<Uint8Array> {
  const XLSX = await import("xlsx");
  const reportTitle = snapshot.filterSummary;

  const resumen = [
    ["Informe GeoArteCDMX"],
    ["Filtros", snapshot.filterSummary],
    ...(snapshot.filterNotice ? [["Aviso", snapshot.filterNotice]] : []),
    ["Territorio", snapshot.territorio],
    ["Disciplina", snapshot.disciplina],
    ["Periodo", snapshot.periodo],
    ["NSE", snapshot.nse],
    ["Género", snapshot.genero],
    ["Edad", snapshot.edad],
    ["Año corte", snapshot.anio],
    ["Espacios filtrados", snapshot.totalEspaciosFiltrados],
  ];

  const kpisSheet = [
    ["Indicador", "Valor", "Detalle"],
    ...snapshot.kpis.map((k) => [k.label, k.value, k.delta]),
  ];

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

  const espaciosSheet = buildPadronEspaciosSheetAoa(snapshot.espaciosPadronExportRows);

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
    reportTitle.slice(0, 31),
  );
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(espaciosSheet), "Espacios");

  if (cuestionario) {
    const sheets = await buildCuestionarioReportSheets(cuestionario);
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.aoa_to_sheet(sheets.resumenAoa),
      "Cuestionario_resumen",
    );
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.aoa_to_sheet(sheets.detalleAoa),
      "Cuestionario",
    );
  }

  const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  return new Uint8Array(buffer as ArrayBuffer);
}

export async function buildReportFile(input: ReportFileBuildInput & { format: ReporteFormato }): Promise<{
  bytes: Uint8Array;
  fileName: string;
  mimeType: string;
  sizeKb: number;
}> {
  const snapshot = buildDashboardExportSnapshot(input);
  const reportTitle = `${input.plantillaTitulo} — GeoArteCDMX`;
  const stem = slugifyReportName(
    `${input.plantillaTitulo}-${exportFilenameStem(snapshot).replace(/^geoarte-dashboard-/, "")}`,
  );
  const stamp = Date.now();

  switch (input.format) {
    case "PDF": {
      const bytes = await buildDashboardPdfBytes(snapshot, reportTitle, {
        cuestionario: input.cuestionario,
      });
      return {
        bytes,
        fileName: `${stem}-${stamp}.pdf`,
        mimeType: "application/pdf",
        sizeKb: Math.max(1, Math.round(bytes.byteLength / 1024)),
      };
    }
    case "CSV": {
      const csv = buildFullCsv(snapshot, reportTitle);
      const encoder = new TextEncoder();
      const bytes = encoder.encode(csv);
      return {
        bytes,
        fileName: `${stem}-${stamp}.csv`,
        mimeType: "text/csv;charset=utf-8",
        sizeKb: Math.max(1, Math.round(bytes.byteLength / 1024)),
      };
    }
    case "XLSX": {
      const bytes = await buildXlsxBytes(snapshot, input.cuestionario);
      return {
        bytes,
        fileName: `${stem}-${stamp}.xlsx`,
        mimeType:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        sizeKb: Math.max(1, Math.round(bytes.byteLength / 1024)),
      };
    }
    default: {
      const _exhaustive: never = input.format;
      return _exhaustive;
    }
  }
}
