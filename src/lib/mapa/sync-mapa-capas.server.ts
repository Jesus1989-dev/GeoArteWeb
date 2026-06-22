import type { SupabaseClient } from "@supabase/supabase-js";
import type { AdminMapaCapasEstado, AdminMapaCapasSyncResult } from "@/lib/domain/admin";
import { getAnioCorteMetricas } from "@/lib/data/supabase/config";

function formatFecha(iso: string | null | undefined): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

async function countByTipo(
  admin: SupabaseClient,
  table: string,
  tipo?: string,
): Promise<number> {
  let query = admin.from(table).select("id", { count: "exact", head: true });
  if (tipo) query = query.eq("tipo", tipo);
  const { count, error } = await query;
  if (error) {
    console.warn(`[mapa-sync] count ${table}:`, error.message);
    return 0;
  }
  return count ?? 0;
}

async function logSync(
  admin: SupabaseClient,
  accion: string,
  filas: number,
  mensaje: string,
): Promise<void> {
  const { error } = await admin.from("mapa_sync_log").insert({
    accion,
    filas_afectadas: filas,
    mensaje,
  });
  if (error) {
    console.warn("[mapa-sync] log:", error.message);
  }
}

export async function fetchMapaCapasEstado(
  admin: SupabaseClient,
): Promise<AdminMapaCapasEstado> {
  const anio = getAnioCorteMetricas();

  const [
    metricasRes,
    alcaldiasCount,
    macrozonasCount,
    transporteCount,
    espaciosRes,
    syncLogRes,
    metricasMaxRes,
    geometriasMaxRes,
    transporteMaxRes,
  ] = await Promise.all([
    admin
      .from("metricas_alcaldia")
      .select("id", { count: "exact", head: true })
      .eq("anio", anio),
    countByTipo(admin, "territorio_geometria", "alcaldia"),
    countByTipo(admin, "territorio_geometria", "macrozona"),
    admin
      .from("capa_transporte_linea")
      .select("id", { count: "exact", head: true })
      .eq("activo", true),
    admin
      .from("espacios_culturales")
      .select("id", { count: "exact", head: true })
      .not("latitud", "is", null)
      .not("longitud", "is", null),
    admin
      .from("mapa_sync_log")
      .select("accion, filas_afectadas, mensaje, ejecutado_en")
      .order("ejecutado_en", { ascending: false })
      .limit(8),
    admin
      .from("metricas_alcaldia")
      .select("actualizado_en")
      .eq("anio", anio)
      .order("actualizado_en", { ascending: false })
      .limit(1)
      .maybeSingle(),
    admin
      .from("territorio_geometria")
      .select("actualizado_en")
      .order("actualizado_en", { ascending: false })
      .limit(1)
      .maybeSingle(),
    admin
      .from("capa_transporte_linea")
      .select("actualizado_en")
      .order("actualizado_en", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const ultimosSync = (syncLogRes.data ?? []).map((row) => ({
    accion: String(row.accion ?? ""),
    filasAfectadas: Number(row.filas_afectadas) || 0,
    mensaje: String(row.mensaje ?? ""),
    ejecutadoEn: formatFecha(row.ejecutado_en),
  }));

  return {
    anioCorte: anio,
    espaciosGeoref: espaciosRes.count ?? 0,
    metricasAlcaldia: metricasRes.count ?? 0,
    geometriasAlcaldias: alcaldiasCount,
    geometriasMacrozonas: macrozonasCount,
    lineasTransporte: transporteCount.count ?? 0,
    ultimaMetricas: formatFecha(metricasMaxRes.data?.actualizado_en),
    ultimaGeometrias: formatFecha(geometriasMaxRes.data?.actualizado_en),
    ultimaTransporte: formatFecha(transporteMaxRes.data?.actualizado_en),
    ultimosSync,
  };
}

export async function syncMapaCapas(
  admin: SupabaseClient,
  anio = getAnioCorteMetricas(),
): Promise<AdminMapaCapasSyncResult> {
  const pasos: AdminMapaCapasSyncResult["pasos"] = [];

  const { data: metricasRows, error: metricasError } = await admin.rpc(
    "sync_metricas_alcaldia",
    { p_anio: anio },
  );

  if (metricasError) {
    throw new Error(`sync_metricas_alcaldia: ${metricasError.message}`);
  }

  const filasMetricas = Number(metricasRows) || 0;
  const msgMetricas = `${filasMetricas} alcaldías · año ${anio}`;
  await logSync(admin, "metricas_alcaldia", filasMetricas, msgMetricas);
  pasos.push({ accion: "Métricas por alcaldía", filas: filasMetricas, ok: true });

  const { data: macroRows, error: macroError } = await admin.rpc(
    "sync_macrozonas_desde_alcaldias",
  );

  if (macroError) {
    throw new Error(`sync_macrozonas_desde_alcaldias: ${macroError.message}`);
  }

  const filasMacro = Number(macroRows) || 0;
  const msgMacro = `${filasMacro} macrozonas derivadas`;
  await logSync(admin, "macrozonas", filasMacro, msgMacro);
  pasos.push({ accion: "Macrozonas (unión)", filas: filasMacro, ok: true });

  const estado = await fetchMapaCapasEstado(admin);

  return {
    ok: true,
    mensaje: "Sincronización completada.",
    pasos,
    estado,
  };
}
