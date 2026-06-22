import { NextResponse } from "next/server";
import {
  isAutoridadError,
  requireAutoridadSession,
} from "@/lib/admin/require-autoridad";
import { fetchMapaCapasEstado } from "@/lib/mapa/sync-mapa-capas.server";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAutoridadSession();
  if (isAutoridadError(auth)) return auth.error;

  try {
    const estado = await fetchMapaCapasEstado(auth.admin);
    return NextResponse.json({ estado });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al cargar estado";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
