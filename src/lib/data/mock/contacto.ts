export const contactoHero = {
  breadcrumbInicio: "Inicio",
  breadcrumbActual: "Contacto y documentación",
  titulo: "Recursos y Soporte",
  subtitulo:
    "Acceda a la infraestructura de datos abiertos de la Ciudad de México y resuelva sus dudas sobre el proyecto GEO ARTE.",
} as const;

export const contactoBuzon = {
  badge: "Institucional",
  titulo: "Buzón de Consultas",
  descripcion:
    "Para solicitudes de datos específicos, convenios de investigación o soporte técnico.",
  btnEnviar: "Enviar Mensaje",
  campos: {
    nombre: { label: "Nombre completo", placeholder: "Ej. Juan Pérez" },
    email: { label: "Correo electrónico", placeholder: "juan@ejemplo.com" },
    asunto: { label: "Asunto", placeholder: "Tipo de consulta" },
    mensaje: {
      label: "Mensaje",
      placeholder: "Describa su solicitud detalladamente...",
    },
  },
} as const;

export const contactoFaq = {
  titulo: "Preguntas Frecuentes",
} as const;

export const faqItems = [
  {
    id: "actualizacion",
    question: "¿Cómo se actualizan los datos de los espacios culturales?",
    answer:
      "Nuestros datos se sincronizan mensualmente con el Sistema de Información Cultural (SIC) y se validan mediante inspecciones territoriales y encuestas directas a los administradores de los recintos.",
  },
  {
    id: "mapas-investigacion",
    question: "¿Puedo utilizar los mapas en mi propia investigación?",
    answer:
      "Sí, siempre que cite la fuente GEO ARTE CDMX, la fecha de consulta y respete la licencia de datos abiertos aplicable a cada capa. Para publicaciones académicas puede solicitar metadatos ampliados mediante el buzón de consultas.",
  },
  {
    id: "brecha",
    question: '¿Qué es una "brecha de cobertura cultural"?',
    answer:
      "Es la diferencia entre la oferta cultural registrada y la demanda o necesidad territorial estimada en una demarcación. Se calcula a partir de indicadores de densidad, accesibilidad y equipamiento por habitante.",
  },
  {
    id: "reportar",
    question: "¿Cómo reportar un dato incorrecto en el mapa?",
    answer:
      "Use el formulario de esta página indicando el ID del espacio o la ubicación aproximada. El equipo de validación revisará el reporte y, de ser procedente, actualizará el registro en el siguiente ciclo de sincronización con el SIC.",
  },
] as const;

export const contactoApi = {
  titulo: "API de Datos Georreferenciados",
  subtitulo:
    "Endpoints públicos para integración técnica y consumo de datos en tiempo real.",
  btnDocumentacion: "Documentación Completa",
  curlTitulo: "Consumo vía CURL",
  btnCopiarToken: "Copiar Token de Prueba",
  demoToken: "geoarte_demo_cdmx_2026",
} as const;

export const apiEndpoints = [
  {
    method: "GET" as const,
    path: "/api/v1/espacios/geojson",
    description:
      "Retorna la colección completa de espacios culturales en formato FeatureCollection de GeoJSON.",
  },
  {
    method: "GET" as const,
    path: "/api/v1/alcaldias/{id}/stats",
    description:
      "Obtiene estadísticas agregadas por alcaldía, incluyendo índices de brecha cultural.",
  },
  {
    method: "GET" as const,
    path: "/api/v1/layers/transporte",
    description:
      "Capa de infraestructura de transporte público (Metro, Metrobús, Cablebús) georreferenciada.",
  },
  {
    method: "GET" as const,
    path: "/api/v1/search?query={q}",
    description:
      "Búsqueda global por nombre de espacio, disciplina artística o colonia.",
  },
] as const;

export const curlExample =
  'curl -X GET "{baseUrl}/api/v1/espacios/geojson" \\\n  -H "accept: application/json" \\\n  -H "Authorization: Bearer {token}"';

export const contactoDatasetsSection = {
  titulo: "Datasets para Descarga Directa",
  subtitulo:
    "Cada archivo se genera al momento con los datos vigentes. «Dinámico» indica que el tamaño depende del padrón actual.",
  nota:
    "Si necesitas el padrón de espacios lo más completo, la mejor opción de esta sección es el Reporte Anual (ZIP) y su Excel «Padrón completo».",
  btnDescargar: "Descargar ahora",
} as const;

export type DatasetAccent = "blue" | "green" | "red" | "orange";

export const datasets = [
  {
    id: "espacios",
    title: "Capa Base de Espacios",
    format: "GeoJSON (GIS)",
    size: "Dinámico",
    accent: "blue" as DatasetAccent,
    filename: "geoarte-capa-espacios.geojson",
    incluye:
      "Espacios georreferenciados (con latitud y longitud): nombre, tipo, alcaldía y ubicación. No incluye el padrón completo ni todos los campos SIC.",
  },
  {
    id: "indicadores",
    title: "Matriz de Indicadores",
    format: "Excel (XLSX)",
    size: "Dinámico",
    accent: "green" as DatasetAccent,
    filename: "geoarte-matriz-indicadores.xlsx",
    incluye:
      "Resumen estadístico de toda la CDMX: KPIs, indicadores por alcaldía, participación, tendencias, tipologías y listado de espacios del dashboard.",
  },
  {
    id: "reporte",
    title: "Reporte Anual",
    format: "PDF + Excel (ZIP)",
    size: "Dinámico",
    accent: "red" as DatasetAccent,
    filename: "geoarte-reporte-anual.zip",
    incluye:
      "ZIP con informe PDF ejecutivo y Excel: hoja «Padrón completo» (16 campos, incl. fechas SIC) más hojas de indicadores (KPIs, alcaldías, participación, tendencia, tipología).",
  },
  {
    id: "api-backup",
    title: "API Full Backup",
    format: "JSON",
    size: "Dinámico",
    accent: "orange" as DatasetAccent,
    filename: "geoarte-api-full-backup.json",
    incluye:
      "JSON con capa de espacios, métricas por alcaldía, transporte y referencia de la API. No es un volcado total de toda la plataforma.",
  },
] as const;

export const contactoPoliticas = {
  politicas: {
    titulo: "Políticas de Datos Abiertos",
    descripcion:
      "La información contenida en esta plataforma es pública conforme a la Ley de Transparencia de la Ciudad de México y puede reutilizarse con las restricciones señaladas en cada conjunto.",
    linkLabel: "Leer política completa",
    linkHref: "/sobre-el-proyecto",
  },
  atribucion: {
    titulo: "Atribución y Licencia",
    descripcion:
      "Salvo indicación contraria, los datos se publican bajo licencia Creative Commons BY 4.0. Debe citar a GEO ARTE CDMX, la Secretaría de Cultura y la fecha de consulta.",
    linkLabel: "Guía de citación",
    linkHref: "/contacto#datasets",
  },
  apiKey: {
    titulo: "¿Necesitas una API Key dedicada?",
    descripcion:
      "Para integraciones de alta demanda, acceso a datos restringidos o soporte técnico institucional.",
    btnLabel: "Solicitar Credenciales",
    btnHref: "/contacto#api",
  },
} as const;
