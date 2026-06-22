import { buildInvestigacionKpis } from "@/lib/investigacion/assemble-investigacion-page";
import type { RecursoCualitativo } from "@/lib/domain/investigacion";

const MOCK_RECURSOS: RecursoCualitativo[] = [
  {
    id: "c1",
    tipo: "Entrevista",
    fecha: "12 may 2024",
    titulo: "Entrevista: gestor cultural — Iztapalapa",
    alcaldia: "Iztapalapa",
    snippet:
      "Recuperación de espacios públicos a través del arte urbano y la participación vecinal…",
    verificado: true,
    digitalizado: true,
    investigador: "María González",
    fechaDetalle: "12 may 2024 · 47 min",
    resumen:
      "La entrevista documenta estrategias de recuperación de espacios públicos mediante murales y talleres comunitarios, con énfasis en la coordinación con la alcaldía y presupuestos participativos.",
    transcripcion: [
      {
        rol: "Investigador",
        texto:
          "¿Cómo describirías el cambio en el uso del parque después del proyecto de arte urbano?",
      },
      {
        rol: "Informante",
        texto:
          "Antes era un pasillo; ahora hay actividades los fines de semana y las familias se quedan más tiempo. Lo que más ayudó fue que la comunidad pintara junta con los artistas.",
      },
      {
        rol: "Investigador",
        texto:
          "¿Qué obstáculos siguen presentes desde tu punto de vista operativo?",
      },
      {
        rol: "Informante",
        texto:
          "El mantenimiento y la seguridad nocturna; necesitamos convenios claros con la autoridad.",
      },
    ],
    lat: 19.3574,
    lng: -99.0671,
  },
  {
    id: "c2",
    tipo: "Encuesta",
    fecha: "03 abr 2024",
    titulo: "Encuesta de percepción cultural — Benito Juárez",
    alcaldia: "Benito Juárez",
    snippet:
      "Muestra de 400 hogares sobre frecuencia de asistencia a eventos gratuitos…",
    verificado: true,
    digitalizado: true,
    investigador: "Carlos Méndez",
    fechaDetalle: "03 abr 2024 · instrumento",
    resumen:
      "El 62% de los hogares encuestados asiste al menos una vez al mes a actividades culturales gratuitas; la barrera principal es horario y transporte.",
    transcripcion: [
      {
        rol: "Investigador",
        texto:
          "¿Con qué frecuencia asiste a eventos culturales gratuitos en su alcaldía?",
      },
      {
        rol: "Informante",
        texto:
          "Una o dos veces al mes, sobre todo ferias de libro y conciertos en parques.",
      },
    ],
    lat: 19.372,
    lng: -99.159,
  },
  {
    id: "c3",
    tipo: "Grupo focal",
    fecha: "22 mar 2024",
    titulo: "Grupo focal: juventudes y música",
    alcaldia: "Coyoacán",
    snippet:
      "Tres sesiones con jóvenes de 18 a 25 años en torno a acceso a salas de ensayo…",
    verificado: false,
    digitalizado: true,
    investigador: "Ana Ruiz",
    fechaDetalle: "22 mar 2024 · 3 sesiones",
    resumen:
      "Las y los participantes señalan escasez de salas de ensayo accesibles y costos elevados de alquiler como principal freno a proyectos musicales comunitarios.",
    transcripcion: [
      {
        rol: "Investigador",
        texto:
          "¿Qué necesitarían para sostener un colectivo musical en el barrio?",
      },
      {
        rol: "Informante",
        texto:
          "Un espacio con horario fijo y equipo básico; muchos ensayamos en garages por falta de opciones.",
      },
    ],
    lat: 19.3467,
    lng: -99.1618,
  },
  {
    id: "c4",
    tipo: "Entrevista",
    fecha: "15 feb 2024",
    titulo: "Entrevista: directora de museo comunitario",
    alcaldia: "Tláhuac",
    snippet:
      "Sostenibilidad financiera y relación con la alcaldía en proyectos de largo plazo…",
    verificado: true,
    digitalizado: false,
    investigador: "Luis Herrera",
    fechaDetalle: "15 feb 2024 · 38 min",
    resumen:
      "La entrevista aborda modelos híbridos de financiamiento (donaciones, talleres pagados y apoyos municipales) para museos comunitarios de mediano plazo.",
    transcripcion: [
      {
        rol: "Investigador",
        texto:
          "¿Cómo equilibran autonomía curatorial y requisitos del programa municipal?",
      },
      {
        rol: "Informante",
        texto:
          "Documentamos todo con indicadores claros; eso nos da libertad para proponer exposiciones temporales.",
      },
    ],
    lat: 19.283,
    lng: -99.005,
  },
  {
    id: "c5",
    tipo: "Encuesta",
    fecha: "08 ene 2024",
    titulo: "Encuesta rápida — Faros culturales",
    alcaldia: "Varias",
    snippet:
      "Instrumento corto aplicado en 12 faros; resultados consolidados por zona…",
    verificado: false,
    digitalizado: true,
    investigador: "Equipo Faros",
    fechaDetalle: "08 ene 2024 · 12 sedes",
    resumen:
      "Consolidado de percepción de programación en faros: alta valoración de talleres familiares y demanda de horarios vespertinos en zona oriente.",
    transcripcion: [
      {
        rol: "Investigador",
        texto: "¿Qué actividad del faro le resultó más útil en el último año?",
      },
      {
        rol: "Informante",
        texto:
          "Los talleres para niñas y niños los sábados; nos gustaría que extendieran el horario hasta la noche.",
      },
    ],
    lat: null,
    lng: null,
  },
];

export function getMockRecursosCualitativos(): RecursoCualitativo[] {
  return MOCK_RECURSOS.map((r) => ({
    ...r,
    transcripcion: r.transcripcion.map((b) => ({ ...b })),
  }));
}

export function getMockInvestigacionPagePayload() {
  const recursosCualitativos = getMockRecursosCualitativos();
  return {
    investigacionKpis: buildInvestigacionKpis(recursosCualitativos),
    recursosCualitativos,
  };
}

/** @deprecated Usar getMockRecursosCualitativos */
export const recursosCualitativos = MOCK_RECURSOS;

/** @deprecated KPIs calculados en servicio */
export const investigacionKpis = buildInvestigacionKpis(MOCK_RECURSOS);

export function getDetalleRecurso(id: string) {
  const r = MOCK_RECURSOS.find((x) => x.id === id);
  if (!r) {
    return {
      titulo: "Recurso",
      verificado: false,
      investigador: "Equipo investigación",
      fechaDetalle: "",
      resumen:
        "Resumen en elaboración. Este recurso forma parte del repositorio cualitativo de GEO ARTE CDMX.",
      transcripcion: [
        {
          rol: "Investigador" as const,
          texto: "Fragmento de transcripción disponible tras validación.",
        },
      ],
    };
  }
  return {
    titulo: r.titulo,
    verificado: r.verificado,
    investigador: r.investigador,
    fechaDetalle: r.fechaDetalle,
    resumen: r.resumen,
    transcripcion: r.transcripcion,
  };
}
