import {
  ESPEACIO_TIPOS,
  type EspacioTipo,
} from "@/lib/domain/mapa";

/** Nombres SIC oficiales → clave de capa del mapa. */
const CATEGORIA_TO_TIPO: Record<string, EspacioTipo> = {
  Auditorios: "auditorios",
  Bibliotecas: "bibliotecas",
  "Bibliotecas DGB": "bibliotecasDgb",
  Biblioteca: "bibliotecas",
  "Casas de artesanías": "casasArtesanias",
  "Casas de artesanias": "casasArtesanias",
  "Casas y centros culturales": "casasCentrosCulturales",
  "Centros Coord. de pueblos indígenas": "centrosPueblosIndigenas",
  "Centros Coord. de pueblos indigenas": "centrosPueblosIndigenas",
  "Complejos cinematográficos": "complejosCinematograficos",
  "Complejos cinematograficos": "complejosCinematograficos",
  Galerías: "galerias",
  Galerias: "galerias",
  "Librerías y puntos de venta": "libreriasPuntosVenta",
  "Librerias y puntos de venta": "libreriasPuntosVenta",
  Museos: "museos",
  Teatros: "teatros",
  Universidades: "universidades",
};

const FALLBACK_TIPO: EspacioTipo = "casasCentrosCulturales";

/**
 * Resuelve la tipología SIC del padrón a una de las 12 capas del mapa.
 * Alineado con `kTipologiaEspacioSic` en Flutter (SECTEI).
 */
export function resolveEspacioTipo(input: {
  categoriaNombre?: string | null;
  tipo?: string | null;
  nombre?: string | null;
}): EspacioTipo {
  const categoria = normalize(input.categoriaNombre);
  if (categoria && CATEGORIA_TO_TIPO[categoria]) {
    return CATEGORIA_TO_TIPO[categoria];
  }

  const tipo = normalize(input.tipo);
  if (tipo) {
    for (const [label, key] of Object.entries(CATEGORIA_TO_TIPO)) {
      if (tipo.toLowerCase().includes(label.toLowerCase())) return key;
    }
    const fromHeuristic = heuristicFromText(tipo);
    if (fromHeuristic) return fromHeuristic;
  }

  const nombre = normalize(input.nombre);
  if (nombre) {
    const fromHeuristic = heuristicFromText(nombre);
    if (fromHeuristic) return fromHeuristic;
  }

  return FALLBACK_TIPO;
}

function heuristicFromText(text: string): EspacioTipo | null {
  const t = text.toLowerCase();
  if (/auditorio/.test(t)) return "auditorios";
  if (/biblioteca dgb|dgb/.test(t)) return "bibliotecasDgb";
  if (/biblioteca/.test(t)) return "bibliotecas";
  if (/artesan[ií]a/.test(t)) return "casasArtesanias";
  if (/pueblo[s]? ind[ií]gena|coord.*ind[ií]gena/.test(t)) return "centrosPueblosIndigenas";
  if (/cine|cinematogr[aá]f|cinema/.test(t)) return "complejosCinematograficos";
  if (/galer[ií]a/.test(t)) return "galerias";
  if (/librer[ií]a|punto[s]? de venta/.test(t)) return "libreriasPuntosVenta";
  if (/museo/.test(t)) return "museos";
  if (/teatro/.test(t)) return "teatros";
  if (/universidad/.test(t)) return "universidades";
  if (/centro cultural|foro|cultural|comunit/.test(t)) return "casasCentrosCulturales";
  return null;
}

function normalize(value: string | null | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : undefined;
}

export { ESPEACIO_TIPOS };
