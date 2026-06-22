import type { EstadoEspacio } from "@/lib/domain/admin";
import type { EspacioTablaRow } from "@/lib/domain/dashboard";
import type { EspacioRawRow } from "@/lib/dashboard/apply-dashboard-filters";
import {
  computeCompletitudRegistro,
  deriveEstadoEspacio,
} from "@/lib/espacios/espacio-registro";
import { formatCsvDocument, formatCsvRow } from "@/lib/utils/csv";

/** Fila completa del padrón para exportación (CSV / JSON / GeoJSON). */
export type EspacioPadronExportRow = {
  id: string;
  idCorto: string;
  nombre: string;
  tipologia: string;
  alcaldia: string;
  direccion: string | null;
  descripcion: string | null;
  horario: string | null;
  telefono: string | null;
  latitud: number | null;
  longitud: number | null;
  completitudPorcentaje: number;
  estado: EstadoEspacio;
  fechaFundacion: string | null;
  sicFechaModificacion: string | null;
  createdAt: string | null;
};

export const PADRON_EXPORT_COLUMNAS = [
  { clave: "id", etiqueta: "ID del espacio" },
  { clave: "id_corto", etiqueta: "ID corto (vista tabla)" },
  { clave: "nombre", etiqueta: "Nombre" },
  { clave: "tipologia", etiqueta: "Tipología SIC" },
  { clave: "alcaldia", etiqueta: "Alcaldía" },
  { clave: "direccion", etiqueta: "Dirección" },
  { clave: "descripcion", etiqueta: "Descripción" },
  { clave: "horario", etiqueta: "Horario" },
  { clave: "telefono", etiqueta: "Teléfono" },
  { clave: "latitud", etiqueta: "Latitud (WGS84)" },
  { clave: "longitud", etiqueta: "Longitud (WGS84)" },
  { clave: "completitud_porcentaje", etiqueta: "Completitud (%)" },
  { clave: "estado", etiqueta: "Estado editorial" },
  { clave: "fecha_fundacion", etiqueta: "Fecha de fundación (SIC)" },
  { clave: "sic_fecha_modificacion", etiqueta: "Última modificación SIC" },
  { clave: "created_at", etiqueta: "Alta en GeoARTE" },
] as const;

const CSV_HEADERS = PADRON_EXPORT_COLUMNAS.map((c) => c.etiqueta);

function normalizeExportDate(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function padronRowToSheetValues(row: EspacioPadronExportRow): (string | number)[] {
  return [
    row.id,
    row.idCorto,
    row.nombre,
    row.tipologia,
    row.alcaldia,
    row.direccion ?? "",
    row.descripcion ?? "",
    row.horario ?? "",
    row.telefono ?? "",
    row.latitud ?? "",
    row.longitud ?? "",
    row.completitudPorcentaje,
    row.estado,
    row.fechaFundacion ?? "",
    row.sicFechaModificacion ?? "",
    row.createdAt ?? "",
  ];
}

export function buildEspaciosPadronExportRows(
  espacios: EspacioRawRow[],
): EspacioPadronExportRow[] {
  return [...espacios]
    .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"))
    .map((row) => ({
      id: row.id,
      idCorto: row.id.slice(0, 8).toUpperCase(),
      nombre: row.nombre,
      tipologia: row.tipo,
      alcaldia: row.alcaldia,
      direccion: row.direccion,
      descripcion: row.descripcion,
      horario: row.horario?.trim() ? row.horario.trim() : null,
      telefono: row.telefono?.trim() ? row.telefono.trim() : null,
      latitud: row.latitud,
      longitud: row.longitud,
      completitudPorcentaje: computeCompletitudRegistro(row),
      estado: deriveEstadoEspacio(row),
      fechaFundacion: normalizeExportDate(row.fecha_fundacion),
      sicFechaModificacion: normalizeExportDate(row.sic_fecha_modificacion),
      createdAt: normalizeExportDate(row.created_at),
    }));
}

/** Convierte filas de tabla (mock) al formato de exportación. */
export function padronExportFromTablaRows(
  tabla: EspacioTablaRow[],
): EspacioPadronExportRow[] {
  return tabla.map((row) => ({
    id: row.id,
    idCorto: row.id.length > 8 ? row.id.slice(0, 8).toUpperCase() : row.id,
    nombre: row.nombre,
    tipologia: "",
    alcaldia: row.alcaldia,
    direccion: null,
    descripcion: null,
    horario: null,
    telefono: null,
    latitud: row.lat,
    longitud: row.lng,
    completitudPorcentaje: row.completitud,
    estado: row.estado,
    fechaFundacion: null,
    sicFechaModificacion: null,
    createdAt: null,
  }));
}

export function padronRowToJsonRecord(row: EspacioPadronExportRow) {
  return {
    id: row.id,
    id_corto: row.idCorto,
    nombre: row.nombre,
    tipologia: row.tipologia,
    alcaldia: row.alcaldia,
    direccion: row.direccion,
    descripcion: row.descripcion,
    horario: row.horario,
    telefono: row.telefono,
    latitud: row.latitud,
    longitud: row.longitud,
    completitud_porcentaje: row.completitudPorcentaje,
    estado: row.estado,
    fecha_fundacion: row.fechaFundacion,
    sic_fecha_modificacion: row.sicFechaModificacion,
    created_at: row.createdAt,
  };
}

/** Filas para la hoja «Espacios» de exportaciones Excel del padrón. */
export function buildPadronEspaciosSheetAoa(
  rows: EspacioPadronExportRow[],
): (string | number)[][] {
  return [
    PADRON_EXPORT_COLUMNAS.map((c) => c.etiqueta),
    ...rows.map((row) => padronRowToSheetValues(row)),
  ];
}

export function buildPadronEspaciosCsv(rows: EspacioPadronExportRow[]): string {
  const lines = [
    formatCsvRow(CSV_HEADERS),
    ...rows.map((row) => formatCsvRow(padronRowToSheetValues(row))),
  ];
  return formatCsvDocument(lines);
}

export type PadronEspaciosJsonPayload = {
  meta: {
    titulo: string;
    version: string;
    exportadoEn: string;
    totalRegistros: number;
    filtros: {
      resumen: string;
      alcaldia: string;
      disciplina: string;
      periodo: string;
      nivelSocioeconomico: string;
      rangoEdad: string;
      genero: string;
      anioCorte: number;
    };
    aviso: string | null;
    columnas: typeof PADRON_EXPORT_COLUMNAS;
  };
  espacios: ReturnType<typeof padronRowToJsonRecord>[];
};

export function buildPadronEspaciosJson(input: {
  rows: EspacioPadronExportRow[];
  filterSummary: string;
  filterNotice: string | null;
  territorio: string;
  disciplina: string;
  periodo: string;
  nse: string;
  edad: string;
  genero: string;
  anioCorte: number;
}): string {
  const payload: PadronEspaciosJsonPayload = {
    meta: {
      titulo: "Padrón de espacios culturales — GeoArte CDMX",
      version: "1.0",
      exportadoEn: new Date().toISOString(),
      totalRegistros: input.rows.length,
      filtros: {
        resumen: input.filterSummary,
        alcaldia: input.territorio,
        disciplina: input.disciplina,
        periodo: input.periodo,
        nivelSocioeconomico: input.nse,
        rangoEdad: input.edad,
        genero: input.genero,
        anioCorte: input.anioCorte,
      },
      aviso: input.filterNotice,
      columnas: PADRON_EXPORT_COLUMNAS,
    },
    espacios: input.rows.map(padronRowToJsonRecord),
  };
  return JSON.stringify(payload, null, 2);
}

export function buildPadronEspaciosGeoJson(input: {
  rows: EspacioPadronExportRow[];
  filterSummary: string;
}): string {
  const features = input.rows.map((row) => {
    const hasGeom =
      row.latitud != null &&
      row.longitud != null &&
      Number.isFinite(row.latitud) &&
      Number.isFinite(row.longitud);

    return {
      type: "Feature" as const,
      geometry: hasGeom
        ? {
            type: "Point" as const,
            coordinates: [row.longitud, row.latitud],
          }
        : null,
      properties: padronRowToJsonRecord(row),
    };
  });

  return JSON.stringify(
    {
      type: "FeatureCollection" as const,
      metadata: {
        titulo: "Padrón de espacios culturales — GeoArte CDMX",
        filterSummary: input.filterSummary,
        exportadoEn: new Date().toISOString(),
        totalFeatures: features.length,
        conGeometria: features.filter((f) => f.geometry != null).length,
        columnas: PADRON_EXPORT_COLUMNAS,
      },
      features,
    },
    null,
    2,
  );
}
