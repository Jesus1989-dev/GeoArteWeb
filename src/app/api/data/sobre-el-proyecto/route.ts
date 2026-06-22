import { NextResponse } from "next/server";
import { getSobreElProyectoPageDataCached } from "@/lib/cache/server-page-cache";

export const revalidate = 60;

export async function GET() {
  try {
    const data = await getSobreElProyectoPageDataCached();
    return NextResponse.json(data);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error al cargar la página del proyecto";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
