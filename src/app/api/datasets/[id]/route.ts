import { NextResponse } from "next/server";
import { buildContactoDatasetFile } from "@/lib/datasets/contacto-datasets.server";
import { isContactoDatasetId } from "@/lib/domain/datasets";
import { getApiV1SupabaseClient } from "@/lib/api-v1/supabase-client";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  if (!isContactoDatasetId(id)) {
    return Response.json({ error: "Dataset no encontrado" }, { status: 404 });
  }

  try {
    const client = await getApiV1SupabaseClient();
    const file = await buildContactoDatasetFile(client, id);
    const bodyBytes: Uint8Array =
      typeof file.body === "string"
        ? new TextEncoder().encode(file.body)
        : file.body;

    if (bodyBytes.byteLength === 0) {
      return NextResponse.json(
        { error: "El dataset se generó vacío en el servidor" },
        { status: 500 },
      );
    }

    return new NextResponse(Buffer.from(bodyBytes), {
      headers: {
        "Content-Type": file.contentType,
        "Content-Disposition": `attachment; filename="${file.filename}"`,
        "Content-Length": String(bodyBytes.byteLength),
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al generar el dataset";
    return Response.json({ error: message }, { status: 500 });
  }
}
