import { NextResponse } from "next/server";
import { getPublicSiteBaseUrl } from "@/lib/api-v1/base-url";
import { getContactoPageDataCached } from "@/lib/cache/server-page-cache";

export const revalidate = 60;

export async function GET() {
  try {
    const apiBaseUrl = await getPublicSiteBaseUrl();
    const data = await getContactoPageDataCached(apiBaseUrl);
    return NextResponse.json(data);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error al cargar contacto";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
