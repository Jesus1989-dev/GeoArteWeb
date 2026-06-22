import { NextResponse } from "next/server";
import {
  createUsuarioAdmin,
  listUsuariosAdmin,
} from "@/lib/data/supabase/admin-usuarios-server";
import type { AdminUsuarioCreateFormInput } from "@/lib/domain/admin";
import {
  isAutoridadError,
  requireAutoridadSession,
} from "@/lib/admin/require-autoridad";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAutoridadSession();
  if (isAutoridadError(auth)) return auth.error;

  try {
    const usuarios = await listUsuariosAdmin(auth.admin);
    return NextResponse.json({ usuarios });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al listar usuarios";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await requireAutoridadSession();
  if (isAutoridadError(auth)) return auth.error;

  const body = (await request.json()) as AdminUsuarioCreateFormInput;
  const result = await createUsuarioAdmin(auth.admin, body);

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json(
    { usuario: result.row, mensaje: result.mensaje },
    { status: 201 },
  );
}
