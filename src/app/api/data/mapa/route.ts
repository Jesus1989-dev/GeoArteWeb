import { NextResponse } from "next/server";
import { getMapaDataCached } from "@/lib/cache/server-page-cache";

export const revalidate = 60;

export async function GET() {
  try {
    const data = await getMapaDataCached();
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al cargar el mapa";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
