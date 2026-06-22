import { NextResponse } from "next/server";
import { fetchEspaciosFlujo } from "@/lib/data/supabase/admin-espacios-server";
import {
  isAutoridadError,
  requireAutoridadSession,
} from "@/lib/admin/require-autoridad";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAutoridadSession();
  if (isAutoridadError(auth)) return auth.error;

  try {
    const espacios = await fetchEspaciosFlujo(auth.admin);
    return NextResponse.json({ espacios });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al cargar flujo";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
