import type {
  CuestionarioDetalleEspacio,
  CuestionarioKpi,
  CuestionarioResumenAlcaldia,
} from "@/lib/domain/cuestionario";
import {
  etiquetaPeriodoSemestral,
  periodoSemestralActual,
  periodosSemestralesRecientes,
} from "@/lib/cuestionario/cuestionario-periodo";

export type CuestionarioDataSource = "supabase" | "mock";

export type CuestionarioPageData = {
  periodo: string;
  periodoEtiqueta: string;
  periodoOpciones: string[];
  alcaldiaFiltro: string;
  alcaldiaOpciones: string[];
  resumenAlcaldia: CuestionarioResumenAlcaldia[];
  detalleEspacios: CuestionarioDetalleEspacio[];
  kpis: CuestionarioKpi[];
  totalDetalle: number;
  dataSource: CuestionarioDataSource;
  dataSourceNote: string;
};

export function getCuestionarioMockData(
  periodo = periodoSemestralActual(),
): CuestionarioPageData {
  return {
    periodo,
    periodoEtiqueta: etiquetaPeriodoSemestral(periodo),
    periodoOpciones: periodosSemestralesRecientes(),
    alcaldiaFiltro: "Todas",
    alcaldiaOpciones: ["Todas"],
    resumenAlcaldia: [],
    detalleEspacios: [],
    kpis: [
      { label: "Respuestas capturadas", value: "0", hint: "Sin datos demo" },
      { label: "Espacios con respuesta", value: "0", hint: "Conecta Supabase" },
      { label: "Usuarios inscritos", value: "0", hint: "Captura desde móvil" },
      { label: "Empleo reportado", value: "0", hint: "P10 agregado" },
    ],
    totalDetalle: 0,
    dataSource: "mock",
    dataSourceNote:
      "Modo demo — configura NEXT_PUBLIC_SUPABASE_URL para ver respuestas reales capturadas en la app móvil.",
  };
}
