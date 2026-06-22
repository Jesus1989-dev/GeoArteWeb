import type { LatLngExpression } from "leaflet";

export type MetroLineaReferencia = {
  id: string;
  nombre: string;
  color: string;
  coords: LatLngExpression[];
};

/** Corredores simplificados de referencia (no geometría oficial). */
export const METRO_LINEAS_REFERENCIA: MetroLineaReferencia[] = [
  {
    id: "l1",
    nombre: "Línea 1 (Observatorio — Pantitlán)",
    color: "#e10599",
    coords: [
      [19.3986, -99.2007],
      [19.4112, -99.1771],
      [19.4259, -99.1675],
      [19.4352, -99.1412],
      [19.4421, -99.1265],
      [19.4482, -99.1135],
      [19.4588, -99.0852],
    ],
  },
  {
    id: "l2",
    nombre: "Línea 2 (Cuatro Caminos — Tasqueña)",
    color: "#005eb8",
    coords: [
      [19.4598, -99.2151],
      [19.4495, -99.1968],
      [19.4352, -99.1412],
      [19.425, -99.1302],
      [19.4035, -99.1365],
      [19.3852, -99.1418],
    ],
  },
  {
    id: "l3",
    nombre: "Línea 3 (Indios Verdes — Universidad)",
    color: "#a0892c",
    coords: [
      [19.4955, -99.1198],
      [19.4721, -99.1255],
      [19.4521, -99.1375],
      [19.4352, -99.1412],
      [19.4112, -99.1648],
      [19.3852, -99.1621],
      [19.3321, -99.1862],
    ],
  },
  {
    id: "mb1",
    nombre: "Metrobús L1 (referencia)",
    color: "#c41e3a",
    coords: [
      [19.5042, -99.1465],
      [19.4855, -99.1321],
      [19.4621, -99.1255],
      [19.4352, -99.1412],
      [19.4112, -99.1648],
      [19.3852, -99.1771],
    ],
  },
];
