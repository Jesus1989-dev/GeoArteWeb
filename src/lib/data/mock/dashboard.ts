/** Datos de demostración para el dashboard (sin Supabase). */

export const dashboardKpis = [
  {
    label: "Total Espacios",
    value: "1,248",
    delta: "+4.2%",
    deltaPositive: true,
    accent: "navy" as const,
    icon: "layers" as const,
  },
  {
    label: "Usuarios Alcanzados",
    value: "45.2k",
    delta: "+12.1%",
    deltaPositive: true,
    accent: "pink" as const,
    icon: "users" as const,
  },
  {
    label: "Inversión Pública",
    value: "$24.5M",
    delta: "-2.4%",
    deltaPositive: false,
    accent: "navy" as const,
    icon: "trendingUp" as const,
  },
  {
    label: "Cobertura Promedio",
    value: "78%",
    delta: "+1.5%",
    deltaPositive: true,
    accent: "pink" as const,
    icon: "mapPin" as const,
  },
] as const;

/** Participación por género y disciplina (agrupado). */
export const participacionGenero = [
  { disciplina: "Artes Visuales", hombres: 420, mujeres: 580, otros: 160 },
  { disciplina: "Música", hombres: 380, mujeres: 520, otros: 140 },
  { disciplina: "Teatro", hombres: 340, mujeres: 480, otros: 120 },
  { disciplina: "Danza", hombres: 300, mujeres: 450, otros: 110 },
] as const;

export const tendenciaAsistencia = [
  { mes: "Ene", visitas: 120, eventos: 18 },
  { mes: "Feb", visitas: 132, eventos: 20 },
  { mes: "Mar", visitas: 128, eventos: 19 },
  { mes: "Abr", visitas: 145, eventos: 22 },
  { mes: "May", visitas: 158, eventos: 24 },
  { mes: "Jun", visitas: 151, eventos: 23 },
] as const;

export const densidadInfra = [
  { zona: "Centro", valor: 92 },
  { zona: "Sur", valor: 68 },
  { zona: "Oriente", valor: 45 },
  { zona: "Poniente", valor: 71 },
  { zona: "Norte", valor: 58 },
] as const;

export const distribucionTipologia = [
  { name: "Museos", value: 28, color: "#1f3a5f" },
  { name: "Teatros", value: 22, color: "#e10599" },
  { name: "Centros cult.", value: 35, color: "#3b82f6" },
  { name: "Foros / otros", value: 15, color: "#64748b" },
] as const;

export const espaciosTabla = [
  {
    id: "EC-1024",
    nombre: "Centro Cultural El Rule",
    alcaldia: "Cuauhtémoc",
    completitud: 100,
    estado: "Publicado" as const,
    lat: 19.434,
    lng: -99.14,
  },
  {
    id: "EC-0891",
    nombre: "Faro Tláhuac",
    alcaldia: "Tláhuac",
    completitud: 75,
    estado: "Revisión" as const,
    lat: 19.283,
    lng: -99.005,
  },
  {
    id: "EC-0550",
    nombre: "Casa del Lago",
    alcaldia: "Miguel Hidalgo",
    completitud: 50,
    estado: "Borrador" as const,
    lat: null,
    lng: null,
  },
  {
    id: "EC-0333",
    nombre: "Teatro del Pueblo",
    alcaldia: "Iztapalapa",
    completitud: 100,
    estado: "Publicado" as const,
    lat: 19.35,
    lng: -99.09,
  },
  {
    id: "EC-0211",
    nombre: "Foro Lindbergh",
    alcaldia: "Benito Juárez",
    completitud: 100,
    estado: "Publicado" as const,
    lat: 19.41,
    lng: -99.17,
  },
] as const;

export const filtroOpciones = {
  alcaldia: ["Todas", "Iztapalapa", "Benito Juárez", "Cuauhtémoc", "Coyoacán"],
  disciplina: ["Todas", "Música", "Teatro", "Artes visuales", "Danza"],
  periodo: ["2023-2024", "2022-2023", "2021-2022"],
  nivelSocioeconomico: ["Todos", "Bajo", "Medio", "Alto"],
  rangoEdad: ["Todos", "18-29", "30-44", "45-59", "60+"],
  genero: ["Todos", "Mujer", "Hombre", "No binario / otro"],
} as const;

export const comparadorMetricas = [
  { label: "Espacios Culturales", a: 154, b: 112 },
  { label: "Asistencia Mensual (k)", a: 85, b: 120 },
  { label: "Eventos Gratuitos", a: 92, b: 45 },
  { label: "Índice de Accesibilidad", a: 6.8, b: 9.4 },
] as const;

export const alcaldiasComparador = [
  "Iztapalapa",
  "Benito Juárez",
  "Cuauhtémoc",
  "Coyoacán",
  "Gustavo A. Madero",
] as const;

/** Hallazgo demo del comparador (brecha de accesibilidad física). */
export const hallazgoTerritorial = {
  brechaAccesibilidad: 26,
} as const;
