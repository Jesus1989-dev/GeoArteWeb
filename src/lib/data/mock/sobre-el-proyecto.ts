export const sobreElProyectoHero = {
  badge: "Fundamentos del Proyecto",
  tituloAntes: "Cartografiando el",
  tituloDestacado: "ADN Cultural",
  tituloDespues: "de la Ciudad de México",
  descripcion:
    "GEO ARTE CDMX es una iniciativa institucional diseñada para democratizar el acceso a la información geoespacial sobre infraestructura cultural, permitiendo a investigadores, ciudadanos y tomadores de decisiones visualizar las brechas y oportunidades en el territorio.",
  btnMapa: "Explorar Mapa",
  btnMapaHref: "/mapa",
  btnMetodologia: "Ver Metodología",
  btnMetodologiaHref: "#metodologia",
} as const;

export const objetivosSection = {
  titulo: "Objetivos Estratégicos",
  subtitulo:
    "Nuestra misión es transformar datos crudos en conocimiento accionable para fortalecer el ecosistema cultural.",
} as const;

export const objetivosEstrategicos = [
  {
    title: "Visibilidad Territorial",
    description:
      "Identificar y georreferenciar todos los espacios culturales, desde grandes museos hasta centros comunitarios locales.",
    icon: "mapPin" as const,
  },
  {
    title: "Análisis de Brechas",
    description:
      "Visualizar áreas con déficit de infraestructura cultural para orientar la inversión pública de manera equitativa.",
    icon: "brecha" as const,
  },
  {
    title: "Datos Abiertos",
    description:
      "Fomentar la transparencia gubernamental mediante la liberación de datasets estructurados y accesibles.",
    icon: "database" as const,
  },
  {
    title: "Impacto en Políticas",
    description:
      "Proveer diagnósticos basados en evidencia para la formulación de nuevas recomendaciones de política pública.",
    icon: "shield" as const,
  },
] as const;

export const metodologiaSection = {
  titulo: "Rigor Metodológico",
  subtitulo:
    "Un proceso iterativo de curaduría de datos y validación geoespacial.",
  intro:
    "El proyecto emplea un marco metodológico mixto que combina el análisis de Big Data con la validación cualitativa en campo, garantizando la precisión y utilidad de cada punto georreferenciado.",
} as const;

export const pasosMetodologia = [
  {
    step: 1,
    title: "Recolección y Armonización",
    text: "Consolidación de fuentes primarias (INEGI, DENUE) y secundarias (16 alcaldías), con estandarización de categorías culturales en un esquema de datos unificado.",
  },
  {
    step: 2,
    title: "Validación Geoespacial",
    text: "Limpieza de coordenadas mediante algoritmos de geocodificación y verificación manual en territorio para asegurar la precisión de cada espacio cultural.",
  },
  {
    step: 3,
    title: "Cálculo de Indicadores de Accesibilidad",
    text: "Aplicación de modelos de isócronas y densidad poblacional para determinar el grado de cobertura artística por demarcación territorial.",
  },
] as const;

export const fuentesSection = {
  titulo: "Fuentes de Información",
} as const;

export const fuentesInformacion = [
  {
    institucion: "INEGI",
    dataset: "DENUE (Servicios Culturales y Deportivos)",
    estado: "Actualizado 2024",
  },
  {
    institucion: "Secretaría de Cultura CDMX",
    dataset: "Cartelera y Directorio de Centros Culturales",
    estado: "Sincronizado",
  },
  {
    institucion: "ADIP CDMX",
    dataset: "Portal de Datos Abiertos - Movilidad y Transporte",
    estado: "Conexión API",
  },
  {
    institucion: "Censo de Población 2020",
    dataset: "Datos Demográficos por Manzana",
    estado: "Estático",
  },
  {
    institucion: "Encuesta de Consumo Cultural",
    dataset: "Preferencias y Hábitos de Participación",
    estado: "Procesado",
  },
] as const;

export const equipoSection = {
  titulo: "Coordinación del proyecto",
  linkEquipo: "Contactar al equipo",
  linkEquipoHref: "/contacto",
} as const;

export const equipoCore = [
  {
    name: "Dra. Valentina Munguía",
    role: "Directora del Proyecto",
    bio: "Especialista en políticas culturales y gestión de datos abiertos gubernamentales.",
    initials: "VM",
  },
  {
    name: "Mtro. Julián Sánchez",
    role: "Líder de Ciencia de Datos",
    bio: "Experto en modelado geoespacial y visualización de grandes volúmenes de información.",
    initials: "JS",
  },
  {
    name: "Lic. Sofía Robles",
    role: "Analista de Políticas",
    bio: "Enlace entre la evidencia territorial y la formulación de recomendaciones públicas.",
    initials: "SR",
  },
] as const;

export const colaboradoresSection = {
  titulo: "Colaboradores",
} as const;

export const colaboradores = [
  { id: "unam", nombre: "UNAM - PUEC", icon: "fingerprint" as const },
  { id: "cultura", nombre: "SEC. CULTURA CDMX", icon: "messages" as const },
  { id: "adip", nombre: "ADIP", icon: "mountain" as const },
  { id: "unesco", nombre: "UNESCO MÉXICO", icon: "globe" as const },
] as const;

export const datosCrudosCta = {
  titulo: "¿Interesado en los datos crudos?",
  descripcion:
    "Nuestra plataforma permite la exportación masiva de información en formatos abiertos para que investigadores de todo el mundo puedan continuar el análisis.",
  btnApi: "Documentación API",
  btnApiHref: "/contacto#api",
  btnRepositorio: "Ver Repositorio",
  btnRepositorioHref: "/investigacion",
} as const;

export const licenciaDatos = {
  titulo: "Licencia de Datos",
  descripcion:
    "Todo el contenido publicado en esta plataforma está protegido bajo la licencia Creative Commons Atribución 4.0 Internacional (CC BY 4.0), permitiendo su uso con la debida mención.",
  btnAtribucion: "Descargar Guía de Atribución",
  btnAtribucionHref: "/contacto#datasets",
  btnTerminos: "Consultar Términos Legales",
  btnTerminosHref: "/contacto",
} as const;
