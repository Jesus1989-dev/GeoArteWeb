import { NextResponse } from "next/server";
import { updateUsuarioRolAdmin } from "@/lib/data/supabase/admin-usuarios-server";
import type { AdminUsuarioRolFormInput } from "@/lib/domain/admin";
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
  const body = (await request.json()) as AdminUsuarioRolFormInput;
  const result = await updateUsuarioRolAdmin(auth.admin, id, body, {
    actorUserId: auth.user.id,
  });

  if (result.error) {
    const status = result.error === "Usuario no encontrado" ? 404 : 400;
    return NextResponse.json({ error: result.error }, { status });
  }

  return NextResponse.json({ usuario: result.row });
}
