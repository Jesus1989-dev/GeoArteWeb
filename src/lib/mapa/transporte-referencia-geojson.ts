import type {
  TransporteFeatureCollection,
  TransporteGeoFeature,
  TransporteSistema,
} from "@/lib/domain/transporte-capa";
import { METRO_LINEAS_REFERENCIA } from "@/lib/mapa/metro-referencia";

export function sistemaFromLineaId(id: string): TransporteSistema {
  if (id.startsWith("mb")) return "metrobús";
  if (id.startsWith("cb")) return "cablebús";
  if (id.startsWith("l")) return "metro";
  return "referencia";
}

export function buildTransporteReferenciaCollection(): TransporteFeatureCollection {
  const features: TransporteGeoFeature[] = METRO_LINEAS_REFERENCIA.map((linea) => {
    const sistema = sistemaFromLineaId(linea.id);
    return {
      type: "Feature",
      properties: {
        id: linea.id,
        nombre: linea.nombre,
        color: linea.color,
        tipo: sistema,
        sistema,
      },
      geometry: {
        type: "LineString",
        coordinates: linea.coords.map((coord) => {
          const pair = Array.isArray(coord) ? coord : [coord.lat, coord.lng];
          const lat = Number(pair[0]);
          const lng = Number(pair[1]);
          return [lng, lat] as [number, number];
        }),
      },
    };
  });

  return { type: "FeatureCollection", features };
}
