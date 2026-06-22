import type { Espacio } from "@/lib/domain/mapa";
import type { AlcaldiaMetrica } from "@/lib/domain/mapa-territorial";
import type { TerritorioGeometrias } from "@/lib/domain/territorio-geometrias";
import { normAlcaldia } from "@/lib/mapa/norm-alcaldia";
import {
  findAlcaldiaFeature,
  pointInAlcaldiaFeature,
} from "@/lib/mapa/point-in-territorio";
import { normalizeSearchText, resolveAlcaldiaFromQuery } from "@/lib/mapa/search-utils";

export function filterEspacios(
  espacios: Espacio[],
  query: string,
  alcaldias: readonly string[] = [],
): Espacio[] {
  const term = normalizeSearchText(query);
  if (!term) return espacios;

  const matchedAlcaldia = resolveAlcaldiaFromQuery(query, alcaldias);
  if (matchedAlcaldia) {
    return filterEspaciosByAlcaldia(espacios, matchedAlcaldia);
  }

  return espacios.filter((espacio) => {
    const haystack = [
      espacio.nombre,
      espacio.direccion,
      espacio.alcaldia ?? "",
    ]
      .map(normalizeSearchText)
      .join(" ");
    return haystack.includes(term);
  });
}

function alcaldiasNombreCoincide(espacioAlcaldia: string, term: string): boolean {
  if (!espacioAlcaldia || !term) return false;
  if (espacioAlcaldia === term) return true;
  // Variantes del padrón: "Cuajimalpa" vs "Cuajimalpa de Morelos"
  return espacioAlcaldia.includes(term) || term.includes(espacioAlcaldia);
}

export function filterEspaciosByAlcaldia(
  espacios: Espacio[],
  alcaldia: string,
  geometrias?: TerritorioGeometrias,
): Espacio[] {
  const term = normAlcaldia(alcaldia);
  if (!term) return espacios;

  const alcaldiaFeature = geometrias
    ? findAlcaldiaFeature(geometrias.alcaldias.features, alcaldia)
    : undefined;

  const usarGeometria = Boolean(
    alcaldiaFeature &&
      geometrias &&
      geometrias.alcaldias.features.length > 0,
  );

  return espacios.filter((espacio) => {
    if (
      usarGeometria &&
      alcaldiaFeature &&
      Number.isFinite(espacio.lat) &&
      Number.isFinite(espacio.lng)
    ) {
      // Con polígonos: solo puntos dentro del territorio (evita errores de alcaldía en el padrón).
      return pointInAlcaldiaFeature(espacio.lng, espacio.lat, alcaldiaFeature);
    }

    const espacioAlcaldia = normAlcaldia(espacio.alcaldia ?? "");
    return alcaldiasNombreCoincide(espacioAlcaldia, term);
  });
}

export function filterAlcaldias(alcaldias: string[], query: string, limit = 5): string[] {
  const term = normalizeSearchText(query);
  if (!term) return alcaldias.slice(0, limit);

  return alcaldias
    .filter((nombre) => normalizeSearchText(nombre).includes(term))
    .slice(0, limit);
}

function normalizeAlcaldiaKey(value: string): string {
  return normalizeSearchText(value);
}

function brechaForAlcaldia(
  alcaldia: string | undefined,
  metricas: AlcaldiaMetrica[],
): number {
  if (!alcaldia) return 0;
  const key = normalizeAlcaldiaKey(alcaldia);
  const match = metricas.find((row) => normalizeAlcaldiaKey(row.alcaldia) === key);
  return match?.porcentajeBrecha ?? 0;
}

export function filterEspaciosByMetricas(
  espacios: Espacio[],
  metricas: AlcaldiaMetrica[],
  brechaMinima: number,
  soloVacios: boolean,
): Espacio[] {
  const umbral = soloVacios ? Math.max(brechaMinima, 35) : brechaMinima;
  if (umbral <= 0 && !soloVacios) return espacios;

  return espacios.filter((espacio) => brechaForAlcaldia(espacio.alcaldia, metricas) >= umbral);
}

/** Filtra recursos cualitativos georreferenciados por alcaldía (misma lógica que espacios). */
export function filterRecursosByAlcaldia<T extends { alcaldia: string; lat: number | null; lng: number | null }>(
  recursos: T[],
  alcaldia: string,
  geometrias?: TerritorioGeometrias,
): T[] {
  const term = normAlcaldia(alcaldia);
  if (!term) return recursos;

  const alcaldiaFeature = geometrias
    ? findAlcaldiaFeature(geometrias.alcaldias.features, alcaldia)
    : undefined;

  const usarGeometria = Boolean(
    alcaldiaFeature &&
      geometrias &&
      geometrias.alcaldias.features.length > 0,
  );

  return recursos.filter((recurso) => {
    if (
      usarGeometria &&
      alcaldiaFeature &&
      recurso.lat != null &&
      recurso.lng != null &&
      Number.isFinite(recurso.lat) &&
      Number.isFinite(recurso.lng)
    ) {
      return pointInAlcaldiaFeature(recurso.lng, recurso.lat, alcaldiaFeature);
    }

    const recursoAlcaldia = normAlcaldia(recurso.alcaldia ?? "");
    return alcaldiasNombreCoincide(recursoAlcaldia, term);
  });
}
