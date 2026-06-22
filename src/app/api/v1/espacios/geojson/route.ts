import { fetchEspaciosGeoJsonV1 } from "@/lib/api-v1/espacios-geojson";
import { apiV1Json, withApiV1Auth } from "@/lib/api-v1/route-handler";
import { getApiV1SupabaseClient } from "@/lib/api-v1/supabase-client";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return withApiV1Auth(request, async () => {
    const client = await getApiV1SupabaseClient();
    const geojson = await fetchEspaciosGeoJsonV1(client);
    return apiV1Json(geojson);
  });
}
