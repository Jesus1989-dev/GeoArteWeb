import { NextResponse } from "next/server";
import {
  setRecursoCualitativoActivoAdmin,
  updateRecursoCualitativoAdmin,
} from "@/lib/data/supabase/admin-recursos-cualitativos-server";
import type { AdminRecursoCualitativoFormInput } from "@/lib/domain/admin";
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
  const body = (await request.json()) as AdminRecursoCualitativoFormInput & {
    activo?: boolean;
  };

  if (typeof body.activo === "boolean" && Object.keys(body).length === 1) {
    const toggle = await setRecursoCualitativoActivoAdmin(
      auth.admin,
      id,
      body.activo,
    );
    if (!toggle.ok) {
      const status = toggle.error === "Recurso no encontrado" ? 404 : 400;
      return NextResponse.json({ error: toggle.error }, { status });
    }
    return NextResponse.json({ ok: true, activo: body.activo });
  }

  const result = await updateRecursoCualitativoAdmin(auth.admin, id, body);

  if (result.error) {
    const status = result.error === "Recurso no encontrado" ? 404 : 400;
    return NextResponse.json({ error: result.error }, { status });
  }

  return NextResponse.json({ recurso: result.row });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await requireAutoridadSession();
  if (isAutoridadError(auth)) return auth.error;

  const { id } = await context.params;
  const result = await setRecursoCualitativoActivoAdmin(auth.admin, id, false);

  if (!result.ok) {
    const status = result.error === "Recurso no encontrado" ? 404 : 400;
    return NextResponse.json({ error: result.error }, { status });
  }

  return NextResponse.json({ ok: true });
}
