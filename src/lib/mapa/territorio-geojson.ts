import type { TerritorioFeatureCollection } from "@/lib/domain/territorio-geometrias";

export function parseTerritorioFeatureCollection(value: unknown): TerritorioFeatureCollection {
  if (
    value != null &&
    typeof value === "object" &&
    "type" in value &&
    (value as { type: string }).type === "FeatureCollection" &&
    "features" in value &&
    Array.isArray((value as { features: unknown }).features)
  ) {
    return value as TerritorioFeatureCollection;
  }

  return { type: "FeatureCollection", features: [] };
}
