import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/data/supabase/server";
import { getSupabaseServiceRoleClient } from "@/lib/data/supabase/service-role";
import { parseExportMeta } from "@/lib/reportes/export-meta";
import {
  deleteExportFile,
  resolveExportStoragePath,
} from "@/lib/reportes/export-storage";

export const dynamic = "force-dynamic";

export async function DELETE(request: Request) {
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

    const service = getSupabaseServiceRoleClient();
    if (!service) {
      return NextResponse.json(
        { error: "SUPABASE_SERVICE_ROLE_KEY no configurada en el servidor" },
        { status: 503 },
      );
    }

    const { data: row, error } = await service
      .from("export_downloads")
      .select("id, user_id, file_name, meta")
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
    if (storagePath) {
      try {
        await deleteExportFile(storagePath);
      } catch (storageErr) {
        console.warn("[reportes/eliminar] storage:", storageErr);
      }
    }

    const { error: deleteError } = await service
      .from("export_downloads")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, id });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error al eliminar la exportación";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
