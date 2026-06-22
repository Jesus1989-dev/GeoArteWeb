import { isSupabaseConfigured } from "@/lib/data/supabase/config";
import { fetchTransporteCapaWithClient } from "@/lib/data/supabase/mapa-transporte.repository";
import { createSupabasePublicClient } from "@/lib/data/supabase/server-public";
import type { TransporteCapaData } from "@/lib/domain/transporte-capa";
import { buildTransporteReferenciaCollection } from "@/lib/mapa/transporte-referencia-geojson";
import {
  isTransporteCapaSimplified,
  loadTransporteFromLocalGeoJson,
} from "@/lib/mapa/transporte-local-geojson.server";

export type TransporteCapaSourceMode = "auto" | "supabase" | "geojson" | "fallback";

function withReferenciaFallback(): TransporteCapaData {
  return {
    lineas: buildTransporteReferenciaCollection(),
    source: "fallback",
  };
}

function resolveSourceMode(prefer?: TransporteCapaSourceMode): TransporteCapaSourceMode {
  const fromEnv = process.env.TRANSPORTE_CAPA_SOURCE?.trim().toLowerCase();
  if (prefer) return prefer;
  if (fromEnv === "supabase" || fromEnv === "geojson" || fromEnv === "fallback") {
    return fromEnv;
  }
  return "auto";
}

async function fetchTransporteFromSupabase(): Promise<TransporteCapaData | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const client = createSupabasePublicClient();
    const result = await fetchTransporteCapaWithClient(client);
    if (result.lineas.features.length === 0) return null;
    return result;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Supabase no disponible";
    console.warn("[mapa] transporte server:", message);
    return null;
  }
}

export async function fetchTransporteCapaServer(input?: {
  prefer?: TransporteCapaSourceMode;
}): Promise<TransporteCapaData> {
  const mode = resolveSourceMode(input?.prefer);
  const local = loadTransporteFromLocalGeoJson();
  const supabase = mode === "geojson" || mode === "fallback" ? null : await fetchTransporteFromSupabase();

  if (mode === "geojson") {
    return local.lineas.features.length > 0 ? local : withReferenciaFallback();
  }

  if (mode === "supabase") {
    if (supabase) return supabase;
    if (local.lineas.features.length > 0) return local;
    return withReferenciaFallback();
  }

  if (mode === "fallback") {
    return withReferenciaFallback();
  }

  // auto: GeoJSON local (detallado) → Supabase (si no es simplificado) → referencia
  if (local.lineas.features.length > 0) {
    if (!supabase || isTransporteCapaSimplified(supabase)) {
      return local;
    }
    return supabase;
  }

  if (supabase) return supabase;
  return withReferenciaFallback();
}
