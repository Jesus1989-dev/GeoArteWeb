import { NextResponse } from "next/server";
import {
  createPoliticaRecomendacionAdmin,
  listPoliticasRecomendacionesAdmin,
} from "@/lib/data/supabase/admin-politicas-recomendaciones-server";
import type { AdminPoliticaRecomendacionFormInput } from "@/lib/domain/admin";
import {
  isAutoridadError,
  requireAutoridadSession,
} from "@/lib/admin/require-autoridad";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAutoridadSession();
  if (isAutoridadError(auth)) return auth.error;

  try {
    const recomendaciones = await listPoliticasRecomendacionesAdmin(auth.admin);
    return NextResponse.json({ recomendaciones });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error al listar recomendaciones";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await requireAutoridadSession();
  if (isAutoridadError(auth)) return auth.error;

  const body = (await request.json()) as AdminPoliticaRecomendacionFormInput;
  const result = await createPoliticaRecomendacionAdmin(auth.admin, body);

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ recomendacion: result.row }, { status: 201 });
}
