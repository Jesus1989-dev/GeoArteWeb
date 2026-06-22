import { NextResponse } from "next/server";
import { searchEspaciosCulturales } from "@/lib/data/supabase/search.repository";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";

  if (q.length < 2) {
    return NextResponse.json({ suggestions: [], dataSource: "mock" });
  }

  try {
    const result = await searchEspaciosCulturales(q);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error en búsqueda";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
