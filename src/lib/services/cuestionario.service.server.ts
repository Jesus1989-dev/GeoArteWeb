import { fetchCuestionarioPayloadServer } from "@/lib/data/supabase/cuestionario.repository.server";
import { isSupabaseConfigured } from "@/lib/data/supabase/config";
import { etiquetaPeriodoSemestral } from "@/lib/cuestionario/cuestionario-periodo";
import {
  getCuestionarioMockData,
  type CuestionarioPageData,
} from "@/lib/services/cuestionario.service";
import { withTimeout } from "@/lib/utils/with-timeout";

const LOAD_TIMEOUT_MS = 20_000;

export async function getCuestionarioDataServer(options?: {
  periodo?: string;
  alcaldia?: string;
}): Promise<CuestionarioPageData> {
  if (!isSupabaseConfigured()) {
    return getCuestionarioMockData(options?.periodo);
  }

  try {
    const payload = await withTimeout(
      fetchCuestionarioPayloadServer(options),
      LOAD_TIMEOUT_MS,
      "Cuestionario",
    );

    return {
      periodo: payload.periodo,
      periodoEtiqueta: etiquetaPeriodoSemestral(payload.periodo),
      periodoOpciones: payload.periodoOpciones,
      alcaldiaFiltro: options?.alcaldia?.trim() || "Todas",
      alcaldiaOpciones: payload.alcaldiaOpciones,
      resumenAlcaldia: payload.resumenAlcaldia,
      detalleEspacios: payload.detalleEspacios,
      kpis: payload.kpis,
      totalDetalle: payload.totalDetalle,
      dataSource: "supabase",
      dataSourceNote: `Cuestionario SECTEI · ${payload.totalDetalle} espacio(s) en ${etiquetaPeriodoSemestral(payload.periodo)} · sincronizado con app móvil`,
    };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error al cargar cuestionario";
    console.error("[cuestionario] Supabase (server):", message);
    return {
      ...getCuestionarioMockData(options?.periodo),
      dataSourceNote: `Fallback demo (${message})`,
    };
  }
}
