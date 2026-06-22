import { NextResponse } from "next/server";
import { getAdminPageData } from "@/lib/services/admin.service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getAdminPageData();
    return NextResponse.json(data);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error al cargar administración";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
