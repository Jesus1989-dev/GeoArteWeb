/** Normaliza nombres de alcaldía para joins tolerantes a acentos y variantes. */
export function normAlcaldia(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim();
}
