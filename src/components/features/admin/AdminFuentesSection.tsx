"use client";

import { BookOpen, Plus, SquarePen, Trash2 } from "lucide-react";
import { Button } from "@/components/shared/Button";
import { MobileDataCard, MobileDataRow } from "@/components/shared/MobileDataCard";
import { ResponsiveTable } from "@/components/shared/ResponsiveTable";
import type { AdminControllerState } from "@/hooks/use-admin-controller";
import type { FuenteInformacion } from "@/lib/domain/fuentes-informacion";
import { adminMobileCardList } from "@/lib/theme/admin-table";
import { cn } from "@/lib/utils";

type AdminFuentesSectionProps = {
  fuentes: FuenteInformacion[];
  loading: boolean;
  dataSource: "supabase" | "mock";
  onCreate: AdminControllerState["openCreateFuenteModal"];
  onEdit: AdminControllerState["openEditFuenteModal"];
  onDelete: AdminControllerState["deleteFuente"];
  onRefresh: AdminControllerState["loadFuentes"];
};

const BADGE: Record<FuenteInformacion["tipoEstado"], string> = {
  activo: "bg-emerald-600 text-white",
  api: "bg-sky-600 text-white",
  estatico: "bg-slate-500 text-white",
  procesado: "bg-violet-600 text-white",
};

export function AdminFuentesSection({
  fuentes,
  loading,
  dataSource,
  onCreate,
  onEdit,
  onDelete,
  onRefresh,
}: AdminFuentesSectionProps) {
  return (
    <div className="mt-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-geo-surface text-geo-navy">
            <BookOpen className="h-5 w-5" strokeWidth={2} />
          </div>
          <div>
            <h3 className="font-semibold text-geo-navy">Fuentes de información</h3>
            <p className="mt-0.5 text-sm text-geo-muted">
              Catálogo publicado en Proyecto (`fuentes_informacion`).
            </p>
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
            Nueva fuente
          </Button>
        </div>
      </div>

      {dataSource !== "supabase" && (
        <p className="mt-4 rounded-lg bg-amber-50 px-4 py-2 text-sm text-amber-900">
          Conecta Supabase para gestionar fuentes desde el panel.
        </p>
      )}

      <div className="mt-6 overflow-hidden rounded-xl border border-geo-border bg-geo-card shadow-sm">
        {loading && (
          <p className="border-b border-geo-border px-5 py-2 text-xs text-geo-muted">
            Cargando fuentes…
          </p>
        )}
        <ResponsiveTable
          mobile={
            <div className={adminMobileCardList}>
              {fuentes.map((row, index) => (
                <MobileDataCard
                  key={row.id}
                  title={row.institucion}
                  subtitle={row.dataset}
                  badge={
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold",
                        BADGE[row.tipoEstado],
                      )}
                    >
                      {row.estado}
                    </span>
                  }
                  actions={
                    <div className="flex w-full gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(row, index)}
                        disabled={dataSource !== "supabase"}
                        className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-geo-border text-sm font-medium text-geo-navy hover:bg-geo-surface disabled:opacity-40"
                      >
                        <SquarePen className="h-4 w-4" />
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(row)}
                        disabled={dataSource !== "supabase"}
                        className="inline-flex min-h-11 items-center justify-center rounded-lg px-3 text-red-600 hover:bg-red-50 disabled:opacity-40"
                        aria-label={`Eliminar ${row.institucion}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  }
                />
              ))}
            </div>
          }
        >
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-geo-border bg-geo-surface text-geo-muted">
                <th className="px-5 py-3.5 text-xs font-semibold uppercase">Institución</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase">Dataset</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase">Estado</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {fuentes.map((row, index) => (
                <tr key={row.id} className="border-b border-geo-border last:border-0 hover:bg-geo-hover/60">
                  <td className="px-5 py-4 font-semibold text-geo-navy">{row.institucion}</td>
                  <td className="px-5 py-4 text-geo-muted">{row.dataset}</td>
                  <td className="px-5 py-4">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold",
                        BADGE[row.tipoEstado],
                      )}
                    >
                      {row.estado}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => onEdit(row, index)}
                        disabled={dataSource !== "supabase"}
                        className="rounded-lg p-2 text-geo-muted hover:bg-geo-hover hover:text-geo-navy disabled:opacity-40"
                        aria-label={`Editar ${row.institucion}`}
                      >
                        <SquarePen className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(row)}
                        disabled={dataSource !== "supabase"}
                        className="rounded-lg p-2 text-red-500 hover:bg-red-50 disabled:opacity-40"
                        aria-label={`Eliminar ${row.institucion}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {fuentes.length === 0 && !loading && (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-sm text-geo-muted">
                    No hay fuentes registradas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </ResponsiveTable>
      </div>
    </div>
  );
}
