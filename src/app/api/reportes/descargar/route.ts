import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/data/supabase/server";
import { parseExportMeta } from "@/lib/reportes/export-meta";
import {
  downloadExportFile,
  resolveExportStoragePath,
} from "@/lib/reportes/export-storage";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id")?.trim();
    if (!id) {
      return NextResponse.json({ error: "Falta el id de exportación" }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Sesión requerida" }, { status: 401 });
    }

    const { data: row, error } = await supabase
      .from("export_downloads")
      .select("id, user_id, file_name, format, meta")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!row || row.user_id !== user.id) {
      return NextResponse.json({ error: "Exportación no encontrada" }, { status: 404 });
    }

    const parsed = parseExportMeta(row.meta);
    const storagePath = resolveExportStoragePath({
      parsed,
      userId: user.id,
      exportId: id,
      fileName: row.file_name,
    });

    if (!storagePath) {
      return NextResponse.json(
        {
          error:
            "Este archivo se generó en la app móvil y no está almacenado en la nube web.",
        },
        { status: 404 },
      );
    }

    const { bytes, mimeType } = await downloadExportFile(storagePath);
    const fileName = row.file_name?.trim() || `geoarte-export.${row.format?.toLowerCase() ?? "bin"}`;

    return new NextResponse(Buffer.from(bytes), {
      status: 200,
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": `attachment; filename="${fileName.replace(/"/g, "")}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error al descargar el reporte";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
