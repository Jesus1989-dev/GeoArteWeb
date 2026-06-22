/** Tipologías SIC del padrón cultural (12 capas del mapa). */
export const ESPEACIO_TIPOS = [
  "auditorios",
  "bibliotecas",
  "bibliotecasDgb",
  "casasArtesanias",
  "casasCentrosCulturales",
  "centrosPueblosIndigenas",
  "complejosCinematograficos",
  "galerias",
  "libreriasPuntosVenta",
  "museos",
  "teatros",
  "universidades",
] as const;

export type EspacioTipo = (typeof ESPEACIO_TIPOS)[number];

export type Espacio = {
  id: string;
  nombre: string;
  tipo: EspacioTipo;
  lat: number;
  lng: number;
  direccion: string;
  alcaldia?: string;
  /** URL pública (Storage) o enlace SIC de la fotografía del espacio. */
  imagenUrl?: string;
};

export const ESPEACIO_TIPO_LABELS: Record<EspacioTipo, string> = {
  auditorios: "Auditorios",
  bibliotecas: "Bibliotecas",
  bibliotecasDgb: "Bibliotecas DGB",
  casasArtesanias: "Casas de artesanías",
  casasCentrosCulturales: "Casas y centros culturales",
  centrosPueblosIndigenas: "Centros Coord. de pueblos indígenas",
  complejosCinematograficos: "Complejos cinematográficos",
  galerias: "Galerías",
  libreriasPuntosVenta: "Librerías y puntos de venta",
  museos: "Museos",
  teatros: "Teatros",
  universidades: "Universidades",
};

export type EspacioTipoColor = {
  stroke: string;
  fill: string;
  label: string;
};

export const ESPEACIO_TIPO_COLORS: Record<EspacioTipo, EspacioTipoColor> = {
  auditorios: { stroke: "#5b21b6", fill: "#7c3aed", label: ESPEACIO_TIPO_LABELS.auditorios },
  bibliotecas: { stroke: "#1d4ed8", fill: "#3b82f6", label: ESPEACIO_TIPO_LABELS.bibliotecas },
  bibliotecasDgb: { stroke: "#0369a1", fill: "#0ea5e9", label: ESPEACIO_TIPO_LABELS.bibliotecasDgb },
  casasArtesanias: { stroke: "#b45309", fill: "#f59e0b", label: ESPEACIO_TIPO_LABELS.casasArtesanias },
  casasCentrosCulturales: { stroke: "#15803d", fill: "#22c55e", label: ESPEACIO_TIPO_LABELS.casasCentrosCulturales },
  centrosPueblosIndigenas: { stroke: "#0f766e", fill: "#14b8a6", label: ESPEACIO_TIPO_LABELS.centrosPueblosIndigenas },
  complejosCinematograficos: { stroke: "#4338ca", fill: "#6366f1", label: ESPEACIO_TIPO_LABELS.complejosCinematograficos },
  galerias: { stroke: "#be185d", fill: "#ec4899", label: ESPEACIO_TIPO_LABELS.galerias },
  libreriasPuntosVenta: { stroke: "#c2410c", fill: "#f97316", label: ESPEACIO_TIPO_LABELS.libreriasPuntosVenta },
  museos: { stroke: "#1e40af", fill: "#2563eb", label: ESPEACIO_TIPO_LABELS.museos },
  teatros: { stroke: "#6d28d9", fill: "#8b5cf6", label: ESPEACIO_TIPO_LABELS.teatros },
  universidades: { stroke: "#334155", fill: "#64748b", label: ESPEACIO_TIPO_LABELS.universidades },
};

export type CapaMapaState = Record<EspacioTipo, { visible: boolean; opacity: number }>;

export function createEmptyCapaMapaState(
  defaults: Partial<CapaMapaState[EspacioTipo]> = {},
): CapaMapaState {
  return Object.fromEntries(
    ESPEACIO_TIPOS.map((tipo) => [
      tipo,
      { visible: false, opacity: 80, ...defaults },
    ]),
  ) as CapaMapaState;
}

export function createDefaultTiposFiltro(all = true): Record<EspacioTipo, boolean> {
  return Object.fromEntries(ESPEACIO_TIPOS.map((tipo) => [tipo, all])) as Record<
    EspacioTipo,
    boolean
  >;
}

export function createEmptyTipoCounts(): Record<EspacioTipo, number> {
  return Object.fromEntries(ESPEACIO_TIPOS.map((tipo) => [tipo, 0])) as Record<
    EspacioTipo,
    number
  >;
}
