import { NextResponse } from "next/server";
import {
  getReportesCentroConfigAdmin,
  updateReportesCentroConfigAdmin,
} from "@/lib/data/supabase/admin-reportes-server";
import type { AdminReportesCentroConfigFormInput } from "@/lib/domain/admin";
import {
  isAutoridadError,
  requireAutoridadSession,
} from "@/lib/admin/require-autoridad";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAutoridadSession();
  if (isAutoridadError(auth)) return auth.error;

  try {
    const config = await getReportesCentroConfigAdmin(auth.admin);
    return NextResponse.json({ config });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error al cargar configuración de reportes";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const auth = await requireAutoridadSession();
  if (isAutoridadError(auth)) return auth.error;

  const body = (await request.json()) as AdminReportesCentroConfigFormInput;
  const result = await updateReportesCentroConfigAdmin(auth.admin, body);

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ config: result.config });
}
