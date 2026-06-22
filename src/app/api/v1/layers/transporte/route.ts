import { buildTransporteGeoJsonV1 } from "@/lib/api-v1/transporte-geojson";
import { apiV1Json, withApiV1Auth } from "@/lib/api-v1/route-handler";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return withApiV1Auth(request, async () => {
    return apiV1Json(await buildTransporteGeoJsonV1());
  });
}
