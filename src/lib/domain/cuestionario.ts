/** Fila de `v_cuestionario_resumen_alcaldia`. */
export type CuestionarioResumenAlcaldia = {
  periodo: string;
  alcaldiaId: string | null;
  alcaldiaNombre: string;
  respuestasCapturadas: number;
  espaciosConRespuesta: number;
  totalUsuariosInscritos: number;
  aforoInstaladoTotal: number;
  empleoRemuneradoTotal: number;
  conveniosReportados: number;
  pctMujeresPromedio: number | null;
  espaciosPerfilJovenes: number;
  espaciosGratuitos: number;
};

/** Fila de detalle (`respuestas_cuestionario` + espacio). */
export type CuestionarioDetalleEspacio = {
  id: string;
  periodo: string;
  espacioId: string;
  espacioNombre: string;
  espacioAlcaldia: string;
  aforo: number | null;
  costo: string | null;
  costoEtiqueta: string;
  usuarios: number | null;
  pctMujeres: string | null;
  pctMujeresEtiqueta: string;
  rangoEdad: string | null;
  rangoEdadEtiqueta: string;
  tiempoViaje: string | null;
  tiempoViajeEtiqueta: string;
  personal: number | null;
  convenios: number | null;
  actualizadoEl: string | null;
};

export type CuestionarioKpi = {
  label: string;
  value: string;
  hint: string;
};

export type CuestionarioEstatusRevision = "pendiente" | "revisado" | "observado";

export type CuestionarioAdminRow = CuestionarioDetalleEspacio & {
  capturadoPor: string | null;
  estatusRevision: CuestionarioEstatusRevision;
  notasRevision: string | null;
  revisadoEl: string | null;
};

const COSTO_LABELS: Record<string, string> = {
  gratuito: "Gratuito",
  cuota: "Cuota $1–$200",
  bajo: "$201–$500",
  medio: "$501–$1,000",
  alto: "Más de $1,000",
};

const PCT_MUJERES_LABELS: Record<string, string> = {
  "0_25": "0–25%",
  "26_50": "26–50%",
  "51_75": "51–75%",
  "76_100": "76–100%",
};

const RANGO_EDAD_LABELS: Record<string, string> = {
  infantes: "0–12",
  jovenes: "13–29",
  adultos: "30–64",
  adultos_mayores: "65+",
};

const TIEMPO_VIAJE_LABELS: Record<string, string> = {
  menos_15: "Menos de 15 min",
  "15_30": "15–30 min",
  "31_60": "31–60 min",
  mas_60: "Más de 1 h",
};

export function etiquetaCostoCuestionario(valor: string | null): string {
  if (!valor) return "—";
  return COSTO_LABELS[valor] ?? valor;
}

export function etiquetaPctMujeresCuestionario(valor: string | null): string {
  if (!valor) return "—";
  return PCT_MUJERES_LABELS[valor] ?? valor;
}

export function etiquetaRangoEdadCuestionario(valor: string | null): string {
  if (!valor) return "—";
  return RANGO_EDAD_LABELS[valor] ?? valor;
}

export function etiquetaTiempoViajeCuestionario(valor: string | null): string {
  if (!valor) return "—";
  return TIEMPO_VIAJE_LABELS[valor] ?? valor;
}

export function buildCuestionarioKpis(
  resumen: CuestionarioResumenAlcaldia[],
): CuestionarioKpi[] {
  const respuestas = resumen.reduce((s, r) => s + r.respuestasCapturadas, 0);
  const espacios = resumen.reduce((s, r) => s + r.espaciosConRespuesta, 0);
  const usuarios = resumen.reduce((s, r) => s + r.totalUsuariosInscritos, 0);
  const empleo = resumen.reduce((s, r) => s + r.empleoRemuneradoTotal, 0);

  return [
    {
      label: "Respuestas capturadas",
      value: respuestas.toLocaleString("es-MX"),
      hint: "Cuestionarios completos en el periodo",
    },
    {
      label: "Espacios con respuesta",
      value: espacios.toLocaleString("es-MX"),
      hint: "Espacios culturales distintos",
    },
    {
      label: "Usuarios inscritos",
      value: usuarios.toLocaleString("es-MX"),
      hint: "Suma P4 del periodo",
    },
    {
      label: "Empleo reportado",
      value: empleo.toLocaleString("es-MX"),
      hint: "Personal remunerado (P10)",
    },
  ];
}
