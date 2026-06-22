import { NextResponse } from "next/server";
import { getPoliticasPageData } from "@/lib/services/politicas.service";
import {
  buildPoliticasBriefPdfBytes,
  findSeccionTituloForAccion,
} from "@/lib/politicas/export-politicas";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get("id")?.trim();
  if (!id) {
    return NextResponse.json({ error: "Parámetro id requerido" }, { status: 400 });
  }

  try {
    const data = await getPoliticasPageData();
    let accion = null;
    for (const seccion of data.recomendacionesPorObjetivo) {
      const found = seccion.acciones.find((a) => a.id === id);
      if (found) {
        accion = found;
        break;
      }
    }

    if (!accion) {
      return NextResponse.json({ error: "Acción no encontrada" }, { status: 404 });
    }

    const seccionTitulo = findSeccionTituloForAccion(
      data.recomendacionesPorObjetivo,
      id,
    );
    const bytes = await buildPoliticasBriefPdfBytes(
      accion,
      seccionTitulo,
      data.anioCorte,
    );

    return new NextResponse(Buffer.from(bytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="geoarte-brief-${id}.pdf"`,
      },
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error al generar brief";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
