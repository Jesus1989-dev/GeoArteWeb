import { NextResponse } from "next/server";
import { buildRecursoInformePdfBytes } from "@/lib/investigacion/export-investigacion";
import { getRecursoCualitativoById } from "@/lib/services/investigacion.service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get("id")?.trim();
  if (!id) {
    return NextResponse.json({ error: "Parámetro id requerido" }, { status: 400 });
  }

  try {
    const recurso = await getRecursoCualitativoById(id);
    if (!recurso) {
      return NextResponse.json({ error: "Recurso no encontrado" }, { status: 404 });
    }

    const bytes = await buildRecursoInformePdfBytes(recurso);

    return new NextResponse(Buffer.from(bytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="geoarte-recurso-${id}.pdf"`,
      },
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error al generar informe";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
