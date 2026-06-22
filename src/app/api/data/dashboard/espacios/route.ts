import { NextResponse } from "next/server";
import { fetchDashboardEspaciosServer } from "@/lib/data/supabase/dashboard.repository.server";
import { isSupabaseConfigured } from "@/lib/data/supabase/config";
import { withTimeout } from "@/lib/utils/with-timeout";

export const dynamic = "force-dynamic";

const LOAD_TIMEOUT_MS = 25_000;

/** Padrón de espacios para el dashboard (carga diferida tras KPIs y gráficas). */
export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ espacios: [] });
  }

  try {
    const espacios = await withTimeout(
      fetchDashboardEspaciosServer(),
      LOAD_TIMEOUT_MS,
      "Dashboard espacios",
    );
    return NextResponse.json({ espacios });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error al cargar el padrón de espacios";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
