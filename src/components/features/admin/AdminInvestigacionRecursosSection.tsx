"use client";

import { ClipboardList, Plus, SquarePen, ToggleLeft, ToggleRight } from "lucide-react";
import { Button } from "@/components/shared/Button";
import { MobileDataCard, MobileDataRow } from "@/components/shared/MobileDataCard";
import { ResponsiveTable } from "@/components/shared/ResponsiveTable";
import type { AdminControllerState } from "@/hooks/use-admin-controller";
import type { AdminRecursoCualitativoRow } from "@/lib/domain/admin";
import type { TipoRecursoDb } from "@/lib/domain/investigacion";
import { adminMobileCardList } from "@/lib/theme/admin-table";
import { cn } from "@/lib/utils";

const TIPO_LABEL: Record<TipoRecursoDb, string> = {
  entrevista: "Entrevista",
  encuesta: "Encuesta",
  grupo_focal: "Grupo focal",
};

type AdminInvestigacionRecursosSectionProps = {
  recursos: AdminRecursoCualitativoRow[];
  loading: boolean;
  dataSource: "supabase" | "mock";
  onCreate: AdminControllerState["openCreateRecursoModal"];
  onEdit: AdminControllerState["openEditRecursoModal"];
  onToggleActivo: AdminControllerState["toggleRecursoActivo"];
  onRefresh: AdminControllerState["loadRecursosCualitativos"];
};

export function AdminInvestigacionRecursosSection({
  recursos,
  loading,
  dataSource,
  onCreate,
  onEdit,
  onToggleActivo,
  onRefresh,
}: AdminInvestigacionRecursosSectionProps) {
  const activos = recursos.filter((r) => r.activo).length;

  return (
    <div className="mt-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-geo-surface text-geo-navy">
            <ClipboardList className="h-5 w-5" strokeWidth={2} />
          </div>
          <div>
            <h3 className="font-semibold text-geo-navy">Repositorio cualitativo</h3>
            <p className="mt-0.5 text-sm text-geo-muted">
              Catálogo publicado en `/investigacion` (`recursos_cualitativos`). {activos}{" "}
              activos de {recursos.length}.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            href="/investigacion"
            variant="ghost"
            size="md"
            className="border border-geo-border"
          >
            Ver repositorio público
          </Button>
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
            Nuevo recurso
          </Button>
        </div>
      </div>

      {dataSource !== "supabase" && (
        <p className="mt-4 rounded-lg bg-amber-50 px-4 py-2 text-sm text-amber-900">
          Conecta Supabase y usa rol Autoridad para gestionar el repositorio desde el panel.
        </p>
      )}

      <div className="mt-6 overflow-hidden rounded-xl border border-geo-border bg-geo-card shadow-sm">
        {loading && (
          <p className="border-b border-geo-border px-5 py-2 text-xs text-geo-muted">
            Cargando recursos…
          </p>
        )}
        <ResponsiveTable
          mobile={
            <div className={adminMobileCardList}>
              {recursos.map((row) => (
                <MobileDataCard
                  key={row.id}
                  title={row.titulo}
                  subtitle={row.id}
                  badge={
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                        row.activo
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-200 text-slate-600",
                      )}
                    >
                      {row.activo ? "Activo" : "Inactivo"}
                    </span>
                  }
                  actions={
                    <div className="flex w-full gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(row)}
                        disabled={dataSource !== "supabase"}
                        className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-geo-border text-sm font-medium text-geo-navy hover:bg-geo-surface disabled:opacity-40"
                      >
                        <SquarePen className="h-4 w-4" />
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => onToggleActivo(row)}
                        disabled={dataSource !== "supabase"}
                        className="inline-flex min-h-11 items-center justify-center rounded-lg px-3 hover:bg-geo-surface disabled:opacity-40"
                        aria-label={row.activo ? "Desactivar" : "Activar"}
                      >
                        {row.activo ? (
                          <ToggleRight className="h-5 w-5 text-emerald-600" />
                        ) : (
                          <ToggleLeft className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  }
                >
                  <MobileDataRow label="Tipo" value={TIPO_LABEL[row.tipo]} />
                  <MobileDataRow label="Alcaldía" value={row.alcaldia} />
                  {row.verificado && (
                    <MobileDataRow label="Verificado" value="Sí" />
                  )}
                </MobileDataCard>
              ))}
            </div>
          }
        >
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-geo-border bg-geo-surface text-geo-muted">
                <th className="px-4 py-3 text-xs font-semibold uppercase">ID</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase">Tipo</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase">Título</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase">Alcaldía</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase">Estado</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {recursos.map((row) => (
                <tr
                  key={row.id}
                  className={cn(
                    "border-b border-geo-border last:border-0 hover:bg-geo-hover/60",
                    !row.activo && "opacity-60",
                  )}
                >
                  <td className="px-4 py-3 font-mono text-xs text-geo-muted">{row.id}</td>
                  <td className="px-4 py-3 text-geo-muted">{TIPO_LABEL[row.tipo]}</td>
                  <td className="max-w-[220px] px-4 py-3 font-semibold text-geo-navy">
                    {row.titulo}
                  </td>
                  <td className="px-4 py-3 text-geo-muted">{row.alcaldia}</td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                        row.activo
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-200 text-slate-600",
                      )}
                    >
                      {row.activo ? "Activo" : "Inactivo"}
                    </span>
                    {row.verificado && (
                      <span className="ml-1 rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-bold uppercase text-sky-800">
                        Verificado
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button
                        type="button"
                        title="Editar"
                        onClick={() => onEdit(row)}
                        disabled={dataSource !== "supabase"}
                        className="rounded-lg p-2 text-geo-navy hover:bg-geo-surface disabled:opacity-40"
                      >
                        <SquarePen className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        title={row.activo ? "Desactivar" : "Activar"}
                        onClick={() => onToggleActivo(row)}
                        disabled={dataSource !== "supabase"}
                        className="rounded-lg p-2 text-geo-navy hover:bg-geo-surface disabled:opacity-40"
                      >
                        {row.activo ? (
                          <ToggleRight className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <ToggleLeft className="h-4 w-4 text-geo-muted" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {recursos.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-geo-muted">
                    No hay recursos registrados.
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
