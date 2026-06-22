import { NextResponse } from "next/server";
import { updateConsultaContactoEstadoAdmin } from "@/lib/data/supabase/admin-consultas-contacto-server";
import type { ConsultaContactoEstado } from "@/lib/domain/contacto";
import {
  isAutoridadError,
  requireAutoridadSession,
} from "@/lib/admin/require-autoridad";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

type UpdateBody = {
  estado?: ConsultaContactoEstado;
};

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireAutoridadSession();
  if (isAutoridadError(auth)) return auth.error;

  const { id } = await context.params;
  const body = (await request.json()) as UpdateBody;

  if (!body.estado) {
    return NextResponse.json({ error: "El estado es obligatorio" }, { status: 400 });
  }

  const result = await updateConsultaContactoEstadoAdmin(auth.admin, id, body.estado);

  if (result.error) {
    const status = result.error === "Consulta no encontrada" ? 404 : 400;
    return NextResponse.json({ error: result.error }, { status });
  }

  return NextResponse.json({ consulta: result.row });
}
