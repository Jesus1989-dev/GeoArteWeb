import {
  etiquetaCostoCuestionario,
  etiquetaPctMujeresCuestionario,
  etiquetaRangoEdadCuestionario,
  etiquetaTiempoViajeCuestionario,
} from "@/lib/domain/cuestionario";

export const ENCABEZADOS_CUESTIONARIO_INSTITUCIONAL = [
  "nombre_espacio",
  "alcaldia",
  "disciplinas(arte y humanidades)",
  "aforo(total)",
  "costo_promedio(mensual)",
  "total(usuarios)",
  "porcentaje(mujeres)",
  "rango(edad)",
  "grupos(vulnerabilidad)",
  "barrera(principal)",
  "tiempo(traslado)",
  "laboran(personas)",
  "numero(convenios)",
] as const;

const DISCIPLINA_LABELS: Record<string, string> = {
  artes_visuales: "Artes visuales",
  musica: "Música",
  danza: "Danza",
  teatro: "Teatro",
  literatura: "Literatura",
  cine_video: "Cine/Video",
  patrimonio_historia: "Patrimonio/Historia",
  gastronomia_cultural: "Gastronomía cultural",
  otras: "Otras",
};

const VULNERABILIDAD_LABELS: Record<string, string> = {
  discapacidad: "Personas con discapacidad",
  indigena: "Población indígena",
  migrantes: "Migrantes",
  situacion_calle: "Personas en situación de calle",
  ninguno: "Ninguno",
};

const BARRERA_LABELS: Record<string, string> = {
  inseguridad: "Inseguridad en la zona",
  falta_transporte: "Falta de transporte público",
  costos: "Costos",
  horarios: "Horarios laborales/escolares",
  falta_interes: "Falta de interés",
};

export type CuestionarioInstitutionalRow = {
  espacioNombre: string;
  alcaldia: string;
  disciplinas: string;
  aforo: string;
  costo: string;
  usuarios: string;
  pctMujeres: string;
  rangoEdad: string;
  vulnerabilidad: string;
  barreraPrincipal: string;
  tiempoTraslado: string;
  personal: string;
  convenios: string;
};

function joinLabels(values: string[], map: Record<string, string>): string {
  return values
    .map((v) => map[v] ?? v)
    .filter(Boolean)
    .join(", ");
}

function barreraPrincipal(
  barreras: Array<{ barrera: string; valor: number }>,
): string {
  if (barreras.length === 0) return "";
  let top = barreras[0];
  for (const b of barreras.slice(1)) {
    if (b.valor > top.valor) top = b;
  }
  return BARRERA_LABELS[top.barrera] ?? top.barrera;
}

export function filaInstitucionalFromRaw(input: {
  espacioNombre: string;
  espacioAlcaldia: string;
  p2Aforo: number | null;
  p3Costo: string | null;
  p4Usuarios: number | null;
  p5PctMujeres: string | null;
  p6RangoEdad: string | null;
  p9TiempoViaje: string | null;
  p10Personal: number | null;
  p11Convenios: number | null;
  p1Disciplinas: string[];
  p7Vulnerabilidad: string[];
  p8Barreras: Array<{ barrera: string; valor: number }>;
}): CuestionarioInstitutionalRow {
  return {
    espacioNombre: input.espacioNombre,
    alcaldia: input.espacioAlcaldia,
    disciplinas: joinLabels(input.p1Disciplinas, DISCIPLINA_LABELS),
    aforo: input.p2Aforo?.toString() ?? "",
    costo: etiquetaCostoCuestionario(input.p3Costo),
    usuarios: input.p4Usuarios?.toString() ?? "",
    pctMujeres: etiquetaPctMujeresCuestionario(input.p5PctMujeres),
    rangoEdad: etiquetaRangoEdadCuestionario(input.p6RangoEdad),
    vulnerabilidad: joinLabels(input.p7Vulnerabilidad, VULNERABILIDAD_LABELS),
    barreraPrincipal: barreraPrincipal(input.p8Barreras),
    tiempoTraslado: etiquetaTiempoViajeCuestionario(input.p9TiempoViaje),
    personal: input.p10Personal?.toString() ?? "",
    convenios: input.p11Convenios?.toString() ?? "",
  };
}

export function filaInstitucionalToArray(row: CuestionarioInstitutionalRow): string[] {
  return [
    row.espacioNombre,
    row.alcaldia,
    row.disciplinas,
    row.aforo,
    row.costo,
    row.usuarios,
    row.pctMujeres,
    row.rangoEdad,
    row.vulnerabilidad,
    row.barreraPrincipal,
    row.tiempoTraslado,
    row.personal,
    row.convenios,
  ];
}
