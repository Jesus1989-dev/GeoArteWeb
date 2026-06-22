/** Extrae el nombre de archivo de un header Content-Disposition. */
export function parseContentDispositionFilename(
  header: string | null,
): string | null {
  if (!header) return null;

  const utf8Match = /filename\*=UTF-8''([^;]+)/i.exec(header);
  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1].trim());
    } catch {
      return utf8Match[1].trim();
    }
  }

  const quotedMatch = /filename="([^"]+)"/i.exec(header);
  if (quotedMatch?.[1]) return quotedMatch[1].trim();

  const plainMatch = /filename=([^;]+)/i.exec(header);
  return plainMatch?.[1]?.trim().replace(/^"|"$/g, "") ?? null;
}
