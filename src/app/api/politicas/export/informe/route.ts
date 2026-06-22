import { NextResponse } from "next/server";
import { getPoliticasPageData } from "@/lib/services/politicas.service";
import { buildPoliticasInformePdfBytes } from "@/lib/politicas/export-politicas";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getPoliticasPageData();
    const bytes = await buildPoliticasInformePdfBytes({
      anioCorte: data.anioCorte,
      dataSourceNote: data.dataSourceNote,
      stats: data.politicasHeroStats,
      evidencia: data.evidenciaDiagnosticoContenido,
      brechaChart: data.brechaInversionAlcaldias,
      secciones: data.recomendacionesPorObjetivo,
    });

    const filename = `geoarte-politicas-informe-${data.anioCorte}.pdf`;
    return new NextResponse(Buffer.from(bytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error al generar informe";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
