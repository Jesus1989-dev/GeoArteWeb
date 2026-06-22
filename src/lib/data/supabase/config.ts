/** Lectura de credenciales Supabase (cliente navegador). */
export function isSupabaseConfigured(): boolean {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();
  if (!url || !key) return false;
  if (url.includes("TU_PROYECTO") || key.includes("TU_ANON")) return false;
  return true;
}

export function getSupabaseUrl(): string | undefined {
  return process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || undefined;
}

export function getSupabaseAnonKey(): string | undefined {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || undefined;
}

export function getAnioCorteMetricas(): number {
  const raw = process.env.NEXT_PUBLIC_ANIO_CORTE_METRICAS?.trim();
  if (raw) {
    const y = Number.parseInt(raw, 10);
    if (Number.isFinite(y) && y >= 1990 && y <= 2100) return y;
  }
  return new Date().getFullYear();
}
