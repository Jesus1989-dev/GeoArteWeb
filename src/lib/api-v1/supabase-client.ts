import { createSupabaseServerClient } from "@/lib/data/supabase/server";
import { isSupabaseConfigured } from "@/lib/data/supabase/config";

/** Cliente Supabase para rutas públicas API v1 (lectura). */
export async function getApiV1SupabaseClient() {
  if (!isSupabaseConfigured()) return null;
  try {
    return await createSupabaseServerClient();
  } catch {
    return null;
  }
}
