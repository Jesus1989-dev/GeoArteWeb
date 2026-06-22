import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/data/supabase/server";
import { fetchReportesHistorialForUserServer } from "@/lib/data/supabase/export-downloads.repository.server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const autor = searchParams.get("autor")?.trim() || undefined;

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Sesión requerida" }, { status: 401 });
    }

    const historial = await fetchReportesHistorialForUserServer({
      userId: user.id,
      autor,
      limit: 12,
    });

    return NextResponse.json(historial);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error al cargar el historial";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
