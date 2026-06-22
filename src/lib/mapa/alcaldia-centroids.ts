import type { Espacio } from "@/lib/domain/mapa";
import type { AlcaldiaCentroide } from "@/lib/domain/mapa-territorial";
import { CDMX_ALCALDIAS } from "@/lib/data/supabase/search.repository";

/** Centroides aproximados de respaldo cuando no hay espacios georreferenciados. */
const ALCALDIA_CENTROIDS_FALLBACK: Record<string, [number, number]> = {
  "Álvaro Obregón": [19.3667, -99.2],
  Azcapotzalco: [19.4867, -99.1867],
  "Benito Juárez": [19.3728, -99.1578],
  Coyoacán: [19.3467, -99.1617],
  Cuajimalpa: [19.355, -99.3017],
  "Cuauhtémoc": [19.4326, -99.1332],
  "Gustavo A. Madero": [19.4847, -99.1108],
  Iztacalco: [19.3953, -99.0975],
  Iztapalapa: [19.3575, -99.0733],
  "La Magdalena Contreras": [19.3092, -99.2117],
  "Miguel Hidalgo": [19.4167, -99.2],
  "Milpa Alta": [19.1925, -99.0233],
  Tláhuac: [19.2833, -99.005],
  Tlalpan: [19.2833, -99.1667],
  "Venustiano Carranza": [19.4428, -99.105],
  Xochimilco: [19.2575, -99.1033],
};

function normalizeAlcaldiaKey(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim();
}

export function computeAlcaldiaCentroids(espacios: Espacio[]): AlcaldiaCentroide[] {
  const buckets = new Map<string, { latSum: number; lngSum: number; count: number }>();

  for (const espacio of espacios) {
    const alcaldia = espacio.alcaldia?.trim();
    if (!alcaldia) continue;

    const key = normalizeAlcaldiaKey(alcaldia);
    const bucket = buckets.get(key) ?? { latSum: 0, lngSum: 0, count: 0 };
    bucket.latSum += espacio.lat;
    bucket.lngSum += espacio.lng;
    bucket.count += 1;
    buckets.set(key, bucket);
  }

  const result: AlcaldiaCentroide[] = [];

  for (const nombre of CDMX_ALCALDIAS) {
    const key = normalizeAlcaldiaKey(nombre);
    const bucket = buckets.get(key);

    if (bucket && bucket.count > 0) {
      result.push({
        alcaldia: nombre,
        lat: bucket.latSum / bucket.count,
        lng: bucket.lngSum / bucket.count,
      });
      continue;
    }

    const fallback = ALCALDIA_CENTROIDS_FALLBACK[nombre];
    if (fallback) {
      result.push({ alcaldia: nombre, lat: fallback[0], lng: fallback[1] });
    }
  }

  return result;
}
