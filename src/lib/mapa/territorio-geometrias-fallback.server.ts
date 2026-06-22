import { readFileSync } from "node:fs";
import { join } from "node:path";
import type {
  TerritorioFeatureCollection,
  TerritorioGeoFeature,
  TerritorioGeometrias,
} from "@/lib/domain/territorio-geometrias";
import { MACROZONA_LABELS, MACROZONA_POLYGONS } from "@/lib/mapa/macrozona-geometries";
import { normAlcaldia } from "@/lib/mapa/norm-alcaldia";

type CdmxAlcaldiaSourceFeature = {
  type: "Feature";
  properties: { NOM_MUN?: string; CVE_MUN?: string };
  geometry: TerritorioGeoFeature["geometry"];
};

type CdmxAlcaldiaSource = {
  type: "FeatureCollection";
  features: CdmxAlcaldiaSourceFeature[];
};

const ALCALDIA_MACROZONA: Record<string, string> = {
  "alvaro obregon": "PONIENTE",
  azcapotzalco: "NORTE",
  "benito juarez": "CENTRO",
  coyoacan: "SUR",
  "cuajimalpa de morelos": "PONIENTE",
  cuajimalpa: "PONIENTE",
  cuauhtemoc: "CENTRO",
  "gustavo a. madero": "NORTE",
  iztacalco: "ORIENTE",
  iztapalapa: "ORIENTE",
  "la magdalena contreras": "SUR",
  "miguel hidalgo": "CENTRO",
  "milpa alta": "SUR",
  tlahuac: "ORIENTE",
  tlalpan: "SUR",
  "venustiano carranza": "ORIENTE",
  xochimilco: "SUR",
};

let cachedFallback: TerritorioGeometrias | null = null;

function polygonToGeoJson(coords: [number, number][]): TerritorioGeoFeature["geometry"] {
  const ring = coords.map(([lat, lng]) => [lng, lat] as [number, number]);
  return { type: "Polygon", coordinates: [ring] };
}

function buildMacrozonasFallback(): TerritorioFeatureCollection {
  const features: TerritorioGeoFeature[] = Object.entries(MACROZONA_POLYGONS).map(
    ([codigo, coords]) => ({
      type: "Feature",
      properties: {
        nombre: MACROZONA_LABELS[codigo] ?? codigo,
        codigo,
        macrozona: codigo,
      },
      geometry: polygonToGeoJson(coords as [number, number][]),
    }),
  );

  return { type: "FeatureCollection", features };
}

function mapAlcaldiasSource(source: CdmxAlcaldiaSource): TerritorioFeatureCollection {
  const features = source.features
    .map((feature) => {
      const nombre = String(feature.properties.NOM_MUN ?? "").trim();
      if (!nombre) return null;

      const codigo = String(feature.properties.CVE_MUN ?? normAlcaldia(nombre)).trim();
      const macrozona = ALCALDIA_MACROZONA[normAlcaldia(nombre)];

      return {
        type: "Feature" as const,
        properties: {
          nombre,
          codigo,
          ...(macrozona ? { macrozona } : {}),
        },
        geometry: feature.geometry,
      };
    })
    .filter((feature): feature is TerritorioGeoFeature => feature != null);

  return { type: "FeatureCollection", features };
}

/** Geometrías locales (archivo GeoJSON + macrozonas derivadas). Solo servidor. */
export function loadFallbackTerritorioGeometrias(): TerritorioGeometrias {
  if (cachedFallback) return cachedFallback;

  const filePath = join(process.cwd(), "src/data/geo/cdmx-alcaldias.geojson");
  const raw = readFileSync(filePath, "utf8");
  const source = JSON.parse(raw) as CdmxAlcaldiaSource;

  cachedFallback = {
    alcaldias: mapAlcaldiasSource(source),
    macrozonas: buildMacrozonasFallback(),
    source: "fallback",
  };

  return cachedFallback;
}
