import type { ReporteAyuda } from "@/lib/domain/reportes";
import { createSupabaseServerClient } from "@/lib/data/supabase/server";
import { REPORTES_AYUDA_FALLBACK } from "@/lib/data/supabase/plantillas-reporte.repository";
import {
  mapReportePlantillaRow,
  type ReportePlantillaRow,
} from "@/lib/reportes/map-plantilla-row";
import {
  getPlantillaById,
  REPORTE_PLANTILLAS_FALLBACK,
  type ReportePlantillaDef,
} from "@/lib/reportes/plantillas-reporte";

async function queryPlantillas(client: Awaited<ReturnType<typeof createSupabaseServerClient>>) {
  return client
    .from("reporte_plantillas")
    .select("id, titulo, descripcion, categoria, formatos, filtros_default, orden, activo")
    .eq("activo", true)
    .order("orden", { ascending: true });
}

export async function fetchReportePlantillasServer(): Promise<ReportePlantillaDef[]> {
  try {
    const client = await createSupabaseServerClient();
    const { data, error } = await queryPlantillas(client);

    if (error) {
      console.warn("[reportes/server] reporte_plantillas:", error.message);
      return [...REPORTE_PLANTILLAS_FALLBACK];
    }

    const mapped = (data ?? [])
      .map((row) => mapReportePlantillaRow(row as ReportePlantillaRow))
      .filter((row): row is ReportePlantillaDef => row != null);

    return mapped.length > 0 ? mapped : [...REPORTE_PLANTILLAS_FALLBACK];
  } catch (err) {
    console.warn("[reportes/server] plantillas fallback:", err);
    return [...REPORTE_PLANTILLAS_FALLBACK];
  }
}

export async function fetchReportePlantillaByIdServer(
  id: string,
): Promise<ReportePlantillaDef | undefined> {
  const plantillas = await fetchReportePlantillasServer();
  return getPlantillaById(id, plantillas);
}

export async function fetchReportesCentroAyudaServer(): Promise<ReporteAyuda> {
  try {
    const client = await createSupabaseServerClient();
    const { data, error } = await client
      .from("reportes_centro_config")
      .select("ayuda_texto, ayuda_enlace_label, ayuda_enlace_href")
      .eq("id", "default")
      .maybeSingle();

    if (error || !data) {
      if (error) console.warn("[reportes/server] reportes_centro_config:", error.message);
      return REPORTES_AYUDA_FALLBACK;
    }

    return {
      texto: String(data.ayuda_texto ?? "").trim() || REPORTES_AYUDA_FALLBACK.texto,
      enlaceApi:
        String(data.ayuda_enlace_label ?? "").trim() || REPORTES_AYUDA_FALLBACK.enlaceApi,
      enlaceHref:
        String(data.ayuda_enlace_href ?? "").trim() || REPORTES_AYUDA_FALLBACK.enlaceHref,
    };
  } catch {
    return REPORTES_AYUDA_FALLBACK;
  }
}
