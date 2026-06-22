import {
  colaboradores,
  colaboradoresSection,
  datosCrudosCta,
  equipoCore,
  equipoSection,
  fuentesInformacion as fuentesInformacionMock,
  fuentesSection,
  licenciaDatos,
  metodologiaSection,
  objetivosEstrategicos,
  objetivosSection,
  pasosMetodologia,
  sobreElProyectoHero,
} from "@/lib/data/mock/sobre-el-proyecto";
import type { FuenteInformacion } from "@/lib/domain/fuentes-informacion";
import { isSupabaseConfigured } from "@/lib/data/supabase/config";
import { fetchFuentesInformacionFromServer } from "@/lib/data/supabase/fuentes-informacion.repository";

export type SobreElProyectoDataSource = "supabase" | "mock";

export type SobreElProyectoPageData = {
  sobreElProyectoHero: typeof sobreElProyectoHero;
  objetivosSection: typeof objetivosSection;
  objetivosEstrategicos: typeof objetivosEstrategicos;
  metodologiaSection: typeof metodologiaSection;
  pasosMetodologia: typeof pasosMetodologia;
  fuentesSection: typeof fuentesSection;
  fuentesInformacion: FuenteInformacion[];
  datosCrudosCta: typeof datosCrudosCta;
  equipoSection: typeof equipoSection;
  equipoCore: typeof equipoCore;
  colaboradoresSection: typeof colaboradoresSection;
  colaboradores: typeof colaboradores;
  licenciaDatos: typeof licenciaDatos;
  dataSource: SobreElProyectoDataSource;
  dataSourceNote: string;
};

function getMockFuentesInformacion(): FuenteInformacion[] {
  const tipoPorEstado: Record<string, FuenteInformacion["tipoEstado"]> = {
    "Conexión API": "api",
    Estático: "estatico",
    Procesado: "procesado",
  };

  return fuentesInformacionMock.map((row, index) => ({
    id: `mock-fuente-${index + 1}`,
    institucion: row.institucion,
    dataset: row.dataset,
    estado: row.estado,
    tipoEstado: tipoPorEstado[row.estado] ?? "activo",
    urlFuente: null,
    ultimaSincronizacion: null,
  }));
}

function getSobreElProyectoMockData(note?: string): SobreElProyectoPageData {
  return {
    sobreElProyectoHero,
    objetivosSection,
    objetivosEstrategicos,
    metodologiaSection,
    pasosMetodologia,
    fuentesSection,
    fuentesInformacion: getMockFuentesInformacion(),
    datosCrudosCta,
    equipoSection,
    equipoCore,
    colaboradoresSection,
    colaboradores,
    licenciaDatos,
    dataSource: "mock",
    dataSourceNote:
      note ??
      "Fuentes de demostración — configura NEXT_PUBLIC_SUPABASE_* en .env.local",
  };
}

/** Controlador de datos — sobre el proyecto (Supabase o mock en fuentes). */
export async function getSobreElProyectoPageData(): Promise<SobreElProyectoPageData> {
  const base = getSobreElProyectoMockData();

  if (!isSupabaseConfigured()) {
    return base;
  }

  try {
    const fuentes = await fetchFuentesInformacionFromServer();
    if (fuentes.length === 0) {
      return {
        ...base,
        dataSourceNote: "Tabla fuentes_informacion vacía — mostrando datos demo",
      };
    }

    return {
      ...base,
      fuentesInformacion: fuentes,
      dataSource: "supabase",
      dataSourceNote: `${fuentes.length} fuente${fuentes.length === 1 ? "" : "s"} desde fuentes_informacion`,
    };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error al cargar fuentes_informacion";
    console.error("[sobre-el-proyecto] Supabase:", message);
    return {
      ...base,
      dataSourceNote: `Fallback demo (${message})`,
    };
  }
}

export function getSobreElProyectoPageDataMock(): SobreElProyectoPageData {
  return getSobreElProyectoMockData();
}
