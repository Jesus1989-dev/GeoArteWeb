import { NextResponse } from "next/server";
import { publishEspacio } from "@/lib/data/supabase/admin-espacios-server";
import {
  isAutoridadError,
  requireAutoridadSession,
} from "@/lib/admin/require-autoridad";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: RouteContext) {
  const auth = await requireAutoridadSession();
  if (isAutoridadError(auth)) return auth.error;

  const { id } = await context.params;
  const result = await publishEspacio(auth.admin, id);

  if (result.error) {
    const status = result.error === "Espacio no encontrado" ? 404 : 400;
    return NextResponse.json({ error: result.error }, { status });
  }

  return NextResponse.json({ espacio: result.row });
}
