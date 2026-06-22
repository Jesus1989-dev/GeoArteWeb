import { NextResponse } from "next/server";
import {
  createEspacio,
  fetchCategoriasNombres,
} from "@/lib/data/supabase/admin-espacios-server";
import type { AdminEspacioFormInput } from "@/lib/domain/admin";
import {
  isAutoridadError,
  requireAutoridadSession,
} from "@/lib/admin/require-autoridad";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAutoridadSession();
  if (isAutoridadError(auth)) return auth.error;

  const categorias = await fetchCategoriasNombres(auth.admin);
  return NextResponse.json({ categorias });
}

export async function POST(request: Request) {
  const auth = await requireAutoridadSession();
  if (isAutoridadError(auth)) return auth.error;

  const body = (await request.json()) as AdminEspacioFormInput;
  const result = await createEspacio(auth.admin, body);

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ espacio: result.row }, { status: 201 });
}
