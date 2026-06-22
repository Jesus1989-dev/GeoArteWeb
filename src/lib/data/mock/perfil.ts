export type RolPerfil = "ciudadano" | "investigador" | "autoridad";

export const perfilRoles = [
  { id: "ciudadano" as const, label: "Ciudadano", icon: "user" as const },
  { id: "investigador" as const, label: "Investigador", icon: "microscope" as const },
  { id: "autoridad" as const, label: "Autoridad", icon: "shield" as const },
];

export const perfilUsuario = {
  nombre: "Dr. Alejandro Méndez",
  subtitulo: "Investigador Senior • Dirección de Análisis Territorial",
  badgeRol: "Investigador",
  avatarIniciales: "AM",
  rolActivoDefault: "investigador" as RolPerfil,
  stats: [
    { label: "RECURSOS GUARDADOS", value: "24", accent: "navy" as const },
    { label: "REPORTES GENERADOS", value: "12", accent: "pink" as const },
  ],
  perfilActivoLabel: "PERFIL ACTIVO",
} as const;

export const perfilTabs = [
  { id: "recursos" as const, label: "Mis Recursos", icon: "save" as const },
  { id: "historial" as const, label: "Historial", icon: "clock" as const },
  { id: "config" as const, label: "Configuración", icon: "settings" as const },
];

export const perfilRecursosMeta = {
  titulo: "Recursos Guardados",
  subtitulo:
    "Accede rápidamente a tus mapas, datos e informes favoritos.",
  filtrarLabel: "Filtrar por tipo",
  explorarMapaLabel: "Explorar Mapa",
  explorarMapaHref: "/mapa",
  abrirLabel: "Abrir",
  filtroOpciones: [
    { value: "todos", label: "Todos los tipos" },
    { value: "mapa", label: "Vista de Mapa" },
    { value: "reporte", label: "Informe Estadístico" },
    { value: "dataset", label: "Conjunto de Datos" },
  ],
} as const;

export type CategoriaRecursoGuardado = "mapa" | "reporte" | "dataset";

export const recursosGuardados = [
  {
    id: "g1",
    categoria: "mapa" as const,
    categoriaLabel: "Vista de Mapa",
    titulo: "Análisis de Vacíos Culturales - Iztapalapa",
    guardadoEl: "12 Oct 2023",
    href: "/mapa",
  },
  {
    id: "g2",
    categoria: "reporte" as const,
    categoriaLabel: "Informe Estadístico",
    titulo: "Reporte de Impacto: Museos en el Centro Histórico",
    guardadoEl: "05 Nov 2023",
    href: "/reportes",
  },
  {
    id: "g3",
    categoria: "dataset" as const,
    categoriaLabel: "Conjunto de Datos",
    titulo: "Dataset: Infraestructura Artística 2023 (GeoJSON)",
    guardadoEl: "18 Nov 2023",
    href: "/contacto#datasets",
  },
  {
    id: "g4",
    categoria: "mapa" as const,
    categoriaLabel: "Vista de Mapa",
    titulo: "Mapa de Accesibilidad: Bibliotecas Públicas",
    guardadoEl: "02 Dic 2023",
    href: "/mapa",
  },
  {
    id: "g5",
    categoria: "reporte" as const,
    categoriaLabel: "Informe Estadístico",
    titulo: "Tendencias de Participación Juvenil CDMX",
    guardadoEl: "15 Dic 2023",
    href: "/reportes",
  },
  {
    id: "g6",
    categoria: "dataset" as const,
    categoriaLabel: "Conjunto de Datos",
    titulo: "Capa GIS: Corredores Turísticos Culturales",
    guardadoEl: "20 Dic 2023",
    href: "/contacto#datasets",
  },
] as const;

export const perfilHistorialPlaceholder =
  "El historial de acciones y descargas se conectará a Supabase Auth y tablas de auditoría.";

export const perfilConfigPlaceholder =
  "Preferencias de cuenta, notificaciones y API keys — próximamente.";
