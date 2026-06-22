import type { ReporteAyuda } from "@/lib/domain/reportes";
import {
  REPORTE_PLANTILLAS_FALLBACK,
  type ReportePlantillaDef,
} from "@/lib/reportes/plantillas-reporte";
import {
  mapReportePlantillaRow,
  type ReportePlantillaRow,
} from "@/lib/reportes/map-plantilla-row";
import { getSupabaseBrowserClient } from "@/lib/data/supabase/client";

type ReportesCentroConfigRow = {
  ayuda_texto: string;
  ayuda_enlace_label: string;
  ayuda_enlace_href: string;
};

export const REPORTES_AYUDA_FALLBACK: ReporteAyuda = {
  texto:
    "Genera informes PDF o Excel con filtros propios. Cada exportación se guarda en tu historial y puedes volver a descargarla cuando quieras.",
  enlaceApi: "Ver historial en Mi perfil",
  enlaceHref: "/perfil",
};

function mapAyudaRow(row: ReportesCentroConfigRow): ReporteAyuda {
  return {
    texto: row.ayuda_texto.trim() || REPORTES_AYUDA_FALLBACK.texto,
    enlaceApi: row.ayuda_enlace_label.trim() || REPORTES_AYUDA_FALLBACK.enlaceApi,
    enlaceHref: row.ayuda_enlace_href.trim() || REPORTES_AYUDA_FALLBACK.enlaceHref,
  };
}

export async function fetchReportePlantillasFromSupabase(): Promise<ReportePlantillaDef[]> {
  const client = getSupabaseBrowserClient();
  if (!client) return [...REPORTE_PLANTILLAS_FALLBACK];

  const { data, error } = await client
    .from("reporte_plantillas")
    .select("id, titulo, descripcion, categoria, formatos, filtros_default, orden, activo")
    .eq("activo", true)
    .order("orden", { ascending: true });

  if (error) {
    console.warn("[reportes] reporte_plantillas:", error.message);
    return [...REPORTE_PLANTILLAS_FALLBACK];
  }

  const mapped = (data ?? [])
    .map((row) => mapReportePlantillaRow(row as ReportePlantillaRow))
    .filter((row): row is ReportePlantillaDef => row != null);

  return mapped.length > 0 ? mapped : [...REPORTE_PLANTILLAS_FALLBACK];
}

export async function fetchReportesCentroAyudaFromSupabase(): Promise<ReporteAyuda> {
  const client = getSupabaseBrowserClient();
  if (!client) return REPORTES_AYUDA_FALLBACK;

  const { data, error } = await client
    .from("reportes_centro_config")
    .select("ayuda_texto, ayuda_enlace_label, ayuda_enlace_href")
    .eq("id", "default")
    .maybeSingle();

  if (error || !data) {
    if (error) console.warn("[reportes] reportes_centro_config:", error.message);
    return REPORTES_AYUDA_FALLBACK;
  }

  return mapAyudaRow(data as ReportesCentroConfigRow);
}
