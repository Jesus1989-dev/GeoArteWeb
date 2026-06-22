import L from "leaflet";
import type { MapaCapasExtraId } from "@/lib/domain/mapa-territorial";
import type { MapaTerritorialData } from "@/lib/domain/mapa-territorial";
import type {
  TransporteFeatureCollection,
  TransporteGeoFeature,
} from "@/lib/domain/transporte-capa";
import type {
  TerritorioFeatureCollection,
  TerritorioGeoFeature,
} from "@/lib/domain/territorio-geometrias";
import { MACROZONA_LABELS } from "@/lib/mapa/macrozona-geometries";
import { normAlcaldia } from "@/lib/mapa/norm-alcaldia";
import { colorForPercent } from "@/lib/mapa/overlay-styles";

function findMetrica(
  data: MapaTerritorialData,
  alcaldia: string,
): MapaTerritorialData["metricas"][number] | undefined {
  const key = normAlcaldia(alcaldia);
  return data.metricas.find((row) => normAlcaldia(row.alcaldia) === key);
}

function addGeoJsonToGroup(
  group: L.LayerGroup,
  features: TerritorioGeoFeature[],
  styleForFeature: (feature: TerritorioGeoFeature) => L.PathOptions,
  popupForFeature: (feature: TerritorioGeoFeature) => string,
): void {
  if (features.length === 0) return;

  L.geoJSON(
    { type: "FeatureCollection", features } as TerritorioFeatureCollection,
    {
      style: (feature) => styleForFeature(feature as TerritorioGeoFeature),
      onEachFeature: (feature, layer) => {
        layer.bindPopup(popupForFeature(feature as TerritorioGeoFeature));
      },
    },
  ).addTo(group);
}

export function buildTransporteLayer(data: MapaTerritorialData): L.LayerGroup {
  const group = L.layerGroup();
  const collection = data.transporte.lineas;

  if (collection.features.length === 0) return group;

  L.geoJSON(
    collection as TransporteFeatureCollection,
    {
      smoothFactor: 0.35,
      style: (feature) => {
        const props = (feature as TransporteGeoFeature).properties;
        const id = props.id ?? "";
        const isMetrobus = id.startsWith("mb") || props.tipo === "metrobús";
        return {
          color: props.color ?? "#334155",
          weight: isMetrobus ? 3 : 4,
          opacity: 0.85,
          lineCap: "round",
          lineJoin: "round",
          dashArray: isMetrobus ? "7 5" : undefined,
        };
      },
      onEachFeature: (feature, layer) => {
        const props = (feature as TransporteGeoFeature).properties;
        const fuente =
          data.transporte.source === "supabase"
            ? "Capa sincronizada desde Supabase"
            : data.transporte.source === "geojson"
              ? "Trazos cartográficos (GeoJSON CDMX)"
              : "Referencia cartográfica simplificada";
        layer.bindPopup(
          `<div style="font-family:system-ui,sans-serif;font-size:12px;">
            <strong>${props.nombre}</strong>
            <div style="margin-top:4px;color:#64748b;">${fuente}</div>
          </div>`,
        );
      },
    } as L.GeoJSONOptions,
  ).addTo(group);

  return group;
}

export function buildDensidadLayer(data: MapaTerritorialData): L.LayerGroup {
  const group = L.layerGroup();
  const densidadByZona = new Map(
    data.densidadMacrozonas.map((row) => [row.macrozona.toUpperCase(), row.porcentaje]),
  );

  addGeoJsonToGroup(
    group,
    data.geometrias.macrozonas.features,
    (feature) => {
      const codigo = String(feature.properties.macrozona ?? feature.properties.codigo ?? "").toUpperCase();
      const porcentaje = densidadByZona.get(codigo) ?? 0;
      return {
        color: "#1e3a5f",
        weight: 1.5,
        fillColor: colorForPercent(porcentaje, "blue"),
        fillOpacity: 0.35,
        opacity: 0.6,
      };
    },
    (feature) => {
      const codigo = String(feature.properties.macrozona ?? feature.properties.codigo ?? "").toUpperCase();
      const porcentaje = densidadByZona.get(codigo) ?? 0;
      const label = MACROZONA_LABELS[codigo] ?? feature.properties.nombre;
      return `<div style="font-family:system-ui,sans-serif;font-size:12px;">
          <strong>${label}</strong>
          <div style="margin-top:4px;">Densidad de infraestructura: <strong>${Math.round(porcentaje)}%</strong></div>
        </div>`;
    },
  );

  return group;
}

export function buildCoberturaLayer(
  data: MapaTerritorialData,
  brechaMinima = 0,
): L.LayerGroup {
  const group = L.layerGroup();

  const features = data.geometrias.alcaldias.features.filter((feature) => {
    const metrica = findMetrica(data, feature.properties.nombre);
    return metrica != null && metrica.porcentajeBrecha >= brechaMinima;
  });

  addGeoJsonToGroup(
    group,
    features,
    (feature) => {
      const metrica = findMetrica(data, feature.properties.nombre)!;
      return {
        color: "#166534",
        weight: 1.5,
        fillColor: colorForPercent(metrica.porcentajeCobertura, "green"),
        fillOpacity: 0.28,
        opacity: 0.7,
      };
    },
    (feature) => {
      const metrica = findMetrica(data, feature.properties.nombre);
      if (!metrica) return `<strong>${feature.properties.nombre}</strong>`;
      return `<div style="font-family:system-ui,sans-serif;font-size:12px;min-width:160px;">
          <strong>${feature.properties.nombre}</strong>
          <div style="margin-top:6px;">Cobertura cultural: <strong>${Math.round(metrica.porcentajeCobertura)}%</strong></div>
          <div>Espacios: <strong>${metrica.cantidadEspacios}</strong></div>
        </div>`;
    },
  );

  return group;
}

export function buildVaciosLayer(
  data: MapaTerritorialData,
  brechaMinima = 0,
  soloVacios = false,
): L.LayerGroup {
  const group = L.layerGroup();
  const umbralVacios = soloVacios ? Math.max(brechaMinima, 35) : brechaMinima;

  const features = data.geometrias.alcaldias.features.filter((feature) => {
    const metrica = findMetrica(data, feature.properties.nombre);
    return metrica != null && metrica.porcentajeBrecha >= umbralVacios;
  });

  addGeoJsonToGroup(
    group,
    features,
    (feature) => {
      const metrica = findMetrica(data, feature.properties.nombre)!;
      return {
        color: "#991b1b",
        weight: 2,
        fillColor: colorForPercent(metrica.porcentajeBrecha, "red"),
        fillOpacity: 0.22,
        opacity: 0.85,
        dashArray: "6 4",
      };
    },
    (feature) => {
      const metrica = findMetrica(data, feature.properties.nombre);
      if (!metrica) return `<strong>${feature.properties.nombre}</strong>`;
      return `<div style="font-family:system-ui,sans-serif;font-size:12px;min-width:160px;">
          <strong>${feature.properties.nombre}</strong>
          <div style="margin-top:6px;">Brecha territorial: <strong>${Math.round(metrica.porcentajeBrecha)}%</strong></div>
          <div style="color:#64748b;margin-top:4px;">Zona con vacío de oferta cultural</div>
        </div>`;
    },
  );

  return group;
}

export type OverlayBundle = Record<MapaCapasExtraId, L.LayerGroup>;

export function createEmptyOverlayBundle(): OverlayBundle {
  return {
    transporte: L.layerGroup(),
    densidad: L.layerGroup(),
    nivel: L.layerGroup(),
    cobertura: L.layerGroup(),
  };
}

export function rebuildOverlayLayers(
  data: MapaTerritorialData,
  brechaMinima = 0,
  soloVacios = false,
): OverlayBundle {
  return {
    transporte: buildTransporteLayer(data),
    densidad: buildDensidadLayer(data),
    cobertura: buildCoberturaLayer(data, brechaMinima),
    nivel: buildVaciosLayer(data, brechaMinima, soloVacios),
  };
}

export function syncOverlayVisibility(
  map: L.Map,
  overlays: OverlayBundle,
  capasExtra: Record<MapaCapasExtraId, boolean>,
): void {
  for (const id of Object.keys(capasExtra) as MapaCapasExtraId[]) {
    const layer = overlays[id];
    if (capasExtra[id]) {
      layer.addTo(map);
    } else {
      layer.remove();
    }
  }
}

export const OVERLAY_LEGEND: Record<MapaCapasExtraId, string> = {
  transporte: "Transporte masivo",
  densidad: "Densidad por macrozona",
  cobertura: "Cobertura cultural por alcaldía",
  nivel: "Vacíos territoriales (brecha)",
};
