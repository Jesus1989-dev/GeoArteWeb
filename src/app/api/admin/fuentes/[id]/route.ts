import { NextResponse } from "next/server";
import {
  deleteFuenteAdmin,
  updateFuenteAdmin,
} from "@/lib/data/supabase/admin-fuentes-server";
import type { AdminFuenteFormInput } from "@/lib/domain/admin";
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
  const body = (await request.json()) as AdminFuenteFormInput;
  const result = await updateFuenteAdmin(auth.admin, id, body);

  if (result.error) {
    const status = result.error === "Fuente no encontrada" ? 404 : 400;
    return NextResponse.json({ error: result.error }, { status });
  }

  return NextResponse.json({ fuente: result.row });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await requireAutoridadSession();
  if (isAutoridadError(auth)) return auth.error;

  const { id } = await context.params;
  const result = await deleteFuenteAdmin(auth.admin, id);

  if (!result.ok) {
    const status = result.error === "Fuente no encontrada" ? 404 : 400;
    return NextResponse.json({ error: result.error }, { status });
  }

  return NextResponse.json({ ok: true });
}
