import { NextResponse } from "next/server";
import { getCuestionarioDataServer } from "@/lib/services/cuestionario.service.server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const periodo = searchParams.get("periodo") ?? undefined;
    const alcaldia = searchParams.get("alcaldia") ?? undefined;

    const data = await getCuestionarioDataServer({ periodo, alcaldia });
    return NextResponse.json(data);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error al cargar el cuestionario";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
