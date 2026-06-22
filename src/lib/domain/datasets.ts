export const CONTACTO_DATASET_IDS = [
  "espacios",
  "indicadores",
  "reporte",
  "api-backup",
] as const;

export type ContactoDatasetId = (typeof CONTACTO_DATASET_IDS)[number];

export type ContactoDatasetFile = {
  body: Uint8Array | string;
  contentType: string;
  filename: string;
};

export function isContactoDatasetId(value: string): value is ContactoDatasetId {
  return (CONTACTO_DATASET_IDS as readonly string[]).includes(value);
}
