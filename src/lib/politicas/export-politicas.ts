import type {
  AccionEstrategica,
  BrechaInversionAlcaldiaRow,
  EvidenciaDiagnosticoContenido,
  PoliticasHeroStat,
  SeccionRecomendaciones,
} from "@/lib/domain/politicas";
import {
  formatImpactoCiudadanos,
  formatPresupuestoMxnDetalle,
} from "@/lib/politicas/format-politicas-metricas";
import { createGeoArtePdfWriter } from "@/lib/pdf/geoarte-pdf";
import { downloadBlob } from "@/lib/utils/download-file";

export type PoliticasInformeInput = {
  anioCorte: number;
  dataSourceNote: string;
  stats: PoliticasHeroStat[];
  evidencia: EvidenciaDiagnosticoContenido;
  brechaChart: BrechaInversionAlcaldiaRow[];
  secciones: SeccionRecomendaciones[];
};

export async function buildPoliticasInformePdfBytes(
  input: PoliticasInformeInput,
): Promise<Uint8Array> {
  const pdf = await createGeoArtePdfWriter();

  pdf.writeDocumentTitle("Informe Global - Recomendaciones de Politica Publica");
  pdf.writeMetaLine(input.dataSourceNote);
  pdf.writeMetaLine(`Ano de corte: ${input.anioCorte}`);
  pdf.addGap(2);

  pdf.writeSectionTitle("Indicadores estrategicos");
  pdf.addDataTable(
    ["Indicador", "Valor", "Detalle"],
    input.stats.map((stat) => [stat.label, stat.value, stat.sublabel]),
  );

  pdf.writeSectionTitle(input.evidencia.titulo);
  pdf.addKeyValueTable([
    ["Diagnostico", input.evidencia.parrafo],
    ["Meta", input.evidencia.meta2025],
    ["Urgencia", input.evidencia.urgencia],
  ]);

  pdf.writeSectionTitle("Brecha de infraestructura vs. cobertura");
  pdf.addDataTable(
    ["Alcaldia", "Deficit (%)", "Cobertura presupuestal (%)"],
    input.brechaChart.map((row) => [row.alcaldia, row.deficit, row.presupuesto]),
  );

  for (const seccion of input.secciones) {
    pdf.writeSectionTitle(seccion.titulo);
    pdf.addDataTable(
      ["Accion", "Prioridad", "Alcaldia", "Impacto", "Ciudadanos", "Presupuesto"],
      seccion.acciones.map((accion) => [
        accion.titulo,
        accion.prioridad,
        accion.alcaldia,
        accion.impacto,
        accion.impactoCiudadanos != null
          ? formatImpactoCiudadanos(accion.impactoCiudadanos)
          : "-",
        accion.presupuestoMxn != null
          ? formatPresupuestoMxnDetalle(accion.presupuestoMxn)
          : "-",
      ]),
      {
        fontSize: 7,
        columnStyles: {
          0: { cellWidth: 42 },
          3: { cellWidth: 38 },
        },
      },
    );

    if (seccion.acciones.some((accion) => accion.descripcion.trim() !== "")) {
      pdf.writeSectionTitle(`Descripcion de acciones - ${seccion.titulo}`);
      pdf.addDataTable(
        ["Accion", "Descripcion"],
        seccion.acciones.map((accion) => [accion.titulo, accion.descripcion]),
        {
          fontSize: 7,
          columnStyles: {
            0: { cellWidth: 42 },
            1: { cellWidth: "auto" },
          },
        },
      );
    }
  }

  pdf.writeFooter();
  return pdf.toBytes();
}

export async function buildPoliticasBriefPdfBytes(
  accion: AccionEstrategica,
  seccionTitulo: string,
  anioCorte: number,
): Promise<Uint8Array> {
  const pdf = await createGeoArtePdfWriter();

  pdf.writeDocumentTitle(`Brief de Accion - ${accion.titulo}`);
  pdf.addKeyValueTable([
    ["Objetivo", seccionTitulo],
    ["Alcaldia focal", accion.alcaldia],
    ["Prioridad", accion.prioridad],
    ["Costo simbolico", `Nivel ${accion.costoNivel}`],
    [
      "Ciudadanos beneficiados",
      accion.impactoCiudadanos != null
        ? formatImpactoCiudadanos(accion.impactoCiudadanos)
        : "No registrado",
    ],
    [
      "Presupuesto registrado",
      accion.presupuestoMxn != null
        ? formatPresupuestoMxnDetalle(accion.presupuestoMxn)
        : "No registrado",
    ],
    ["Corte metricas", anioCorte],
  ]);

  pdf.writeSectionTitle("Descripcion");
  pdf.addDataTable(["Resumen"], [[accion.descripcion]], {
    columnStyles: { 0: { cellWidth: "auto" } },
  });

  pdf.writeSectionTitle("Impacto estimado");
  pdf.addDataTable(["Impacto"], [[accion.impacto]], {
    columnStyles: { 0: { cellWidth: "auto" } },
  });

  pdf.writeFooter();
  return pdf.toBytes();
}

export async function downloadPoliticasInforme(input: PoliticasInformeInput): Promise<void> {
  const bytes = await buildPoliticasInformePdfBytes(input);
  const blob = new Blob([Buffer.from(bytes)], { type: "application/pdf" });
  const stem = `geoarte-politicas-informe-${input.anioCorte}`;
  downloadBlob(blob, `${stem}.pdf`);
}

export async function downloadPoliticasBrief(
  accion: AccionEstrategica,
  seccionTitulo: string,
  anioCorte: number,
): Promise<void> {
  const bytes = await buildPoliticasBriefPdfBytes(accion, seccionTitulo, anioCorte);
  const blob = new Blob([Buffer.from(bytes)], { type: "application/pdf" });
  const safeId = accion.id.replace(/[^a-z0-9-]/gi, "-");
  downloadBlob(blob, `geoarte-brief-${safeId}.pdf`);
}

export function findSeccionTituloForAccion(
  secciones: SeccionRecomendaciones[],
  accionId: string,
): string {
  for (const seccion of secciones) {
    if (seccion.acciones.some((a) => a.id === accionId)) {
      return seccion.titulo;
    }
  }
  return "Politica publica";
}
