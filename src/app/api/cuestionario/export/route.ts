import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/data/supabase/server";
import {
  fetchInstitutionalRowsWithClient,
  fetchResumenCuestionarioWithClient,
} from "@/lib/data/supabase/cuestionario.repository";
import { buildCuestionarioExportFile } from "@/lib/cuestionario/export-cuestionario";
import { periodoSemestralActual } from "@/lib/cuestionario/cuestionario-periodo";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Sesión requerida" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const periodo = searchParams.get("periodo")?.trim() || periodoSemestralActual();
    const alcaldia = searchParams.get("alcaldia")?.trim() || undefined;
    const format = searchParams.get("format")?.toUpperCase();

    if (format !== "PDF" && format !== "XLSX") {
      return NextResponse.json({ error: "Formato no válido" }, { status: 400 });
    }

    const [resumenAlcaldia, detalleInstitucional] = await Promise.all([
      fetchResumenCuestionarioWithClient(supabase, periodo),
      fetchInstitutionalRowsWithClient(supabase, {
        periodo,
        alcaldiaNombre: alcaldia,
      }),
    ]);

    const file = await buildCuestionarioExportFile(
      { periodo, resumenAlcaldia, detalleInstitucional },
      format,
    );

    return new NextResponse(file.bytes as BodyInit, {
      headers: {
        "Content-Type": file.mimeType,
        "Content-Disposition": `attachment; filename="${file.fileName}"`,
      },
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error al exportar cuestionario";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
