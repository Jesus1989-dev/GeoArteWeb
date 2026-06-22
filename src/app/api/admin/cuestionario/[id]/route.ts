import { NextResponse } from "next/server";
import { updateCuestionarioRevisionAdmin } from "@/lib/data/supabase/admin-cuestionario-server";
import type { CuestionarioEstatusRevision } from "@/lib/domain/cuestionario";
import {
  isAutoridadError,
  requireAutoridadSession,
} from "@/lib/admin/require-autoridad";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

type PatchBody = {
  periodo?: string;
  estatus?: CuestionarioEstatusRevision;
  notas?: string | null;
};

const VALID: CuestionarioEstatusRevision[] = ["pendiente", "revisado", "observado"];

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireAutoridadSession();
  if (isAutoridadError(auth)) return auth.error;

  const { id } = await context.params;
  const body = (await request.json()) as PatchBody;

  if (!body.periodo?.trim()) {
    return NextResponse.json({ error: "Periodo requerido" }, { status: 400 });
  }
  if (!body.estatus || !VALID.includes(body.estatus)) {
    return NextResponse.json({ error: "Estatus no válido" }, { status: 400 });
  }

  try {
    const row = await updateCuestionarioRevisionAdmin(body.periodo.trim(), id, {
      estatus: body.estatus,
      notas: body.notas ?? null,
      revisadoPor: auth.user.id,
    });
    if (!row) {
      return NextResponse.json({ error: "Respuesta no encontrada" }, { status: 404 });
    }
    return NextResponse.json({ row });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "No se pudo actualizar la revisión";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
