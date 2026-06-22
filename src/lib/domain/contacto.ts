export type ConsultaContactoInput = {
  nombre: string;
  email: string;
  asunto: string;
  mensaje: string;
};

export type ConsultaContactoEstado =
  | "nuevo"
  | "en_revision"
  | "respondido"
  | "archivado";

export type ConsultaContactoRow = {
  id: string;
  nombre: string;
  email: string;
  asunto: string;
  mensaje: string;
  estado: ConsultaContactoEstado;
  createdAt: string;
  createdAtLabel: string;
};

export const CONSULTA_CONTACTO_ESTADOS: ConsultaContactoEstado[] = [
  "nuevo",
  "en_revision",
  "respondido",
  "archivado",
];

export const CONSULTA_CONTACTO_ESTADO_LABELS: Record<ConsultaContactoEstado, string> = {
  nuevo: "Nuevo",
  en_revision: "En revisión",
  respondido: "Respondido",
  archivado: "Archivado",
};
