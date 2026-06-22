import { NextResponse } from "next/server";
import { periodoSemestralActual } from "@/lib/cuestionario/cuestionario-periodo";
import { fetchAdminCuestionarioServer } from "@/lib/data/supabase/admin-cuestionario-server";
import {
  isAutoridadError,
  requireAutoridadSession,
} from "@/lib/admin/require-autoridad";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await requireAutoridadSession();
  if (isAutoridadError(auth)) return auth.error;

  try {
    const { searchParams } = new URL(request.url);
    const periodo = searchParams.get("periodo")?.trim() || periodoSemestralActual();
    const rows = await fetchAdminCuestionarioServer(periodo);
    return NextResponse.json({ periodo, rows });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error al cargar cuestionarios";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
