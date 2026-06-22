import type { CuestionarioResumenAlcaldia } from "@/lib/domain/cuestionario";
import type { CuestionarioInstitutionalRow } from "@/lib/cuestionario/cuestionario-institutional";
import {
  ENCABEZADOS_CUESTIONARIO_INSTITUCIONAL,
  filaInstitucionalToArray,
} from "@/lib/cuestionario/cuestionario-institutional";
import { etiquetaPeriodoSemestral } from "@/lib/cuestionario/cuestionario-periodo";
import { createGeoArtePdfWriter } from "@/lib/pdf/geoarte-pdf";

export type CuestionarioExportInput = {
  periodo: string;
  resumenAlcaldia: CuestionarioResumenAlcaldia[];
  detalleInstitucional: CuestionarioInstitutionalRow[];
};

async function buildCuestionarioPdfBytes(input: CuestionarioExportInput): Promise<Uint8Array> {
  const pdf = await createGeoArtePdfWriter({ orientation: "landscape" });
  const periodoLabel = etiquetaPeriodoSemestral(input.periodo);

  pdf.writeDocumentTitle("Cuestionario SECTEI - GeoArte CDMX");
  pdf.addKeyValueTable([
    ["Periodo", input.periodo],
    ["Etiqueta", periodoLabel],
    ["Espacios en detalle", input.detalleInstitucional.length],
  ]);

  if (input.resumenAlcaldia.length > 0) {
    pdf.writeSectionTitle("Resumen por alcaldia");
    pdf.addDataTable(
      [
        "Alcaldia",
        "Respuestas",
        "Espacios",
        "Usuarios",
        "Aforo",
        "Empleo",
        "Convenios",
        "% mujeres prom.",
      ],
      input.resumenAlcaldia.map((r) => [
        r.alcaldiaNombre,
        r.respuestasCapturadas,
        r.espaciosConRespuesta,
        r.totalUsuariosInscritos,
        r.aforoInstaladoTotal,
        r.empleoRemuneradoTotal,
        r.conveniosReportados,
        r.pctMujeresPromedio ?? "-",
      ]),
      { fontSize: 7 },
    );
  }

  if (input.detalleInstitucional.length > 0) {
    pdf.writeSectionTitle("Detalle institucional por espacio");
    pdf.addDataTable(
      [...ENCABEZADOS_CUESTIONARIO_INSTITUCIONAL],
      input.detalleInstitucional.map((row) => filaInstitucionalToArray(row)),
      { fontSize: 6 },
    );
  }

  pdf.writeFooter();
  return pdf.toBytes();
}

async function buildCuestionarioXlsxBytes(input: CuestionarioExportInput): Promise<Uint8Array> {
  const XLSX = await import("xlsx");
  const periodoLabel = etiquetaPeriodoSemestral(input.periodo);

  const resumenSheet = [
    ["Cuestionario SECTEI — GeoArteCDMX"],
    ["Periodo", input.periodo],
    ["Periodo (etiqueta)", periodoLabel],
    [],
    ["Resumen por alcaldía"],
    [
      "Alcaldía",
      "Respuestas",
      "Espacios",
      "Usuarios",
      "Aforo",
      "Empleo",
      "Convenios",
      "% mujeres prom.",
    ],
    ...input.resumenAlcaldia.map((r) => [
      r.alcaldiaNombre,
      r.respuestasCapturadas,
      r.espaciosConRespuesta,
      r.totalUsuariosInscritos,
      r.aforoInstaladoTotal,
      r.empleoRemuneradoTotal,
      r.conveniosReportados,
      r.pctMujeresPromedio ?? "",
    ]),
  ];

  const detalleSheet = [
    [...ENCABEZADOS_CUESTIONARIO_INSTITUCIONAL],
    ...input.detalleInstitucional.map((r) => filaInstitucionalToArray(r)),
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(resumenSheet), "Resumen");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(detalleSheet), "Cuestionario");

  const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  return new Uint8Array(buffer as ArrayBuffer);
}

export async function buildCuestionarioExportFile(
  input: CuestionarioExportInput,
  format: "PDF" | "XLSX",
): Promise<{ bytes: Uint8Array; fileName: string; mimeType: string }> {
  const stamp = Date.now();
  const stem = `Cuestionario_GeoArteCDMX_${input.periodo}`;

  if (format === "PDF") {
    const bytes = await buildCuestionarioPdfBytes(input);
    return {
      bytes,
      fileName: `${stem}_${stamp}.pdf`,
      mimeType: "application/pdf",
    };
  }

  const bytes = await buildCuestionarioXlsxBytes(input);
  return {
    bytes,
    fileName: `${stem}_${stamp}.xlsx`,
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  };
}

export function downloadCuestionarioBytes(
  bytes: Uint8Array,
  fileName: string,
  mimeType: string,
) {
  const blob = new Blob([bytes as BlobPart], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

export async function exportCuestionarioFile(
  input: CuestionarioExportInput,
  format: "PDF" | "XLSX",
): Promise<void> {
  const file = await buildCuestionarioExportFile(input, format);
  downloadCuestionarioBytes(file.bytes, file.fileName, file.mimeType);
}

export async function buildCuestionarioReportSheets(input: CuestionarioExportInput): Promise<{
  resumenAoa: (string | number)[][];
  detalleAoa: string[][];
}> {
  const periodoLabel = etiquetaPeriodoSemestral(input.periodo);
  const resumenAoa: (string | number)[][] = [
    ["Cuestionario SECTEI (captura móvil)"],
    ["Periodo", input.periodo],
    ["Etiqueta", periodoLabel],
    [],
    ["Alcaldía", "Respuestas", "Espacios", "Usuarios", "Empleo"],
    ...input.resumenAlcaldia.map((r) => [
      r.alcaldiaNombre,
      r.respuestasCapturadas,
      r.espaciosConRespuesta,
      r.totalUsuariosInscritos,
      r.empleoRemuneradoTotal,
    ]),
  ];

  const detalleAoa = [
    [...ENCABEZADOS_CUESTIONARIO_INSTITUCIONAL],
    ...input.detalleInstitucional.map((r) => filaInstitucionalToArray(r)),
  ];

  return { resumenAoa, detalleAoa };
}
