import { NextResponse } from "next/server";
import {
  createReportePlantillaAdmin,
  listReportePlantillasAdmin,
} from "@/lib/data/supabase/admin-reportes-server";
import type { AdminReportePlantillaFormInput } from "@/lib/domain/admin";
import {
  isAutoridadError,
  requireAutoridadSession,
} from "@/lib/admin/require-autoridad";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAutoridadSession();
  if (isAutoridadError(auth)) return auth.error;

  try {
    const plantillas = await listReportePlantillasAdmin(auth.admin);
    return NextResponse.json({ plantillas });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error al listar plantillas de reporte";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await requireAutoridadSession();
  if (isAutoridadError(auth)) return auth.error;

  const body = (await request.json()) as AdminReportePlantillaFormInput;
  const result = await createReportePlantillaAdmin(auth.admin, body);

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ plantilla: result.row }, { status: 201 });
}
