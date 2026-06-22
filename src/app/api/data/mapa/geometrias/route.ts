import { NextResponse } from "next/server";
import { fetchTerritorioGeometriasServer } from "@/lib/data/supabase/mapa-geometrias.repository.server";

export const revalidate = 60;

/** Geometrías territoriales (alcaldías / macrozonas) para el mapa. */
export async function GET() {
  const geometrias = await fetchTerritorioGeometriasServer();
  return NextResponse.json(geometrias);
}
