import type { TerritorioGeoFeature, TerritorioGeoJsonGeometry } from "@/lib/domain/territorio-geometrias";
import { normAlcaldia } from "@/lib/mapa/norm-alcaldia";

function pointInRing(lng: number, lat: number, ring: number[][]): boolean {
  let inside = false;

  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i]?.[0];
    const yi = ring[i]?.[1];
    const xj = ring[j]?.[0];
    const yj = ring[j]?.[1];
    if (xi == null || yi == null || xj == null || yj == null) continue;

    const intersects =
      yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (intersects) inside = !inside;
  }

  return inside;
}

export function pointInTerritorioGeometry(
  lng: number,
  lat: number,
  geometry: TerritorioGeoJsonGeometry,
): boolean {
  if (geometry.type === "Polygon") {
    const ring = geometry.coordinates[0];
    return Array.isArray(ring) ? pointInRing(lng, lat, ring as number[][]) : false;
  }

  if (geometry.type === "MultiPolygon") {
    for (const polygon of geometry.coordinates) {
      const ring = polygon?.[0];
      if (Array.isArray(ring) && pointInRing(lng, lat, ring as number[][])) {
        return true;
      }
    }
  }

  return false;
}

export function findAlcaldiaFeature(
  features: TerritorioGeoFeature[],
  alcaldia: string,
): TerritorioGeoFeature | undefined {
  const key = normAlcaldia(alcaldia);
  if (!key) return undefined;

  return features.find((feature) => {
    const nombre = normAlcaldia(feature.properties.nombre);
    return nombre === key || nombre.includes(key) || key.includes(nombre);
  });
}

export function pointInAlcaldiaFeature(
  lng: number,
  lat: number,
  feature: TerritorioGeoFeature,
): boolean {
  return pointInTerritorioGeometry(lng, lat, feature.geometry);
}
