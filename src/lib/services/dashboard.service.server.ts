import type { DashboardSupabasePayload } from "@/lib/data/supabase/dashboard.repository";
import { fetchDashboardPayloadServer } from "@/lib/data/supabase/dashboard.repository.server";
import { isSupabaseConfigured } from "@/lib/data/supabase/config";
import { withTimeout } from "@/lib/utils/with-timeout";
import {
  getDashboardDataMock,
  type DashboardPageData,
} from "@/lib/services/dashboard.service";

const SUPABASE_LOAD_TIMEOUT_MS = 25_000;

function mapPayloadToPageData(payload: DashboardSupabasePayload): DashboardPageData {
  return {
    ...payload,
    dataSource: "supabase",
    dataSourceNote: `Métricas SECTEI · corte ${payload.anioCorte} · ${payload.dashboardKpis[0]?.value ?? "—"} espacios`,
  };
}

/** Dashboard en servidor (API routes) — usa cookies SSR, no el bundle cliente. */
export async function getDashboardDataServer(options?: {
  anioCorte?: number;
  /** Omite el padrón completo para acelerar la carga inicial. */
  includeEspacios?: boolean;
}): Promise<DashboardPageData> {
  if (!isSupabaseConfigured()) {
    return getDashboardDataMock();
  }

  try {
    const payload = await withTimeout(
      fetchDashboardPayloadServer({
        anioCorteOverride: options?.anioCorte,
        includeEspacios: options?.includeEspacios,
      }),
      SUPABASE_LOAD_TIMEOUT_MS,
      "Dashboard",
    );
    return mapPayloadToPageData(payload);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error desconocido al cargar dashboard";
    console.error("[dashboard] Supabase (server):", message);
    return {
      ...getDashboardDataMock(),
      dataSource: "mock",
      dataSourceNote: `Fallback demo (${message})`,
    };
  }
}
