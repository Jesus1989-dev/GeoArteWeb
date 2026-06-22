import { NextResponse } from "next/server";
import { getPoliticasPageDataCached } from "@/lib/cache/server-page-cache";

export const revalidate = 60;

export async function GET() {
  try {
    const data = await getPoliticasPageDataCached();
    return NextResponse.json(data);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error al cargar políticas";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
