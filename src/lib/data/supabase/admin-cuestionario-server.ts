import { getSupabaseServiceRoleClient } from "@/lib/data/supabase/service-role";
import {
  fetchAdminCuestionarioRowsWithClient,
  upsertCuestionarioRevisionWithClient,
} from "@/lib/data/supabase/cuestionario.repository";
import type {
  CuestionarioAdminRow,
  CuestionarioEstatusRevision,
} from "@/lib/domain/cuestionario";

export async function fetchAdminCuestionarioServer(
  periodo: string,
): Promise<CuestionarioAdminRow[]> {
  const admin = getSupabaseServiceRoleClient();
  if (!admin) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY no configurada");
  }
  return fetchAdminCuestionarioRowsWithClient(admin, periodo);
}

export async function updateCuestionarioRevisionAdmin(
  periodo: string,
  respuestaId: string,
  input: {
    estatus: CuestionarioEstatusRevision;
    notas?: string | null;
    revisadoPor: string;
  },
): Promise<CuestionarioAdminRow | null> {
  const admin = getSupabaseServiceRoleClient();
  if (!admin) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY no configurada");
  }
  await upsertCuestionarioRevisionWithClient(admin, {
    respuestaId,
    estatus: input.estatus,
    notas: input.notas,
    revisadoPor: input.revisadoPor,
  });
  const rows = await fetchAdminCuestionarioRowsWithClient(admin, periodo);
  return rows.find((r) => r.id === respuestaId) ?? null;
}
