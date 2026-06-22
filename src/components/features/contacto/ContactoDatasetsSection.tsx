"use client";

import { Database, Download, Info, Loader2 } from "lucide-react";
import { useState } from "react";
import type { DatasetAccent } from "@/lib/data/mock/contacto";
import type { ContactoPageData } from "@/lib/services/contacto.service";
import { downloadBlob } from "@/lib/utils/download-file";
import { parseContentDispositionFilename } from "@/lib/utils/parse-content-disposition";
import { cn } from "@/lib/utils";

const accentStyles: Record<DatasetAccent, string> = {
  blue: "bg-blue-600",
  green: "bg-emerald-600",
  red: "bg-red-600",
  orange: "bg-orange-500",
};

type ContactoDatasetsSectionProps = {
  data: Pick<ContactoPageData, "contactoDatasetsSection" | "datasets">;
};

export function ContactoDatasetsSection({ data }: ContactoDatasetsSectionProps) {
  const { contactoDatasetsSection, datasets } = data;
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function fetchDatasetBlob(id: string): Promise<{
    blob: Blob;
    contentDisposition: string | null;
  }> {
    const maxAttempts = 2;

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      const response = await fetch(`/api/datasets/${id}`, { cache: "no-store" });

      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? `Error ${response.status}`);
      }

      const contentLength = Number(response.headers.get("Content-Length") ?? "0");
      const blob = await response.blob();

      if (blob.size > 0) {
        return {
          blob,
          contentDisposition: response.headers.get("Content-Disposition"),
        };
      }

      if (contentLength > 0) {
        break;
      }

      if (attempt < maxAttempts - 1) {
        await new Promise((resolve) => window.setTimeout(resolve, 900));
      }
    }

    throw new Error(
      "El archivo llegó vacío. Espera a que termine la compilación del servidor e intenta de nuevo.",
    );
  }

  async function handleDownload(id: string, filename: string) {
    setDownloadingId(id);
    setError(null);

    try {
      const { blob, contentDisposition } = await fetchDatasetBlob(id);

      if (id === "reporte") {
        const header = new Uint8Array(await blob.slice(0, 2).arrayBuffer());
        const isZip = header[0] === 0x50 && header[1] === 0x4b;
        if (!isZip) {
          throw new Error(
            "El servidor no devolvió un paquete ZIP válido. Reinicia el servidor de desarrollo e intenta de nuevo.",
          );
        }
      }

      const serverFilename = parseContentDispositionFilename(contentDisposition);
      downloadBlob(blob, serverFilename ?? filename);
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo descargar";
      setError(message);
    } finally {
      setDownloadingId(null);
    }
  }

  return (
    <section id="datasets" className="mt-16 scroll-mt-24">
      <div className="flex items-start gap-3">
        <Database
          className="mt-0.5 h-6 w-6 shrink-0 text-geo-navy"
          strokeWidth={1.75}
          aria-hidden
        />
        <div>
          <h2 className="text-xl font-bold text-geo-navy">
            {contactoDatasetsSection.titulo}
          </h2>
          {contactoDatasetsSection.subtitulo ? (
            <p className="mt-1 max-w-3xl text-sm text-geo-muted">
              {contactoDatasetsSection.subtitulo}
            </p>
          ) : null}
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">
          {error}
        </p>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {datasets.map((d) => {
          const loading = downloadingId === d.id;
          return (
            <div
              key={d.id}
              className="flex flex-col rounded-xl border border-geo-border border-l-4 border-l-geo-navy bg-geo-card p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-lg text-white",
                    accentStyles[d.accent],
                  )}
                >
                  <Download className="h-5 w-5" strokeWidth={2} aria-hidden />
                </div>
                <span className="rounded-full bg-geo-surface px-2.5 py-0.5 text-xs font-medium text-geo-muted">
                  {d.size}
                </span>
              </div>
              <h3 className="mt-4 font-bold text-geo-navy">{d.title}</h3>
              <p className="mt-1 text-sm text-geo-muted">{d.format}</p>
              {d.incluye ? (
                <p className="mt-3 border-t border-geo-border/70 pt-3 text-xs leading-relaxed text-geo-muted">
                  <span className="mb-1 block font-semibold text-geo-navy">Incluye</span>
                  {d.incluye}
                </p>
              ) : null}
              <button
                type="button"
                disabled={loading || downloadingId != null}
                onClick={() => void handleDownload(d.id, d.filename)}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 text-sm font-medium text-geo-pink transition hover:text-geo-pink-hover hover:underline disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    Generando…
                  </>
                ) : (
                  contactoDatasetsSection.btnDescargar
                )}
              </button>
            </div>
          );
        })}
      </div>

      {contactoDatasetsSection.nota ? (
        <p className="mt-6 flex gap-2.5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-950">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" strokeWidth={2.25} aria-hidden />
          <span>{contactoDatasetsSection.nota}</span>
        </p>
      ) : null}
    </section>
  );
}
