export type PerfilEspacioGuardado = {
  id: string;
  nombre: string;
  alcaldia: string;
  tipo: string;
  guardadoEl: string;
  href: string;
};

export type PerfilStat = {
  label: string;
  value: string;
  accent: "navy" | "pink";
};

export type PerfilFiltroOpcion = {
  value: string;
  label: string;
};

export type PerfilExportacion = {
  id: string;
  nombre: string;
  /** Nombre de archivo original (descarga). */
  nombreArchivo?: string;
  formato: string;
  meta: string;
  exportadoEl: string;
  autor: string;
  estado: "Publicado" | "Generado" | "Borrador";
  canDownload: boolean;
  downloadUrl: string | null;
  mobileOnly: boolean;
  downloadUnavailableReason?: string;
};
