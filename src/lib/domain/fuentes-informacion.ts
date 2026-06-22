export type FuenteInformacionTipoEstado = "activo" | "estatico" | "api" | "procesado";

export type FuenteInformacion = {
  id: string;
  institucion: string;
  dataset: string;
  estado: string;
  tipoEstado: FuenteInformacionTipoEstado;
  urlFuente: string | null;
  ultimaSincronizacion: string | null;
};
