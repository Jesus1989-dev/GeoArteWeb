import { NextResponse } from "next/server";
import {
  isAutoridadError,
  requireAutoridadSession,
} from "@/lib/admin/require-autoridad";
import { getAnioCorteMetricas } from "@/lib/data/supabase/config";
import { syncMapaCapas } from "@/lib/mapa/sync-mapa-capas.server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const auth = await requireAutoridadSession();
  if (isAutoridadError(auth)) return auth.error;

  let anio = getAnioCorteMetricas();
  try {
    const body = (await request.json()) as { anio?: number };
    if (typeof body.anio === "number" && body.anio >= 2000 && body.anio <= 2100) {
      anio = body.anio;
    }
  } catch {
    // cuerpo vacío: usar año de corte por defecto
  }

  try {
    const result = await syncMapaCapas(auth.admin, anio);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error en sincronización";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
