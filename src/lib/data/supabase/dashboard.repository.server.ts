import { createSupabaseServerClient } from "@/lib/data/supabase/server";
import {
  fetchDashboardWithClient,
  fetchEspaciosRaw,
  type FetchDashboardOptions,
} from "@/lib/data/supabase/dashboard.repository";

/** Carga dashboard desde Supabase en Route Handlers / Server Components. */
export async function fetchDashboardPayloadServer(
  options?: FetchDashboardOptions | number,
) {
  const client = await createSupabaseServerClient();
  return fetchDashboardWithClient(client, options);
}

/** Padrón completo de espacios (carga diferida tras métricas del dashboard). */
export async function fetchDashboardEspaciosServer() {
  const client = await createSupabaseServerClient();
  return fetchEspaciosRaw(client);
}
