import { NextResponse } from "next/server";
import { buildAdminLogsFromSupabase } from "@/lib/admin/build-admin-logs";
import {
  isAutoridadError,
  requireAutoridadSession,
} from "@/lib/admin/require-autoridad";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAutoridadSession();
  if (isAutoridadError(auth)) return auth.error;

  try {
    const logs = await buildAdminLogsFromSupabase(auth.admin);
    return NextResponse.json({ logs });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al cargar logs";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
