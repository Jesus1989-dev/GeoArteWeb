import { NextResponse } from "next/server";
import { listFuentesAdmin, createFuenteAdmin } from "@/lib/data/supabase/admin-fuentes-server";
import type { AdminFuenteFormInput } from "@/lib/domain/admin";
import {
  isAutoridadError,
  requireAutoridadSession,
} from "@/lib/admin/require-autoridad";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAutoridadSession();
  if (isAutoridadError(auth)) return auth.error;

  try {
    const fuentes = await listFuentesAdmin(auth.admin);
    return NextResponse.json({ fuentes });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al listar fuentes";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await requireAutoridadSession();
  if (isAutoridadError(auth)) return auth.error;

  const body = (await request.json()) as AdminFuenteFormInput;
  const result = await createFuenteAdmin(auth.admin, body);

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ fuente: result.row }, { status: 201 });
}
