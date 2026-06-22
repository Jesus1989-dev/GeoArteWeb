import type { LatLngExpression } from "leaflet";

/** Polígonos aproximados de macrozonas CDMX (referencia cartográfica). */
export const MACROZONA_POLYGONS: Record<string, LatLngExpression[]> = {
  NORTE: [
    [19.52, -99.22],
    [19.52, -99.05],
    [19.48, -99.02],
    [19.46, -99.12],
    [19.46, -99.22],
    [19.52, -99.22],
  ],
  CENTRO: [
    [19.46, -99.22],
    [19.46, -99.05],
    [19.4, -99.05],
    [19.4, -99.22],
    [19.46, -99.22],
  ],
  PONIENTE: [
    [19.46, -99.32],
    [19.46, -99.22],
    [19.38, -99.22],
    [19.38, -99.32],
    [19.46, -99.32],
  ],
  ORIENTE: [
    [19.46, -99.05],
    [19.46, -98.97],
    [19.3, -98.97],
    [19.3, -99.05],
    [19.46, -99.05],
  ],
  SUR: [
    [19.4, -99.22],
    [19.4, -99.05],
    [19.28, -99.05],
    [19.28, -99.22],
    [19.4, -99.22],
  ],
};

export const MACROZONA_LABELS: Record<string, string> = {
  NORTE: "Norte",
  CENTRO: "Centro",
  SUR: "Sur",
  PONIENTE: "Poniente",
  ORIENTE: "Oriente",
};
