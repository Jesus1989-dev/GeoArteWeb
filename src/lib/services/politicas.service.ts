import {
  brechaInversionAlcaldias,
  evidenciaDiagnosticoContenido,
  filtrosObjetivo,
  politicasCta,
  politicasHero,
  politicasHeroStats,
  recomendacionesPorObjetivo,
} from "@/lib/data/mock/politicas";
import { isSupabaseConfigured } from "@/lib/data/supabase/config";
import { fetchPoliticasFromSupabase } from "@/lib/data/supabase/politicas.repository";
import type {
  BrechaInversionAlcaldiaRow,
  EvidenciaDiagnosticoContenido,
  FiltroObjetivo,
  PoliticasCta,
  PoliticasDataSource,
  PoliticasHero,
  PoliticasHeroStat,
  SeccionRecomendaciones,
} from "@/lib/domain/politicas";
import { withTimeout } from "@/lib/utils/with-timeout";

const SUPABASE_LOAD_TIMEOUT_MS = 25_000;

export type PoliticasPageData = {
  politicasHero: PoliticasHero;
  politicasHeroStats: PoliticasHeroStat[];
  evidenciaDiagnosticoContenido: EvidenciaDiagnosticoContenido;
  brechaInversionAlcaldias: BrechaInversionAlcaldiaRow[];
  filtrosObjetivo: FiltroObjetivo[];
  recomendacionesPorObjetivo: SeccionRecomendaciones[];
  politicasCta: PoliticasCta;
  dataSource: PoliticasDataSource;
  dataSourceNote: string;
  anioCorte: number;
};

function getPoliticasMockData(): PoliticasPageData {
  const anioCorte = new Date().getFullYear();
  return {
    politicasHero: { ...politicasHero },
    politicasHeroStats: politicasHeroStats.map((s) => ({ ...s })),
    evidenciaDiagnosticoContenido: { ...evidenciaDiagnosticoContenido },
    brechaInversionAlcaldias: brechaInversionAlcaldias.map((r) => ({ ...r })),
    filtrosObjetivo: filtrosObjetivo.map((f) => ({ ...f })),
    recomendacionesPorObjetivo: recomendacionesPorObjetivo.map((s) => ({
      ...s,
      acciones: s.acciones.map((a) => ({ ...a })),
    })),
    politicasCta: { ...politicasCta },
    dataSource: "mock",
    dataSourceNote:
      "Datos de demostración — configura NEXT_PUBLIC_SUPABASE_* y aplica la migración politicas_recomendaciones",
    anioCorte,
  };
}

/** Controlador de datos — políticas (Supabase o mock). */
export async function getPoliticasPageData(): Promise<PoliticasPageData> {
  if (!isSupabaseConfigured()) {
    return getPoliticasMockData();
  }

  try {
    const payload = await withTimeout(
      fetchPoliticasFromSupabase(),
      SUPABASE_LOAD_TIMEOUT_MS,
      "Políticas",
    );

    return {
      politicasHero: payload.politicasHero,
      politicasHeroStats: payload.politicasHeroStats,
      evidenciaDiagnosticoContenido: payload.evidenciaDiagnosticoContenido,
      brechaInversionAlcaldias: payload.brechaInversionAlcaldias,
      filtrosObjetivo: payload.filtrosObjetivo,
      recomendacionesPorObjetivo: payload.recomendacionesPorObjetivo,
      politicasCta: payload.politicasCta,
      dataSource: "supabase",
      dataSourceNote: `Recomendaciones y métricas SECTEI · corte ${payload.anioCorte}`,
      anioCorte: payload.anioCorte,
    };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error desconocido al cargar políticas";
    console.error("[politicas] Supabase:", message);
    return {
      ...getPoliticasMockData(),
      dataSource: "mock",
      dataSourceNote: `Fallback demo (${message})`,
    };
  }
}

/** Datos mock síncronos (tests). */
export function getPoliticasPageDataMock(): PoliticasPageData {
  return getPoliticasMockData();
}
