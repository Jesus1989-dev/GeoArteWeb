import L from "leaflet";
import type {
  TerritorioFeatureCollection,
  TerritorioGeometrias,
} from "@/lib/domain/territorio-geometrias";

/** Vista por defecto de la Ciudad de México (16 demarcaciones). */
export const CDMX_MAP_CENTER: L.LatLngExpression = [19.4326, -99.1332];
export const CDMX_MAP_ZOOM = 11;

const CDMX_FALLBACK_BOUNDS = L.latLngBounds(
  [19.0, -99.4],
  [19.7, -98.9],
);

export function getCdmxAlcaldiasBounds(
  geometrias?: TerritorioGeometrias,
): L.LatLngBounds {
  const features = geometrias?.alcaldias.features ?? [];
  if (features.length > 0) {
    const collection: TerritorioFeatureCollection = {
      type: "FeatureCollection",
      features,
    };
    const layer = L.geoJSON(collection);
    const bounds = layer.getBounds();
    if (bounds.isValid()) return bounds;
  }
  return CDMX_FALLBACK_BOUNDS;
}

export function fitMapToCdmxAlcaldias(
  map: L.Map,
  geometrias?: TerritorioGeometrias,
  options?: L.FitBoundsOptions,
): void {
  map.stop();
  map.fitBounds(getCdmxAlcaldiasBounds(geometrias), {
    padding: [28, 28],
    maxZoom: 12,
    animate: true,
    ...options,
  });
}
