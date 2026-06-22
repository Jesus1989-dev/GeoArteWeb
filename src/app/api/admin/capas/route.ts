import { NextResponse } from "next/server";
import {
  createCapaAdmin,
  listCapasAdmin,
} from "@/lib/data/supabase/admin-capas-server";
import type { AdminCapaFormInput } from "@/lib/domain/admin";
import {
  isAutoridadError,
  requireAutoridadSession,
} from "@/lib/admin/require-autoridad";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAutoridadSession();
  if (isAutoridadError(auth)) return auth.error;

  try {
    const capas = await listCapasAdmin(auth.admin);
    return NextResponse.json({ capas });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al listar capas";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await requireAutoridadSession();
  if (isAutoridadError(auth)) return auth.error;

  const body = (await request.json()) as AdminCapaFormInput;
  const result = await createCapaAdmin(auth.admin, body);

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ capa: result.row }, { status: 201 });
}
