import { NextResponse } from "next/server";
import {
  deleteEspacio,
  getEspacioById,
  updateEspacio,
} from "@/lib/data/supabase/admin-espacios-server";
import type { AdminEspacioFormInput } from "@/lib/domain/admin";
import {
  isAutoridadError,
  requireAutoridadSession,
} from "@/lib/admin/require-autoridad";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const auth = await requireAutoridadSession();
  if (isAutoridadError(auth)) return auth.error;

  const { id } = await context.params;
  const espacio = await getEspacioById(auth.admin, id);

  if (!espacio) {
    return NextResponse.json({ error: "Espacio no encontrado" }, { status: 404 });
  }

  return NextResponse.json({ espacio });
}

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireAutoridadSession();
  if (isAutoridadError(auth)) return auth.error;

  const { id } = await context.params;
  const body = (await request.json()) as AdminEspacioFormInput;
  const result = await updateEspacio(auth.admin, id, body);

  if (result.error) {
    const status = result.error === "Espacio no encontrado" ? 404 : 400;
    return NextResponse.json({ error: result.error }, { status });
  }

  return NextResponse.json({ espacio: result.row });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await requireAutoridadSession();
  if (isAutoridadError(auth)) return auth.error;

  const { id } = await context.params;
  const result = await deleteEspacio(auth.admin, id);

  if (!result.ok) {
    const status = result.error === "Espacio no encontrado" ? 404 : 400;
    return NextResponse.json({ error: result.error }, { status });
  }

  return NextResponse.json({ ok: true });
}
