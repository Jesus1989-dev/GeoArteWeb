import { NextResponse } from "next/server";
import { getInvestigacionPageData } from "@/lib/services/investigacion.service";
import { parseInvestigacionListQuery } from "@/lib/investigacion/investigacion-query";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const query = parseInvestigacionListQuery(new URL(request.url).searchParams);
    const data = await getInvestigacionPageData(query);
    return NextResponse.json(data);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error al cargar investigación";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
