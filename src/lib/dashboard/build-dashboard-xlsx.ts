import type { MetricaAlcaldiaResumen } from "@/lib/domain/dashboard";
import type { DashboardExportSnapshot } from "@/lib/dashboard/build-export-snapshot";
import { buildPadronEspaciosSheetAoa } from "@/lib/dashboard/padron-export";

export type BuildDashboardXlsxOptions = {
  titulo?: string;
  metricasPorAlcaldia?: Record<string, MetricaAlcaldiaResumen>;
};

export type DashboardXlsxSheetDef = {
  name: string;
  aoa: (string | number)[][];
};

function sanitizeSheetName(name: string): string {
  return name.slice(0, 31);
}

/** Hojas estadísticas del dashboard (sin padrón detallado). */
export function buildDashboardIndicatorSheetDefs(
  snapshot: DashboardExportSnapshot,
  options: BuildDashboardXlsxOptions = {},
): DashboardXlsxSheetDef[] {
  const titulo = options.titulo ?? "Matriz de Indicadores — GeoArte CDMX";

  const resumen = [
    [titulo],
    ["Generado", new Date().toISOString()],
    ["Filtros", snapshot.filterSummary],
    ...(snapshot.filterNotice ? [["Aviso", snapshot.filterNotice]] : []),
    ["Territorio", snapshot.territorio],
    ["Disciplina", snapshot.disciplina],
    ["Periodo", snapshot.periodo],
    ["NSE", snapshot.nse],
    ["Género", snapshot.genero],
    ["Edad", snapshot.edad],
    ["Año corte", snapshot.anio],
    ["Espacios en padrón", snapshot.totalEspaciosFiltrados],
  ];

  const kpisSheet = [
    ["Indicador", "Valor", "Detalle"],
    ...snapshot.kpis.map((k) => [k.label, k.value, k.delta]),
  ];

  const metricas = options.metricasPorAlcaldia ?? {};
  const indicadoresSheet = [
    ["Alcaldía", "Espacios", "Cobertura (%)", "Brecha (%)"],
    ...Object.entries(metricas)
      .sort(([a], [b]) => a.localeCompare(b, "es"))
      .map(([nombre, m]) => [
        nombre,
        m.cantidadEspacios,
        m.porcentajeCobertura,
        m.porcentajeBrecha,
      ]),
  ];

  const conteoAlcaldiasSheet = [
    ["Alcaldía", "Total espacios (padrón)"],
    ...snapshot.espaciosPorAlcaldiaNombres.map((nombre, i) => [
      nombre,
      snapshot.espaciosPorAlcaldiaTotales[i] ?? 0,
    ]),
  ];

  const participacionSheet = [
    ["Género", "Porcentaje (%)"],
    ...snapshot.participacionEtiquetas.map((etiqueta, i) => [
      etiqueta,
      Number(snapshot.participacionValores[i]?.toFixed(1) ?? 0),
    ]),
  ];

  const tendenciaSheet = [
    ["Periodo", "Valor"],
    ...snapshot.tendenciaMeses.map((mes, i) => [mes, snapshot.tendenciaValores[i]]),
  ];

  const densidadSheet = [
    ["Macrozona", "Densidad (%)"],
    ...snapshot.densidadZonas.map((zona, i) => [zona, snapshot.densidadPorcentajes[i]]),
  ];

  const tipologiaSheet = [
    ["Tipología", "Espacios"],
    ...snapshot.distribucionTipologia.map((row) => [row.name, row.value]),
  ];

  const sheets: DashboardXlsxSheetDef[] = [
    { name: "Resumen", aoa: resumen },
    { name: "KPIs", aoa: kpisSheet },
  ];

  if (indicadoresSheet.length > 1) {
    sheets.push({ name: "Indicadores", aoa: indicadoresSheet });
  }
  if (conteoAlcaldiasSheet.length > 1) {
    sheets.push({ name: "Espacios por alcaldía", aoa: conteoAlcaldiasSheet });
  }

  sheets.push({ name: "Participación", aoa: participacionSheet });
  sheets.push({
    name: sanitizeSheetName(snapshot.tendenciaTitulo),
    aoa: tendenciaSheet,
  });

  if (densidadSheet.length > 1) {
    sheets.push({ name: "Densidad", aoa: densidadSheet });
  }
  if (tipologiaSheet.length > 1) {
    sheets.push({ name: "Tipología", aoa: tipologiaSheet });
  }

  return sheets;
}

async function writeWorkbookSheets(sheets: DashboardXlsxSheetDef[]): Promise<Uint8Array> {
  const XLSX = await import("xlsx");
  const wb = XLSX.utils.book_new();

  for (const sheet of sheets) {
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(sheet.aoa), sheet.name);
  }

  const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  return new Uint8Array(buffer as ArrayBuffer);
}

/** Genera un XLSX completo alineado con el export del dashboard. */
export async function buildDashboardXlsxBytes(
  snapshot: DashboardExportSnapshot,
  options: BuildDashboardXlsxOptions = {},
): Promise<Uint8Array> {
  const espaciosSheet = [
    ["ID", "Nombre", "Alcaldía", "Completitud (%)", "Estado", "Latitud", "Longitud"],
    ...snapshot.espaciosTablaRows.map((row) => [
      row.id,
      row.nombre,
      row.alcaldia,
      row.completitud,
      row.estado,
      row.lat ?? "",
      row.lng ?? "",
    ]),
  ];

  return writeWorkbookSheets([
    ...buildDashboardIndicatorSheetDefs(snapshot, options),
    { name: "Espacios", aoa: espaciosSheet },
  ]);
}

/** Excel del reporte anual: padrón ampliado + hojas de indicadores. */
export async function buildReporteAnualXlsxBytes(
  snapshot: DashboardExportSnapshot,
  options: BuildDashboardXlsxOptions = {},
): Promise<Uint8Array> {
  const titulo =
    options.titulo ?? `Indicadores — Reporte Anual ${snapshot.anio} — GeoArte CDMX`;

  return writeWorkbookSheets([
    {
      name: "Padrón completo",
      aoa: buildPadronEspaciosSheetAoa(snapshot.espaciosPadronExportRows),
    },
    ...buildDashboardIndicatorSheetDefs(snapshot, { ...options, titulo }),
  ]);
}
