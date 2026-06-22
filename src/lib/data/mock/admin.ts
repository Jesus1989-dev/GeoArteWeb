export const adminHeader = {
  titulo: "Panel de Administración",
  subtitulo:
    "Control de infraestructura, usuarios y capas cartográficas de la CDMX.",
  btnLogs: "Logs del Sistema",
  btnNuevoEspacio: "Nuevo Espacio",
} as const;

export const adminKpis = [
  {
    label: "Total Espacios",
    value: "1,428",
    descripcion: "Espacios georreferenciados activos",
    tendencia: "+12% vs mes anterior",
    tendenciaPositiva: true,
    icon: "building" as const,
  },
  {
    label: "Pendientes",
    value: "12",
    descripcion: "Revisiones de contenido pendientes",
    tendencia: null,
    tendenciaPositiva: null,
    icon: "alert" as const,
  },
  {
    label: "Capas SIG",
    value: "24",
    descripcion: "Capas activas en mapa interactivo",
    tendencia: null,
    tendenciaPositiva: null,
    icon: "layers" as const,
  },
  {
    label: "Usuarios Activos",
    value: "86",
    descripcion: "Investigadores y editores con sesión",
    tendencia: "+5% vs mes anterior",
    tendenciaPositiva: true,
    icon: "users" as const,
  },
] as const;

export type AdminKpi = (typeof adminKpis)[number];

export type { EstadoEspacio } from "@/lib/domain/admin";

export const espaciosAdmin = [
  {
    id: "EC-001",
    fullId: "EC-001",
    nombre: "Centro Cultural de España",
    alcaldia: "Cuauhtémoc",
    tipo: "Museo",
    estado: "Publicado" as const,
    ultimaModif: "Hace 2 horas",
  },
  {
    id: "EC-002",
    fullId: "EC-002",
    nombre: "Teatro de la Ciudad Esperanza Iris",
    alcaldia: "Cuauhtémoc",
    tipo: "Teatro",
    estado: "Publicado" as const,
    ultimaModif: "Ayer",
  },
  {
    id: "EC-003",
    fullId: "EC-003",
    nombre: "Faro de Oriente",
    alcaldia: "Iztapalapa",
    tipo: "Centro Comunitario",
    estado: "Revisión" as const,
    ultimaModif: "Hace 4 horas",
  },
  {
    id: "EC-004",
    fullId: "EC-004",
    nombre: "Museo Anahuacalli",
    alcaldia: "Coyoacán",
    tipo: "Museo",
    estado: "Borrador" as const,
    ultimaModif: "Hace 3 días",
  },
  {
    id: "EC-005",
    fullId: "EC-005",
    nombre: "Cineteca Nacional",
    alcaldia: "Benito Juárez",
    tipo: "Cine",
    estado: "Publicado" as const,
    ultimaModif: "Hace 1 hora",
  },
] as const;

export const adminEspaciosTabs = [
  { id: "listado" as const, label: "Listado Maestro", shortLabel: "Listado" },
  { id: "flujo" as const, label: "Flujo de Revisión", shortLabel: "Flujo" },
  { id: "editor" as const, label: "Editor Cartográfico", shortLabel: "Editor" },
] as const;

export const adminListadoMeta = {
  totalEspacios: 1428,
  busquedaPlaceholder: "Buscar por ID o nombre...",
  puedeAnterior: false,
  puedeSiguiente: true,
} as const;

export const adminMenu = [
  { id: "espacios", label: "Espacios culturales", section: "Gestión de datos" as const },
  { id: "capas", label: "Capas SIG", section: "Gestión de datos" as const, icon: "layers" as const },
  { id: "mapa-capas", label: "Capas del mapa", section: "Gestión de datos" as const },
  { id: "fuentes", label: "Fuentes de información", section: "Gestión de datos" as const },
  {
    id: "politicas",
    label: "Políticas públicas",
    section: "Gestión de datos" as const,
  },
  {
    id: "investigacion",
    label: "Investigación cualitativa",
    section: "Gestión de datos" as const,
  },
  {
    id: "reportes",
    label: "Centro de reportes",
    section: "Gestión de datos" as const,
  },
  {
    id: "cuestionario",
    label: "Cuestionario SECTEI",
    section: "Gestión de datos" as const,
  },
  { id: "consultas", label: "Consultas de contacto", section: "Gestión de datos" as const },
  { id: "usuarios", label: "Usuarios", section: "Gestión de datos" as const },
  { id: "logs", label: "Historial / logs", section: "Gestión de datos" as const },
  { id: "pendientes", label: "Pendientes", section: "Validaciones" as const, badge: 12 },
] as const;

export const adminCapasSigMeta = {
  titulo: "Capas SIG",
  subtitulo: "Catálogo de capas vectoriales y raster publicadas en el mapa interactivo.",
  btnNuevaCapa: "Nueva capa",
} as const;

export const adminMapaCapasMeta = {
  titulo: "Capas del mapa",
  subtitulo:
    "Sincroniza métricas territoriales y macrozonas desde el padrón de espacios culturales.",
  btnSincronizar: "Sincronizar ahora",
  historialTitulo: "Historial de sincronizaciones",
  notaSeeds:
    "Geometrías de alcaldías y líneas de transporte se cargan desde GeoJSON con:",
  notaCron: "Para tareas programadas (cron), recalcula métricas y macrozonas con:",
} as const;

export const adminCapasSig = [
  {
    id: "SIG-001",
    fullId: "demo-sig-001",
    nombre: "Museos y Galerías",
    descripcion: "Tipología demo",
    formato: "Tipología SIC",
    estado: "Activa" as const,
    actualizacion: "12 Oct 2025",
    orden: 10,
    espaciosVinculados: 0,
  },
  {
    id: "SIG-002",
    fullId: "demo-sig-002",
    nombre: "Teatros y Auditorios",
    descripcion: "Tipología demo",
    formato: "Tipología SIC",
    estado: "Activa" as const,
    actualizacion: "05 Nov 2025",
    orden: 20,
    espaciosVinculados: 0,
  },
] as const;

export const adminValidacionPendientes = {
  titulo: "Pendientes",
  subtitulo: "Requieren revisión inmediata",
  badge: 12,
  seccionId: "pendientes" as const,
} as const;
