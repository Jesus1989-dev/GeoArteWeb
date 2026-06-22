import { NextResponse } from "next/server";
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

    return NextResponse.json(recurso);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error al cargar recurso";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
