import { parseExportMeta, type ExportDownloadMeta } from "@/lib/reportes/export-meta";
import {
  exportFileExists,
  resolveExportStoragePath,
} from "@/lib/reportes/export-storage";

export type ExportDownloadAvailability = {
  canDownload: boolean;
  downloadUrl: string | null;
  mobileOnly: boolean;
  downloadUnavailableReason?: string;
};

const MOBILE_ONLY_REASON =
  "Generado en la app móvil; descárgalo desde el dispositivo donde lo creaste.";
const MISSING_FILE_REASON = "El archivo ya no está disponible en almacenamiento web.";

function buildDownloadUrl(exportId: string): string {
  return `/api/reportes/descargar?id=${encodeURIComponent(exportId)}`;
}

export function resolveExportDownloadSync(
  exportId: string,
  parsed: ExportDownloadMeta | null,
): ExportDownloadAvailability {
  if (exportId.startsWith("local-")) {
    return {
      canDownload: false,
      downloadUrl: null,
      mobileOnly: false,
      downloadUnavailableReason: "Generado en modo demo local (sin copia en la nube).",
    };
  }

  if (parsed?.storagePath?.trim()) {
    return {
      canDownload: true,
      downloadUrl: buildDownloadUrl(exportId),
      mobileOnly: false,
    };
  }

  const mobileOnly = parsed?.source === "mobile";
  return {
    canDownload: false,
    downloadUrl: null,
    mobileOnly,
    downloadUnavailableReason: mobileOnly
      ? MOBILE_ONLY_REASON
      : "Sin copia descargable en la nube web.",
  };
}

export async function resolveExportDownloadServer(input: {
  exportId: string;
  userId: string;
  fileName: string | null | undefined;
  meta: string | null;
}): Promise<ExportDownloadAvailability> {
  const parsed = parseExportMeta(input.meta);
  const sync = resolveExportDownloadSync(input.exportId, parsed);

  if (sync.canDownload || input.exportId.startsWith("local-")) {
    return sync;
  }

  const storagePath = resolveExportStoragePath({
    parsed,
    userId: input.userId,
    exportId: input.exportId,
    fileName: input.fileName,
  });

  if (!storagePath) {
    return sync;
  }

  const exists = await exportFileExists(storagePath);
  if (exists) {
    return {
      canDownload: true,
      downloadUrl: buildDownloadUrl(input.exportId),
      mobileOnly: false,
    };
  }

  return {
    canDownload: false,
    downloadUrl: null,
    mobileOnly: parsed?.source === "mobile",
    downloadUnavailableReason:
      parsed?.source === "mobile" ? MOBILE_ONLY_REASON : MISSING_FILE_REASON,
  };
}
