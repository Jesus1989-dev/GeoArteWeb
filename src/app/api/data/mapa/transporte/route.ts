import { NextResponse } from "next/server";
import { fetchTransporteCapaServer } from "@/lib/data/supabase/mapa-transporte.repository.server";

export const revalidate = 60;

/** Capa de transporte masivo para el mapa (GeoJSON detallado). */
export async function GET() {
  const transporte = await fetchTransporteCapaServer();
  return NextResponse.json(transporte);
}
