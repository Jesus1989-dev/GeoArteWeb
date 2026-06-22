import { createSupabaseServerClient } from "@/lib/data/supabase/server";
import {
  fetchCuestionarioPayloadWithClient,
  type CuestionarioSupabasePayload,
} from "@/lib/data/supabase/cuestionario.repository";

export async function fetchCuestionarioPayloadServer(options?: {
  periodo?: string;
  alcaldia?: string;
}): Promise<CuestionarioSupabasePayload> {
  const client = await createSupabaseServerClient();
  return fetchCuestionarioPayloadWithClient(client, options);
}
