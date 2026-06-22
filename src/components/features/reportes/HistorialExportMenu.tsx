"use client";

import { useEffect, useRef, useState } from "react";
import { Copy, Download, MoreHorizontal, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

type HistorialExportMenuProps = {
  titulo: string;
  canDownload: boolean;
  downloadUrl: string | null;
  mobileOnly?: boolean;
  downloadUnavailableReason?: string;
  canDelete?: boolean;
  deleting?: boolean;
  onDownload: () => void | Promise<void>;
  onDelete?: () => void | Promise<void>;
};

export function HistorialExportMenu({
  titulo,
  canDownload,
  downloadUrl,
  mobileOnly = false,
  downloadUnavailableReason,
  canDelete = true,
  deleting = false,
  onDownload,
  onDelete,
}: HistorialExportMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  async function handleCopyLink() {
    if (!downloadUrl) return;
    const url =
      typeof window !== "undefined"
        ? new URL(downloadUrl, window.location.origin).toString()
        : downloadUrl;
    await navigator.clipboard.writeText(url);
    setOpen(false);
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        disabled={deleting}
        onClick={() => setOpen((value) => !value)}
        className="rounded-lg p-2 text-geo-muted transition-colors hover:bg-geo-surface hover:text-geo-navy disabled:opacity-50"
        aria-label={`Más opciones para ${titulo}`}
        aria-expanded={open}
      >
        <MoreHorizontal className="h-4 w-4" strokeWidth={2} />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full z-20 mt-1 min-w-[12rem] overflow-hidden rounded-lg border border-geo-border bg-geo-card py-1 shadow-lg"
          role="menu"
        >
          <button
            type="button"
            role="menuitem"
            disabled={!canDownload}
            onClick={() => {
              setOpen(false);
              void onDownload();
            }}
            className={cn(
              "flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-geo-navy hover:bg-geo-surface",
              !canDownload && "cursor-not-allowed opacity-50",
            )}
          >
            <Download className="h-4 w-4 shrink-0" />
            Descargar
          </button>

          <button
            type="button"
            role="menuitem"
            disabled={!canDownload}
            onClick={() => void handleCopyLink()}
            className={cn(
              "flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-geo-navy hover:bg-geo-surface",
              !canDownload && "cursor-not-allowed opacity-50",
            )}
          >
            <Copy className="h-4 w-4 shrink-0" />
            Copiar enlace
          </button>

          {mobileOnly && (
            <p className="border-t border-geo-border px-3 py-2 text-xs text-geo-muted">
              {downloadUnavailableReason ??
                "Archivo generado en la app móvil; no hay copia en la nube web."}
            </p>
          )}

          {canDelete && onDelete && (
            <button
              type="button"
              role="menuitem"
              disabled={deleting}
              onClick={() => {
                setOpen(false);
                void onDelete();
              }}
              className="flex w-full items-center gap-2 border-t border-geo-border px-3 py-2 text-left text-sm text-red-700 hover:bg-red-50 disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4 shrink-0" />
              {deleting ? "Eliminando…" : "Eliminar del historial"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
