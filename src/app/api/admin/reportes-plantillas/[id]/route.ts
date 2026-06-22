import { NextResponse } from "next/server";
import {
  setReportePlantillaActivoAdmin,
  updateReportePlantillaAdmin,
} from "@/lib/data/supabase/admin-reportes-server";
import type { AdminReportePlantillaFormInput } from "@/lib/domain/admin";
import {
  isAutoridadError,
  requireAutoridadSession,
} from "@/lib/admin/require-autoridad";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireAutoridadSession();
  if (isAutoridadError(auth)) return auth.error;

  const { id } = await context.params;
  const body = (await request.json()) as AdminReportePlantillaFormInput & {
    activo?: boolean;
  };

  if (typeof body.activo === "boolean" && Object.keys(body).length === 1) {
    const toggle = await setReportePlantillaActivoAdmin(auth.admin, id, body.activo);
    if (!toggle.ok) {
      const status = toggle.error === "Plantilla no encontrada" ? 404 : 400;
      return NextResponse.json({ error: toggle.error }, { status });
    }
    return NextResponse.json({ ok: true, activo: body.activo });
  }

  const result = await updateReportePlantillaAdmin(auth.admin, id, body);
  if (result.error) {
    const status = result.error === "Plantilla no encontrada" ? 404 : 400;
    return NextResponse.json({ error: result.error }, { status });
  }

  return NextResponse.json({ plantilla: result.row });
}
