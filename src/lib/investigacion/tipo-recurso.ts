import type { TipoRecurso, TipoRecursoDb, TranscripcionBloque } from "@/lib/domain/investigacion";

const TIPO_TO_DB: Record<TipoRecurso, TipoRecursoDb> = {
  Entrevista: "entrevista",
  Encuesta: "encuesta",
  "Grupo focal": "grupo_focal",
};

const DB_TO_TIPO: Record<TipoRecursoDb, TipoRecurso> = {
  entrevista: "Entrevista",
  encuesta: "Encuesta",
  grupo_focal: "Grupo focal",
};

export function tipoRecursoToDb(tipo: TipoRecurso): TipoRecursoDb {
  return TIPO_TO_DB[tipo];
}

export function tipoRecursoFromDb(raw: string): TipoRecurso | null {
  return raw in DB_TO_TIPO ? DB_TO_TIPO[raw as TipoRecursoDb] : null;
}

export function parseTranscripcion(raw: unknown): TranscripcionBloque[] {
  if (!Array.isArray(raw)) return [];
  const out: TranscripcionBloque[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const rol = (item as { rol?: string }).rol;
    const texto = String((item as { texto?: string }).texto ?? "").trim();
    if ((rol === "Investigador" || rol === "Informante") && texto) {
      out.push({ rol, texto });
    }
  }
  return out;
}
