"use client";

import Link from "next/link";
import { Layers, Plus, SquarePen, Trash2 } from "lucide-react";
import { Button } from "@/components/shared/Button";
import { MobileDataCard, MobileDataRow } from "@/components/shared/MobileDataCard";
import { ResponsiveTable } from "@/components/shared/ResponsiveTable";
import type { AdminControllerState } from "@/hooks/use-admin-controller";
import type { AdminPageData } from "@/lib/services/admin.service";
import { adminMobileCardList } from "@/lib/theme/admin-table";
import { cn } from "@/lib/utils";

type AdminCapasSectionProps = {
  meta: AdminPageData["adminCapasSigMeta"];
  capas: AdminControllerState["capas"];
  loading: boolean;
  dataSource: AdminPageData["dataSource"];
  onCreate: AdminControllerState["openCreateCapaModal"];
  onEdit: AdminControllerState["openEditCapaModal"];
  onDelete: AdminControllerState["deleteCapa"];
  onRefresh: AdminControllerState["loadCapas"];
};

const estadoStyles = {
  Activa: "bg-emerald-50 text-emerald-800",
  Revisión: "bg-amber-50 text-amber-800",
  Borrador: "bg-slate-100 text-geo-muted",
} as const;

export function AdminCapasSection({
  meta,
  capas,
  loading,
  dataSource,
  onCreate,
  onEdit,
  onDelete,
  onRefresh,
}: AdminCapasSectionProps) {
  return (
    <section className="mt-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3 text-geo-navy">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-geo-border bg-geo-surface">
            <Layers size={20} color="var(--geo-navy)" strokeWidth={2} aria-hidden />
          </div>
          <div>
            <h2 className="text-lg font-medium leading-tight">{meta.titulo}</h2>
            <p className="mt-1 text-sm text-geo-muted">{meta.subtitulo}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            size="md"
            onClick={onRefresh}
            disabled={loading || dataSource !== "supabase"}
            className="border border-geo-border"
          >
            Actualizar
          </Button>
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={onCreate}
            disabled={dataSource !== "supabase"}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            {meta.btnNuevaCapa}
          </Button>
        </div>
      </div>

      {dataSource !== "supabase" && (
        <p className="mt-4 rounded-lg bg-amber-50 px-4 py-2 text-sm text-amber-900">
          Conecta Supabase para gestionar tipologías SIC desde el panel.
        </p>
      )}

      <div className="mt-6 overflow-hidden rounded-xl border border-geo-border bg-geo-card shadow-sm">
        {loading && (
          <p className="border-b border-geo-border px-4 py-2 text-xs text-geo-muted">
            Cargando capas…
          </p>
        )}
        <ResponsiveTable
          mobile={
            <div className={adminMobileCardList}>
              {capas.map((capa) => (
                <MobileDataCard
                  key={capa.fullId}
                  title={capa.nombre}
                  subtitle={capa.id}
                  badge={
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
                        estadoStyles[capa.estado],
                      )}
                    >
                      {capa.estado}
                    </span>
                  }
                  actions={
                    <div className="flex w-full gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(capa)}
                        disabled={dataSource !== "supabase"}
                        className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-geo-border text-sm font-medium text-geo-navy hover:bg-geo-surface disabled:opacity-40"
                      >
                        <SquarePen className="h-4 w-4" />
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(capa)}
                        disabled={dataSource !== "supabase" || capa.espaciosVinculados > 0}
                        className="inline-flex min-h-11 items-center justify-center rounded-lg px-3 text-red-500 hover:bg-red-50 disabled:opacity-40"
                        aria-label={`Eliminar ${capa.nombre}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  }
                >
                  <MobileDataRow
                    label="Espacios"
                    value={capa.espaciosVinculados.toLocaleString("es-MX")}
                  />
                  <MobileDataRow label="Formato" value={capa.formato} />
                  <MobileDataRow label="Orden" value={capa.orden} />
                  <MobileDataRow label="Actualización" value={capa.actualizacion} />
                </MobileDataCard>
              ))}
            </div>
          }
        >
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-geo-border bg-geo-surface/60 text-xs font-semibold uppercase tracking-wide text-geo-muted">
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Espacios</th>
                <th className="px-4 py-3">Formato</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Orden</th>
                <th className="px-4 py-3">Actualización</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {capas.map((capa) => (
                <tr
                  key={capa.fullId}
                  className="border-b border-geo-border last:border-0 hover:bg-geo-surface/40"
                >
                  <td className="px-4 py-3 font-mono text-xs text-geo-muted">{capa.id}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-geo-navy">{capa.nombre}</p>
                    {capa.descripcion && (
                      <p className="mt-0.5 line-clamp-1 text-xs text-geo-muted">
                        {capa.descripcion}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-geo-muted">
                    {capa.espaciosVinculados.toLocaleString("es-MX")}
                  </td>
                  <td className="px-4 py-3 text-geo-muted">{capa.formato}</td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
                        estadoStyles[capa.estado],
                      )}
                    >
                      {capa.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-geo-muted">{capa.orden}</td>
                  <td className="px-4 py-3 text-geo-muted">{capa.actualizacion}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => onEdit(capa)}
                        disabled={dataSource !== "supabase"}
                        className="rounded-lg p-2 text-geo-muted hover:bg-geo-hover hover:text-geo-navy disabled:opacity-40"
                        aria-label={`Editar ${capa.nombre}`}
                      >
                        <SquarePen className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(capa)}
                        disabled={dataSource !== "supabase" || capa.espaciosVinculados > 0}
                        className="rounded-lg p-2 text-red-500 hover:bg-red-50 disabled:opacity-40"
                        aria-label={`Eliminar ${capa.nombre}`}
                        title={
                          capa.espaciosVinculados > 0
                            ? "Hay espacios vinculados a esta tipología"
                            : undefined
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {capas.length === 0 && !loading && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-sm text-geo-muted">
                    No hay tipologías registradas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </ResponsiveTable>
      </div>

      <p className="mt-4 text-sm text-geo-muted">
        Las tipologías se publican en el{" "}
        <Link href="/mapa" className="font-medium text-geo-pink hover:underline">
          mapa interactivo
        </Link>
        . No se pueden eliminar si tienen espacios culturales asociados.
      </p>
    </section>
  );
}
