import { NextResponse } from "next/server";
import {
  createRecursoCualitativoAdmin,
  listRecursosCualitativosAdmin,
} from "@/lib/data/supabase/admin-recursos-cualitativos-server";
import type { AdminRecursoCualitativoFormInput } from "@/lib/domain/admin";
import {
  isAutoridadError,
  requireAutoridadSession,
} from "@/lib/admin/require-autoridad";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAutoridadSession();
  if (isAutoridadError(auth)) return auth.error;

  try {
    const recursos = await listRecursosCualitativosAdmin(auth.admin);
    return NextResponse.json({ recursos });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error al listar recursos cualitativos";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await requireAutoridadSession();
  if (isAutoridadError(auth)) return auth.error;

  const body = (await request.json()) as AdminRecursoCualitativoFormInput;
  const result = await createRecursoCualitativoAdmin(auth.admin, body);

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ recurso: result.row }, { status: 201 });
}
