import type { RecursoCualitativo } from "@/lib/domain/investigacion";
import { createGeoArtePdfWriter } from "@/lib/pdf/geoarte-pdf";
import { downloadBlob } from "@/lib/utils/download-file";

export async function buildRecursoInformePdfBytes(
  recurso: RecursoCualitativo,
): Promise<Uint8Array> {
  const pdf = await createGeoArtePdfWriter();

  pdf.writeDocumentTitle("Informe cualitativo - GEO ARTE CDMX");
  pdf.writeSectionTitle("Ficha del recurso");
  pdf.addKeyValueTable([
    ["Titulo", recurso.titulo],
    ["Tipo", recurso.tipo],
    ["Alcaldia", recurso.alcaldia],
    ["Fecha", recurso.fechaDetalle],
    ["Investigador/a", recurso.investigador],
    ["Estado", recurso.verificado ? "Verificado" : "En revision"],
  ]);

  pdf.writeSectionTitle("Resumen ejecutivo");
  pdf.addDataTable(["Resumen"], [[recurso.resumen]], {
    columnStyles: { 0: { cellWidth: "auto" } },
  });

  if (recurso.transcripcion.length > 0) {
    pdf.writeSectionTitle("Transcripcion destacada");
    pdf.addDataTable(
      ["Rol", "Texto"],
      recurso.transcripcion.map((bloque) => [bloque.rol, bloque.texto]),
      {
        fontSize: 8,
        columnStyles: {
          0: { cellWidth: 32 },
          1: { cellWidth: "auto" },
        },
      },
    );
  }

  pdf.writeFooter();
  return pdf.toBytes();
}

export async function downloadRecursoInforme(recurso: RecursoCualitativo): Promise<void> {
  const bytes = await buildRecursoInformePdfBytes(recurso);
  downloadBlob(
    new Blob([Buffer.from(bytes)], { type: "application/pdf" }),
    `geoarte-recurso-${recurso.id}.pdf`,
  );
}

export function downloadRecursoJson(recurso: RecursoCualitativo): void {
  const json = JSON.stringify(recurso, null, 2);
  downloadBlob(
    new Blob([json], { type: "application/json" }),
    `geoarte-recurso-${recurso.id}.json`,
  );
}

export function downloadRecursoCsv(recurso: RecursoCualitativo): void {
  const header = ["rol", "texto"];
  const rows = recurso.transcripcion.map((b) =>
    [b.rol, `"${b.texto.replace(/"/g, '""')}"`].join(","),
  );
  const csv = [header.join(","), ...rows].join("\n");
  downloadBlob(
    new Blob([csv], { type: "text/csv;charset=utf-8" }),
    `geoarte-transcripcion-${recurso.id}.csv`,
  );
}

export async function fetchRecursoInformePdf(id: string): Promise<Blob> {
  const response = await fetch(
    `/api/investigacion/export/recurso?id=${encodeURIComponent(id)}`,
    { cache: "no-store" },
  );
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? "No se pudo generar el informe");
  }
  return response.blob();
}

export async function downloadRecursoInformeFromApi(id: string): Promise<void> {
  const blob = await fetchRecursoInformePdf(id);
  downloadBlob(blob, `geoarte-recurso-${id}.pdf`);
}
