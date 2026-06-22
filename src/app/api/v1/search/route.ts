import { fetchSearchV1 } from "@/lib/api-v1/search";
import { apiV1Error, apiV1Json, withApiV1Auth } from "@/lib/api-v1/route-handler";
import { getApiV1SupabaseClient } from "@/lib/api-v1/supabase-client";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return withApiV1Auth(request, async () => {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") ?? searchParams.get("q") ?? "";

    if (query.trim().length < 2) {
      return apiV1Error('Parámetro "query" requerido (mínimo 2 caracteres)', 400);
    }

    const client = await getApiV1SupabaseClient();
    const payload = await fetchSearchV1(client, query);
    return apiV1Json(payload);
  });
}
