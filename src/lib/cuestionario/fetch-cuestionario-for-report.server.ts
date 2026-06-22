import { createSupabaseServerClient } from "@/lib/data/supabase/server";
import {
  fetchInstitutionalRowsWithClient,
  fetchResumenCuestionarioWithClient,
} from "@/lib/data/supabase/cuestionario.repository";
import type { CuestionarioExportInput } from "@/lib/cuestionario/export-cuestionario";
import { periodoSemestralActual } from "@/lib/cuestionario/cuestionario-periodo";

export async function fetchCuestionarioForReportServer(
  alcaldiaFiltro?: string,
): Promise<CuestionarioExportInput | null> {
  try {
    const client = await createSupabaseServerClient();
    const periodo = periodoSemestralActual();
    const alcaldia =
      alcaldiaFiltro && alcaldiaFiltro !== "Todas" ? alcaldiaFiltro : undefined;

    const [resumenAlcaldia, detalleInstitucional] = await Promise.all([
      fetchResumenCuestionarioWithClient(client, periodo),
      fetchInstitutionalRowsWithClient(client, { periodo, alcaldiaNombre: alcaldia }),
    ]);

    if (resumenAlcaldia.length === 0 && detalleInstitucional.length === 0) {
      return null;
    }

    return { periodo, resumenAlcaldia, detalleInstitucional };
  } catch (err) {
    console.warn("[reportes] cuestionario:", err);
    return null;
  }
}
