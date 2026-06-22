import type { SupabaseClient } from "@supabase/supabase-js";
import { fetchEspaciosGeoJsonV1 } from "@/lib/api-v1/espacios-geojson";
import { buildTransporteGeoJsonV1 } from "@/lib/api-v1/transporte-geojson";
import type { DashboardFilterState } from "@/lib/dashboard/apply-dashboard-filters";
import { applyDashboardFilters } from "@/lib/dashboard/apply-dashboard-filters";
import { buildDashboardExportSnapshot } from "@/lib/dashboard/build-export-snapshot";
import { buildDashboardXlsxBytes } from "@/lib/dashboard/build-dashboard-xlsx";
import type { ContactoDatasetFile, ContactoDatasetId } from "@/lib/domain/datasets";
import { fetchDashboardWithClient } from "@/lib/data/supabase/dashboard.repository";
import { isSupabaseConfigured } from "@/lib/data/supabase/config";
import { getAnioCorteMetricas } from "@/lib/data/supabase/config";
import { buildFilteredDashboardForReport } from "@/lib/reportes/filter-dashboard-for-report";
import { buildReporteAnualXlsxBytes } from "@/lib/dashboard/build-dashboard-xlsx";
import { buildDashboardPdfBytes } from "@/lib/reportes/build-report-file";
import { getDashboardDataMock } from "@/lib/services/dashboard.service";

type MetricaRow = {
  alcaldia_nombre: string | null;
  cantidad_espacios: number | null;
  porcentaje_cobertura: number | null;
  porcentaje_brecha: number | null;
};

async function fetchMetricasRows(
  client: SupabaseClient | null,
): Promise<{ rows: MetricaRow[]; dataSource: "supabase" | "mock" }> {
  if (client && isSupabaseConfigured()) {
    const { data, error } = await client
      .from("metricas_alcaldia")
      .select("alcaldia_nombre, cantidad_espacios, porcentaje_cobertura, porcentaje_brecha")
      .order("alcaldia_nombre", { ascending: true });

    if (!error && data && data.length > 0) {
      return { rows: data as MetricaRow[], dataSource: "supabase" };
    }
  }

  return {
    rows: [
      {
        alcaldia_nombre: "Cuauhtémoc",
        cantidad_espacios: 120,
        porcentaje_cobertura: 78,
        porcentaje_brecha: 22,
      },
      {
        alcaldia_nombre: "Coyoacán",
        cantidad_espacios: 95,
        porcentaje_cobertura: 72,
        porcentaje_brecha: 28,
      },
    ],
    dataSource: "mock",
  };
}

async function buildEspaciosGeoJsonFile(
  client: SupabaseClient | null,
): Promise<ContactoDatasetFile> {
  const geojson = await fetchEspaciosGeoJsonV1(client);
  const json = JSON.stringify(geojson, null, 2);
  return {
    body: json,
    contentType: "application/geo+json",
    filename: "geoarte-capa-espacios.geojson",
  };
}

async function buildIndicadoresSnapshot(client: SupabaseClient | null) {
  const anio = new Date().getFullYear();
  const defaultFilters: DashboardFilterState = {
    alcaldia: "Todas",
    disciplina: "Todas",
    periodo: `${anio - 1}-${anio}`,
    nse: "Todos",
    edad: "Todos",
    genero: "Todos",
  };

  if (client && isSupabaseConfigured()) {
    try {
      const payload = await fetchDashboardWithClient(client);
      const filtered = applyDashboardFilters(
        payload.raw,
        defaultFilters,
        payload.raw.densidadCiudad,
      );
      return {
        snapshot: buildDashboardExportSnapshot({
          filters: defaultFilters,
          filtered,
          anioCorte: payload.anioCorte,
          conteoPorAlcaldia: payload.raw.conteoPorAlcaldia,
        }),
        metricasPorAlcaldia: payload.metricasPorAlcaldia,
      };
    } catch (err) {
      console.warn("[datasets] indicadores Supabase:", err);
    }
  }

  const dashboard = getDashboardDataMock();
  const filtered = buildFilteredDashboardForReport(dashboard, defaultFilters);
  return {
    snapshot: buildDashboardExportSnapshot({
      filters: defaultFilters,
      filtered,
      anioCorte: dashboard.anioCorte,
    }),
    metricasPorAlcaldia: dashboard.metricasPorAlcaldia,
  };
}

async function buildIndicadoresXlsxFile(
  client: SupabaseClient | null,
): Promise<ContactoDatasetFile> {
  const { snapshot, metricasPorAlcaldia } = await buildIndicadoresSnapshot(client);
  const bytes = await buildDashboardXlsxBytes(snapshot, {
    titulo: "Matriz de Indicadores — GeoArte CDMX",
    metricasPorAlcaldia,
  });

  return {
    body: bytes,
    contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    filename: "geoarte-matriz-indicadores.xlsx",
  };
}

async function buildReporteAnualZipFile(
  client: SupabaseClient | null,
): Promise<ContactoDatasetFile> {
  const anio = getAnioCorteMetricas();
  const { snapshot, metricasPorAlcaldia } = await buildIndicadoresSnapshot(client);
  const totalEspacios = snapshot.espaciosPadronExportRows.length;
  const reportTitle = `Reporte Anual de Infraestructura Cultural ${anio} — GeoArte CDMX`;

  const [pdfBytes, xlsxBytes] = await Promise.all([
    buildDashboardPdfBytes(snapshot, reportTitle, {
      metricasPorAlcaldia,
      maxEspaciosAnexo: 0,
      anexoExternoNote: `El padrón completo de ${totalEspacios} espacios y las hojas de indicadores se incluyen en el archivo Excel de este paquete ZIP.`,
    }),
    buildReporteAnualXlsxBytes(snapshot, {
      titulo: `Indicadores — Reporte Anual ${anio} — GeoArte CDMX`,
      metricasPorAlcaldia,
    }),
  ]);

  if (pdfBytes.byteLength === 0) {
    throw new Error("No se pudo generar el PDF del reporte anual");
  }

  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();
  zip.file(`geoarte-reporte-anual-${anio}.pdf`, pdfBytes);
  zip.file(`geoarte-reporte-anual-${anio}-anexo-espacios.xlsx`, xlsxBytes);
  const zipBytes = await zip.generateAsync({ type: "uint8array" });

  return {
    body: zipBytes,
    contentType: "application/zip",
    filename: `geoarte-reporte-anual-${anio}.zip`,
  };
}

async function buildApiBackupJsonFile(
  client: SupabaseClient | null,
): Promise<ContactoDatasetFile> {
  const [espacios, metricas, capaTransporteReferencia] = await Promise.all([
    fetchEspaciosGeoJsonV1(client),
    fetchMetricasRows(client),
    buildTransporteGeoJsonV1(),
  ]);

  const payload = {
    titulo: "GeoArte CDMX — API Full Backup",
    exportedAt: new Date().toISOString(),
    version: "1.0",
    dataSource: metricas.dataSource,
    espacios,
    metricasAlcaldia: metricas.rows.map((row) => ({
      alcaldia: row.alcaldia_nombre,
      cantidadEspacios: Number(row.cantidad_espacios) || 0,
      porcentajeCobertura: Number(row.porcentaje_cobertura) || 0,
      porcentajeBrecha: Number(row.porcentaje_brecha) || 0,
    })),
    capaTransporteReferencia,
    api: {
      basePath: "/api/v1",
      endpoints: [
        "/api/v1/espacios/geojson",
        "/api/v1/alcaldias/{id}/stats",
        "/api/v1/layers/transporte",
        "/api/v1/search?query={q}",
      ],
    },
  };

  return {
    body: JSON.stringify(payload, null, 2),
    contentType: "application/json",
    filename: "geoarte-api-full-backup.json",
  };
}

export async function buildContactoDatasetFile(
  client: SupabaseClient | null,
  id: ContactoDatasetId,
): Promise<ContactoDatasetFile> {
  switch (id) {
    case "espacios":
      return buildEspaciosGeoJsonFile(client);
    case "indicadores":
      return buildIndicadoresXlsxFile(client);
    case "reporte":
      return buildReporteAnualZipFile(client);
    case "api-backup":
      return buildApiBackupJsonFile(client);
    default:
      throw new Error("Dataset no soportado");
  }
}
