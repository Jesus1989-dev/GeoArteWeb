import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  getSupabaseAnonKey,
  getSupabaseUrl,
  isSupabaseConfigured,
} from "@/lib/data/supabase/config";

let publicClient: SupabaseClient | null = null;

/**
 * Cliente anon sin cookies — apto para datos públicos cacheables (ISR / unstable_cache).
 * No usar para operaciones que dependan de la sesión del usuario.
 */
export function createSupabasePublicClient(): SupabaseClient {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase no está configurado.");
  }

  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();
  if (!url || !key) {
    throw new Error("Faltan credenciales de Supabase.");
  }

  publicClient ??= createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return publicClient;
}
