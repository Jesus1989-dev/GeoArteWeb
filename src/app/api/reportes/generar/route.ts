import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import type { DashboardFilterState } from "@/lib/dashboard/apply-dashboard-filters";
import { resolveAnioCorteFromFilters } from "@/lib/dashboard/apply-dashboard-filters";
import { createSupabaseServerClient } from "@/lib/data/supabase/server";
import { getSupabaseServiceRoleClient } from "@/lib/data/supabase/service-role";
import { buildReportFile } from "@/lib/reportes/build-report-file";
import { fetchProfileByUserId } from "@/lib/data/supabase/profiles.repository";
import { fetchReportePlantillaByIdServer } from "@/lib/data/supabase/plantillas-reporte.repository.server";
import { buildDefaultFiltersFromPlantilla } from "@/lib/reportes/plantilla-filtros";
import { serializeExportMeta } from "@/lib/reportes/export-meta";
import { resolveExportAutorFromUser } from "@/lib/reportes/map-export-download-row";
import { uploadExportFile } from "@/lib/reportes/export-storage";
import { buildFilteredDashboardForReport } from "@/lib/reportes/filter-dashboard-for-report";
import { fetchCuestionarioForReportServer } from "@/lib/cuestionario/fetch-cuestionario-for-report.server";
import { toExportDownloadDbFormat } from "@/lib/reportes/export-format";
import type { ReporteFormato } from "@/lib/reportes/plantillas-reporte";
import { getDashboardDataServer } from "@/lib/services/dashboard.service.server";

export const dynamic = "force-dynamic";

type GenerarBody = {
  plantillaId?: string;
  format?: ReporteFormato;
  filters?: DashboardFilterState;
};

function isValidFormat(value: unknown): value is ReporteFormato {
  return value === "PDF" || value === "XLSX";
}

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Sesión requerida" }, { status: 401 });
    }

    if (!getSupabaseServiceRoleClient()) {
      return NextResponse.json(
        { error: "SUPABASE_SERVICE_ROLE_KEY no configurada en el servidor" },
        { status: 503 },
      );
    }

    const body = (await request.json()) as GenerarBody;
    const plantillaId = body.plantillaId?.trim() ?? "p3";
    const plantilla = await fetchReportePlantillaByIdServer(plantillaId);
    if (!plantilla) {
      return NextResponse.json({ error: "Plantilla no válida" }, { status: 400 });
    }

    if (!isValidFormat(body.format)) {
      return NextResponse.json({ error: "Formato no válido" }, { status: 400 });
    }

    const dashboard = await getDashboardDataServer();
    const filters: DashboardFilterState =
      body.filters ??
      buildDefaultFiltersFromPlantilla(
        plantilla.filtrosDefault,
        dashboard.filtroOpciones,
      );

    const anioCorte = resolveAnioCorteFromFilters(filters, dashboard.anioCorte);
    const dashboardForReport =
      anioCorte === dashboard.anioCorte
        ? dashboard
        : await getDashboardDataServer({ anioCorte });

    if (!plantilla.formatos.includes(body.format)) {
      return NextResponse.json(
        { error: `Formato ${body.format} no disponible para esta plantilla` },
        { status: 400 },
      );
    }

    const filtered = buildFilteredDashboardForReport(dashboardForReport, filters);
    const cuestionario = await fetchCuestionarioForReportServer(filters.alcaldia);
    const file = await buildReportFile({
      plantillaTitulo: plantilla.titulo,
      plantillaCategoria: plantilla.categoria,
      format: body.format,
      filters,
      filtered,
      anioCorte: dashboardForReport.anioCorte,
      conteoPorAlcaldia: dashboardForReport.raw?.conteoPorAlcaldia,
      cuestionario,
    });

    const exportId = randomUUID();
    const metaLabel = `${plantilla.categoria} · ${filters.alcaldia} · ${file.sizeKb} KB`;

    let profileDisplayName: string | null = null;
    try {
      const profile = await fetchProfileByUserId(supabase, user.id);
      profileDisplayName = profile?.display_name ?? null;
    } catch {
      /* perfil opcional */
    }
    const autor = resolveExportAutorFromUser(user, profileDisplayName);

    const storagePath = await uploadExportFile({
      userId: user.id,
      exportId,
      fileName: file.fileName,
      bytes: file.bytes,
      mimeType: file.mimeType,
    });

    const meta = serializeExportMeta({
      source: "web",
      label: metaLabel,
      storagePath,
      sizeKb: file.sizeKb,
      plantillaId: plantilla.id,
      autor,
      estado: "Generado",
    });

    const { data: row, error: insertError } = await supabase
      .from("export_downloads")
      .insert({
        id: exportId,
        user_id: user.id,
        file_name: file.fileName,
        format: toExportDownloadDbFormat(body.format),
        meta,
      })
      .select("id, file_name, format, meta, created_at")
      .single();

    if (insertError) {
      return NextResponse.json(
        { error: `No se pudo registrar la exportación: ${insertError.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json({
      id: row.id,
      fileName: row.file_name,
      format: row.format,
      downloadUrl: `/api/reportes/descargar?id=${encodeURIComponent(row.id)}`,
      metaLabel,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error al generar el reporte";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
