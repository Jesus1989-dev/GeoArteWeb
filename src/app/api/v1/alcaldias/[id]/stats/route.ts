import { fetchAlcaldiaStatsV1 } from "@/lib/api-v1/alcaldias-stats";
import { apiV1Error, apiV1Json, withApiV1Auth } from "@/lib/api-v1/route-handler";
import { getApiV1SupabaseClient } from "@/lib/api-v1/supabase-client";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  return withApiV1Auth(request, async () => {
    const { id } = await context.params;
    const client = await getApiV1SupabaseClient();
    const result = await fetchAlcaldiaStatsV1(client, id);

    if (result.error) {
      return apiV1Error(result.error, 404);
    }

    return apiV1Json(result.stats);
  });
}
