import { NextResponse } from "next/server";
import { parseAnioFromPeriodo } from "@/lib/dashboard/apply-dashboard-filters";
import { getDashboardDataServer } from "@/lib/services/dashboard.service.server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawAnio = searchParams.get("anioCorte");
    const periodo = searchParams.get("periodo");

    let anioCorte: number | undefined;
    if (rawAnio) {
      const parsed = Number.parseInt(rawAnio, 10);
      if (Number.isFinite(parsed)) anioCorte = parsed;
    } else if (periodo) {
      const fromPeriodo = parseAnioFromPeriodo(periodo);
      if (fromPeriodo != null) anioCorte = fromPeriodo;
    }

    const rawInclude = searchParams.get("includeEspacios");
    const includeEspacios =
      rawInclude == null ? undefined : rawInclude !== "false" && rawInclude !== "0";

    const data = await getDashboardDataServer({ anioCorte, includeEspacios });
    return NextResponse.json(data);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error al cargar el dashboard";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
