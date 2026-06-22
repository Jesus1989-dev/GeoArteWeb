import { NextResponse } from "next/server";
import {
  deleteCapaAdmin,
  updateCapaAdmin,
} from "@/lib/data/supabase/admin-capas-server";
import type { AdminCapaFormInput } from "@/lib/domain/admin";
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
  const body = (await request.json()) as AdminCapaFormInput;
  const result = await updateCapaAdmin(auth.admin, id, body);

  if (result.error) {
    const status = result.error === "Capa no encontrada" ? 404 : 400;
    return NextResponse.json({ error: result.error }, { status });
  }

  return NextResponse.json({ capa: result.row });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await requireAutoridadSession();
  if (isAutoridadError(auth)) return auth.error;

  const { id } = await context.params;
  const result = await deleteCapaAdmin(auth.admin, id);

  if (!result.ok) {
    const status =
      result.error === "Capa no encontrada"
        ? 404
        : result.error?.includes("No se puede eliminar")
          ? 409
          : 400;
    return NextResponse.json({ error: result.error }, { status });
  }

  return NextResponse.json({ ok: true });
}
