import { NextResponse } from "next/server";
import { getHomePageDataCached } from "@/lib/cache/server-page-cache";

export const revalidate = 60;

export async function GET() {
  try {
    const data = await getHomePageDataCached();
    return NextResponse.json(data);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error al cargar la página de inicio";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
