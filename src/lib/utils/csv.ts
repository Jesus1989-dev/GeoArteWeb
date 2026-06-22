/** Separador estándar para que Excel (doble clic) abra columnas correctamente. */
export const CSV_FIELD_SEPARATOR = ",";

export function escapeCsvCell(value: string | number | null | undefined): string {
  const text = value == null ? "" : String(value);
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export function formatCsvRow(cells: Array<string | number | null | undefined>): string {
  return cells.map(escapeCsvCell).join(CSV_FIELD_SEPARATOR);
}

/** Documento CSV con BOM UTF-8 para Excel en Windows. */
export function formatCsvDocument(lines: string[]): string {
  return `\uFEFF${lines.join("\r\n")}`;
}
