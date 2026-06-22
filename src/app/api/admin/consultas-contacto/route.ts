import { NextResponse } from "next/server";
import { listConsultasContactoAdmin } from "@/lib/data/supabase/admin-consultas-contacto-server";
import {
  isAutoridadError,
  requireAutoridadSession,
} from "@/lib/admin/require-autoridad";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAutoridadSession();
  if (isAutoridadError(auth)) return auth.error;

  try {
    const consultas = await listConsultasContactoAdmin(auth.admin);
    return NextResponse.json({ consultas });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al listar consultas";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
