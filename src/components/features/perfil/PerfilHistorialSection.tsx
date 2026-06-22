"use client";

import { useState } from "react";
import { Download, FileSpreadsheet } from "lucide-react";
import { HistorialExportMenu } from "@/components/features/reportes/HistorialExportMenu";
import { MobileDataCard, MobileDataRow } from "@/components/shared/MobileDataCard";
import type { PerfilExportacion } from "@/lib/domain/perfil";
import type { EstadoReporte } from "@/lib/domain/reportes";
import { downloadBlob } from "@/lib/utils/download-file";
import { cn } from "@/lib/utils";

type PerfilHistorialSectionProps = {
  exportaciones: PerfilExportacion[];
  dataSource: "supabase" | "mock";
  canManage?: boolean;
  onReload?: () => Promise<unknown>;
};

const formatoStyles: Record<string, string> = {
  PDF: "bg-red-50 text-red-800",
  CSV: "bg-emerald-50 text-emerald-800",
  XLSX: "bg-green-50 text-green-800",
  EXCEL: "bg-green-50 text-green-800",
};

const estadoStyles: Record<EstadoReporte, string> = {
  Publicado: "bg-emerald-100 text-emerald-800",
  Generado: "bg-sky-100 text-sky-800",
  Borrador: "bg-amber-100 text-amber-900",
};

async function descargarExportacion(row: PerfilExportacion) {
  if (!row.canDownload || !row.downloadUrl) return;
  const res = await fetch(row.downloadUrl);
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? "No se pudo descargar el archivo");
  }
  const blob = await res.blob();
  downloadBlob(blob, row.nombreArchivo ?? row.nombre);
}

async function eliminarExportacion(id: string) {
  const res = await fetch(`/api/reportes/eliminar?id=${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  const body = (await res.json().catch(() => null)) as { error?: string } | null;
  if (!res.ok) {
    throw new Error(body?.error ?? "No se pudo eliminar la exportación");
  }
}

export function PerfilHistorialSection({
  exportaciones,
  dataSource,
  canManage = false,
  onReload,
}: PerfilHistorialSectionProps) {
  const [eliminandoId, setEliminandoId] = useState<string | null>(null);

  async function handleDelete(row: PerfilExportacion) {
    if (!canManage) return;
    const confirmed = window.confirm(
      `¿Eliminar "${row.nombre}" del historial? Esta acción no se puede deshacer.`,
    );
    if (!confirmed) return;

    setEliminandoId(row.id);
    try {
      await eliminarExportacion(row.id);
      await onReload?.();
    } catch (err) {
      console.error("[perfil] eliminar exportación:", err);
    } finally {
      setEliminandoId(null);
    }
  }

  return (
    <section aria-labelledby="perfil-historial-titulo">
      <div>
        <h2
          id="perfil-historial-titulo"
          className="text-xl font-bold text-geo-navy sm:text-2xl"
        >
          Historial de exportaciones
        </h2>
        <p className="mt-1 max-w-xl text-sm text-geo-muted">
          {dataSource === "supabase"
            ? "Reportes exportados desde la web o la app móvil, con autor y estado registrados en meta."
            : "Historial disponible al iniciar sesión con Supabase."}
        </p>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {exportaciones.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-geo-muted">
            Aún no hay exportaciones registradas. Genera un reporte en{" "}
            <a href="/reportes" className="font-medium text-geo-pink hover:underline">
              Centro de reportes
            </a>
            .
          </p>
        ) : (
          <>
            <div className="md:hidden divide-y divide-gray-100">
              {exportaciones.map((row) => (
                <MobileDataCard
                  key={row.id}
                  title={row.nombre}
                  subtitle={row.exportadoEl}
                  badge={
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold",
                          formatoStyles[row.formato] ?? "bg-slate-100 text-slate-700",
                        )}
                      >
                        {row.formato}
                      </span>
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold",
                          estadoStyles[row.estado],
                        )}
                      >
                        {row.estado}
                      </span>
                    </div>
                  }
                  actions={
                    <>
                      <button
                        type="button"
                        disabled={!row.canDownload}
                        onClick={() => void descargarExportacion(row).catch(console.error)}
                        className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-geo-border px-3 text-sm font-medium text-geo-navy transition hover:bg-geo-surface disabled:opacity-40"
                      >
                        <Download className="h-4 w-4" />
                        Descargar
                      </button>
                      <HistorialExportMenu
                        titulo={row.nombre}
                        canDownload={row.canDownload}
                        downloadUrl={row.downloadUrl}
                        mobileOnly={row.mobileOnly}
                        canDelete={canManage}
                        deleting={eliminandoId === row.id}
                        onDownload={() => descargarExportacion(row)}
                        onDelete={() => handleDelete(row)}
                      />
                    </>
                  }
                >
                  <MobileDataRow label="Autor" value={row.autor} />
                  <MobileDataRow label="Detalle" value={row.meta} />
                </MobileDataCard>
              ))}
            </div>

            <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[880px] text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-geo-muted">
                  <th className="px-5 py-3.5 font-semibold">Archivo</th>
                  <th className="px-5 py-3.5 font-semibold">Formato</th>
                  <th className="px-5 py-3.5 font-semibold">Estado</th>
                  <th className="px-5 py-3.5 font-semibold">Autor</th>
                  <th className="px-5 py-3.5 font-semibold">Detalle</th>
                  <th className="px-5 py-3.5 font-semibold">Fecha</th>
                  <th className="px-5 py-3.5 font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {exportaciones.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-geo-navy">
                          {row.formato === "PDF" ? (
                            <Download className="h-4 w-4" strokeWidth={1.75} />
                          ) : (
                            <FileSpreadsheet className="h-4 w-4" strokeWidth={1.75} />
                          )}
                        </div>
                        <span
                          className="font-medium text-geo-navy"
                          title={row.nombreArchivo ?? row.nombre}
                        >
                          {row.nombre}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold",
                          formatoStyles[row.formato] ?? "bg-slate-100 text-slate-700",
                        )}
                      >
                        {row.formato}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold",
                          estadoStyles[row.estado],
                        )}
                      >
                        {row.estado}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-geo-muted">{row.autor}</td>
                    <td className="px-5 py-4 text-geo-muted">{row.meta}</td>
                    <td className="px-5 py-4 text-geo-muted">{row.exportadoEl}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={!row.canDownload}
                          title={
                            row.canDownload
                              ? `Descargar ${row.nombre}`
                              : row.mobileOnly
                                ? "Archivo solo en la app móvil"
                                : "Sin archivo descargable"
                          }
                          onClick={() => void descargarExportacion(row).catch(console.error)}
                          className="rounded-lg p-2 text-geo-muted transition-colors hover:bg-geo-surface hover:text-geo-navy disabled:cursor-not-allowed disabled:opacity-40"
                          aria-label={`Descargar ${row.nombre}`}
                        >
                          <Download className="h-4 w-4" strokeWidth={2} />
                        </button>
                        <HistorialExportMenu
                          titulo={row.nombre}
                          canDownload={row.canDownload}
                          downloadUrl={row.downloadUrl}
                          mobileOnly={row.mobileOnly}
                          canDelete={canManage}
                          deleting={eliminandoId === row.id}
                          onDownload={() => descargarExportacion(row)}
                          onDelete={() => handleDelete(row)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
