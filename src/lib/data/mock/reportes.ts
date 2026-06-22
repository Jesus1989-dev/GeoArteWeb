export const reportesKpis = [
  {
    label: "Total reportes",
    value: "128",
    delta: "+12% este mes",
    positive: true,
    icon: "fileText" as const,
    accent: "navy" as const,
  },
  {
    label: "Descargas PDF",
    value: "3,420",
    delta: "+5.4k visualizaciones",
    positive: true,
    icon: "download" as const,
    accent: "pink" as const,
  },
  {
    label: "Datasets exportados",
    value: "89",
    delta: "8.2 GB transferidos",
    positive: true,
    icon: "database" as const,
    accent: "navy" as const,
  },
  {
    label: "Tiempo prom. gen.",
    value: "1.4 min",
    delta: "Optimizado",
    positive: true,
    icon: "clock" as const,
    accent: "pink" as const,
  },
] as const;

export type { EstadoReporte } from "@/lib/domain/reportes";

export const historialReportes = [
  {
    id: "r1",
    titulo: "Informe Anual de Cobertura",
    estado: "Publicado" as const,
    categoria: "Análisis Estratégico",
    fecha: "14 Feb, 2024",
    autor: "Dr. R. Martínez",
  },
  {
    id: "r2",
    titulo: "Brechas por Género en Espacios",
    estado: "Generado" as const,
    categoria: "Impacto Social",
    fecha: "10 Feb, 2024",
    autor: "Equipo DS",
  },
  {
    id: "r3",
    titulo: "Resumen Ejecutivo — Iztapalapa",
    estado: "Borrador" as const,
    categoria: "Resumen Ejecutivo",
    fecha: "08 Feb, 2024",
    autor: "L. Hernández",
  },
  {
    id: "r4",
    titulo: "Mapa de Calor de Asistencia Q4",
    estado: "Publicado" as const,
    categoria: "Estadística",
    fecha: "02 Feb, 2024",
    autor: "A. Ruiz",
  },
] as const;

export const plantillasReporte = [
  {
    id: "p1",
    titulo: "Diagnóstico Territorial",
    desc: "Análisis de brechas",
  },
  {
    id: "p2",
    titulo: "Impacto Social",
    desc: "Indicadores de participación",
  },
  {
    id: "p3",
    titulo: "Resumen Ejecutivo",
    desc: "Formato para autoridades",
  },
] as const;

export const reportesAyuda = {
  texto:
    "¿Necesitas un formato específico o integración con otra herramienta? Escríbenos y te ayudamos a configurar exportaciones personalizadas.",
  enlaceApi: "Consultar documentación API",
} as const;
