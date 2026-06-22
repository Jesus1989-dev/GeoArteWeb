import type { AdminEspacioFormInput } from "@/lib/domain/admin";

export type EspacioDbPayload = {
  nombre: string;
  direccion: string | null;
  alcaldia: string;
  tipo: string | null;
  horario: string | null;
  telefono: string | null;
  latitud: number | null;
  longitud: number | null;
  descripcion: string | null;
};

function parseCoord(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = typeof value === "number" ? value : Number.parseFloat(String(value));
  return Number.isFinite(n) ? n : null;
}

export function normalizeEspacioFormInput(
  input: AdminEspacioFormInput,
): { payload: EspacioDbPayload; error?: string } {
  const nombre = input.nombre?.trim() ?? "";
  if (!nombre) {
    return { payload: {} as EspacioDbPayload, error: "El nombre es obligatorio" };
  }

  const alcaldia = input.alcaldia?.trim() ?? "";
  if (!alcaldia) {
    return { payload: {} as EspacioDbPayload, error: "La alcaldía es obligatoria" };
  }

  const latitud = parseCoord(input.latitud);
  const longitud = parseCoord(input.longitud);

  if (
    (latitud != null && longitud == null) ||
    (latitud == null && longitud != null)
  ) {
    return {
      payload: {} as EspacioDbPayload,
      error: "Indica latitud y longitud juntas, o déjalas vacías",
    };
  }

  if (latitud != null && (latitud < -90 || latitud > 90)) {
    return { payload: {} as EspacioDbPayload, error: "Latitud fuera de rango" };
  }

  if (longitud != null && (longitud < -180 || longitud > 180)) {
    return { payload: {} as EspacioDbPayload, error: "Longitud fuera de rango" };
  }

  const trimOrNull = (v?: string) => {
    const t = v?.trim() ?? "";
    return t === "" ? null : t;
  };

  return {
    payload: {
      nombre,
      direccion: trimOrNull(input.direccion),
      alcaldia,
      tipo: trimOrNull(input.tipo),
      horario: trimOrNull(input.horario),
      telefono: trimOrNull(input.telefono),
      latitud,
      longitud,
      descripcion: trimOrNull(input.descripcion),
    },
  };
}
