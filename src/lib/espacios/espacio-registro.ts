import type { EstadoEspacio } from "@/lib/domain/admin";

/** Valores por defecto al publicar desde el flujo editorial. */
export const ESPACIO_HORARIO_PENDIENTE = "Por confirmar";
export const ESPACIO_TELEFONO_PENDIENTE = "No registrado";

export type EspacioRegistroInput = {
  latitud?: number | null;
  longitud?: number | null;
  horario?: string | null;
  telefono?: string | null;
};

/** Estado editorial del registro (misma lógica que administración). */
export function deriveEstadoEspacio(row: EspacioRegistroInput): EstadoEspacio {
  const hasCoords =
    row.latitud != null &&
    row.longitud != null &&
    Number.isFinite(row.latitud) &&
    Number.isFinite(row.longitud);

  if (!hasCoords) return "Borrador";

  const hasHorario = (row.horario?.trim() ?? "") !== "";
  const hasTelefono = (row.telefono?.trim() ?? "") !== "";

  if (!hasHorario || !hasTelefono) return "Revisión";
  return "Publicado";
}

function hasCoordenadas(row: EspacioRegistroInput): boolean {
  return (
    row.latitud != null &&
    row.longitud != null &&
    Number.isFinite(row.latitud) &&
    Number.isFinite(row.longitud)
  );
}

/** Motivo por el que no se puede publicar; `null` si está listo. */
export function getEspacioPublishBlocker(row: EspacioRegistroInput): string | null {
  if (!hasCoordenadas(row)) {
    return "Asigna coordenadas WGS84 en el editor cartográfico antes de publicar.";
  }
  return null;
}

/** Horario y teléfono listos para estado Publicado (rellena pendientes). */
export function resolveCamposPublicacion(row: EspacioRegistroInput): {
  horario: string;
  telefono: string;
} {
  const horario = (row.horario?.trim() ?? "") !== "" ? row.horario!.trim() : ESPACIO_HORARIO_PENDIENTE;
  const telefono =
    (row.telefono?.trim() ?? "") !== "" ? row.telefono!.trim() : ESPACIO_TELEFONO_PENDIENTE;
  return { horario, telefono };
}

/** Índice 0–100 según completitud del padrón SECTEI (coordenadas, horario, teléfono). */
export function computeCompletitudRegistro(row: EspacioRegistroInput): number {
  let score = 0;
  const hasCoords =
    row.latitud != null &&
    row.longitud != null &&
    Number.isFinite(row.latitud) &&
    Number.isFinite(row.longitud);
  if (hasCoords) score += 50;
  if ((row.horario?.trim() ?? "") !== "") score += 25;
  if ((row.telefono?.trim() ?? "") !== "") score += 25;
  return score;
}
