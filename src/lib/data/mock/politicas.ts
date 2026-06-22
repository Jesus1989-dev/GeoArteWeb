import type {
  AccionEstrategica,
  BrechaInversionAlcaldiaRow,
  EvidenciaDiagnosticoContenido,
  FiltroObjetivo,
  FiltroObjetivoId,
  PoliticasCta,
  PoliticasHero,
  PoliticasHeroStat,
  SeccionRecomendaciones,
} from "@/lib/domain/politicas";

export type {
  AccionEstrategica,
  FiltroObjetivoId,
  PrioridadAccion,
  SeccionRecomendaciones,
} from "@/lib/domain/politicas";

export const politicasHero: PoliticasHero = {
  badge: "Fase de Implementación 2024-2025",
  tituloLinea1: "Recomendaciones de",
  tituloLinea2: "Política Pública",
  descripcion:
    "Diagnósticos basados en datos georreferenciados para orientar la inversión cultural hacia las zonas con mayor rezago social y brechas de género en la Ciudad de México.",
};

export const politicasHeroStats: PoliticasHeroStat[] = [
  {
    icon: "zap",
    value: "24",
    label: "Intervenciones",
    sublabel: "Planificadas",
  },
  {
    icon: "users",
    value: "+150k",
    label: "Impacto social",
    sublabel: "Ciudadanos",
  },
  {
    icon: "dollar",
    value: "45M",
    label: "Presupuesto",
    sublabel: "MXN Estimado",
  },
  {
    icon: "mapPin",
    value: "16",
    label: "Municipios",
    sublabel: "CDMX",
  },
];

export const evidenciaDiagnosticoContenido: EvidenciaDiagnosticoContenido = {
  titulo: "Evidencia del Diagnóstico",
  parrafo:
    "El análisis espacial revela una correlación directa entre el déficit de infraestructura cultural y el nivel socioeconómico. Las recomendaciones priorizan las zonas con déficit superior al 70%.",
  highlight: "déficit superior al 70%",
  meta2025:
    "Reducir en un 15% la brecha de acceso en alcaldías del oriente.",
  urgencia:
    "4 alcaldías requieren intervención inmediata por falta de espacios juveniles.",
};

export const brechaInversionAlcaldias: BrechaInversionAlcaldiaRow[] = [
  { alcaldia: "Iztapalapa", deficit: 92, presupuesto: 28 },
  { alcaldia: "G.A.M.", deficit: 78, presupuesto: 35 },
  { alcaldia: "Tláhuac", deficit: 85, presupuesto: 22 },
  { alcaldia: "Milpa Alta", deficit: 88, presupuesto: 18 },
  { alcaldia: "Á. Obregón", deficit: 52, presupuesto: 42 },
];

export const filtrosObjetivo: FiltroObjetivo[] = [
  { id: "todos", label: "Todos" },
  { id: "genero", label: "Cerrar brecha de género" },
  { id: "periferias", label: "Infraestructura en Periferias" },
  { id: "digitalizacion", label: "Digitalización" },
  { id: "economia", label: "Economía Creativa" },
];

export const recomendacionesPorObjetivo: SeccionRecomendaciones[] = [
  {
    id: "genero",
    titulo: "Cerrar brecha de género",
    icon: "zap",
    subtitulo:
      "Acciones focalizadas para el cumplimiento del pilar estratégico de cerrar brecha de género.",
    acciones: [
      {
        id: "g1",
        titulo: "Centros de Producción Audiovisual Feminista",
        prioridad: "Prioridad Alta",
        costoNivel: 2,
        alcaldia: "Iztapalapa",
        descripcion:
          "Instalación de laboratorios de edición y producción exclusivos para mujeres en Iztapalapa y Gustavo A. Madero.",
        impacto: "+25% participación profesional",
        impactoCiudadanos: 28_500,
        presupuestoMxn: 9_000_000,
      },
      {
        id: "g2",
        titulo: "Becas de Formación en Gestión Cultural",
        prioridad: "Prioridad Media",
        costoNivel: 1,
        alcaldia: "Álvaro Obregón",
        descripcion:
          "Programa de formación para mujeres líderes de centros comunitarios en gestión y procuración de fondos.",
        impacto: "60 nuevas gestoras certificadas",
        impactoCiudadanos: 6_000,
        presupuestoMxn: 4_500_000,
      },
    ],
  },
  {
    id: "periferias",
    titulo: "Infraestructura en Periferias",
    icon: "mapPin",
    subtitulo:
      "Acciones focalizadas para el cumplimiento del pilar estratégico de infraestructura en periferias.",
    acciones: [
      {
        id: "p1",
        titulo: "Corredores Culturales Itinerantes",
        prioridad: "Prioridad Alta",
        costoNivel: 1,
        alcaldia: "Milpa Alta",
        descripcion:
          "Módulos móviles de exhibición artística para zonas de baja densidad de museos en Milpa Alta y Tláhuac.",
        impacto: "Acceso a 45,000 nuevos usuarios",
        impactoCiudadanos: 45_000,
        presupuestoMxn: 4_500_000,
      },
      {
        id: "p2",
        titulo: "Rehabilitación de Plazas Públicas para Cine",
        prioridad: "Prioridad Baja",
        costoNivel: 2,
        alcaldia: "Tlalpan",
        descripcion:
          "Equipamiento de plazas públicas con sistemas de proyección solar para funciones nocturnas permanentes.",
        impacto: "Mejora de seguridad ciudadana",
        impactoCiudadanos: 22_000,
        presupuestoMxn: 9_000_000,
      },
    ],
  },
  {
    id: "digitalizacion",
    titulo: "Digitalización",
    icon: "zap",
    subtitulo:
      "Acciones focalizadas para el cumplimiento del pilar estratégico de digitalización.",
    acciones: [
      {
        id: "d1",
        titulo: "Red de Bibliotecas Digitales de Barrio",
        prioridad: "Prioridad Media",
        costoNivel: 2,
        alcaldia: "Xochimilco",
        descripcion:
          "Actualización tecnológica de bibliotecas comunitarias con acceso a repositorios digitales de arte internacional.",
        impacto: "Cierre de brecha digital en 12%",
        impactoCiudadanos: 31_200,
        presupuestoMxn: 9_000_000,
      },
    ],
  },
  {
    id: "economia",
    titulo: "Economía Creativa",
    icon: "zap",
    subtitulo:
      "Acciones focalizadas para el cumplimiento del pilar estratégico de economía creativa.",
    acciones: [
      {
        id: "e1",
        titulo: "Subsidio a Micro-Emprendimientos de Artesanía",
        prioridad: "Prioridad Alta",
        costoNivel: 3,
        alcaldia: "Cuauhtémoc",
        descripcion:
          "Programa de créditos a tasa cero para artesanos tradicionales para la exportación y venta online.",
        impacto: "+40% ingresos locales",
        impactoCiudadanos: 18_500,
        presupuestoMxn: 13_500_000,
      },
    ],
  },
];

export const politicasCta: PoliticasCta = {
  titulo: "¿Necesitas una propuesta personalizada?",
  descripcion:
    "Utiliza nuestro generador de reportes basado en alcaldías para obtener un diagnóstico específico de tu demarcación y las intervenciones recomendadas por nuestro equipo de expertos.",
  boton: "Generar Reporte por Alcaldía",
  href: "/reportes?plantilla=p1",
};
