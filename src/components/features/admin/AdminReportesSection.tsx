"use client";

import { FileBarChart, Loader2, Plus, SquarePen, ToggleLeft, ToggleRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/shared/Button";
import { MobileDataCard, MobileDataRow } from "@/components/shared/MobileDataCard";
import { ResponsiveTable } from "@/components/shared/ResponsiveTable";
import type { AdminControllerState } from "@/hooks/use-admin-controller";
import type {
  AdminReportePlantillaRow,
  AdminReportesCentroConfigFormInput,
} from "@/lib/domain/admin";
import { adminMobileCardList } from "@/lib/theme/admin-table";
import { cn } from "@/lib/utils";

type AdminReportesSectionProps = {
  plantillas: AdminReportePlantillaRow[];
  loading: boolean;
  config: AdminReportesCentroConfigFormInput;
  configSaving: boolean;
  configError: string | null;
  dataSource: "supabase" | "mock";
  onCreate: AdminControllerState["openCreateReportePlantillaModal"];
  onEdit: AdminControllerState["openEditReportePlantillaModal"];
  onToggleActivo: AdminControllerState["toggleReportePlantillaActivo"];
  onRefresh: AdminControllerState["loadReportePlantillas"];
  onSaveConfig: AdminControllerState["saveReportesCentroConfig"];
};

export function AdminReportesSection({
  plantillas,
  loading,
  config,
  configSaving,
  configError,
  dataSource,
  onCreate,
  onEdit,
  onToggleActivo,
  onRefresh,
  onSaveConfig,
}: AdminReportesSectionProps) {
  const [configForm, setConfigForm] = useState<AdminReportesCentroConfigFormInput>(config);
  const activas = plantillas.filter((p) => p.activo).length;

  useEffect(() => {
    setConfigForm(config);
  }, [config]);

  return (
    <div className="mt-8 space-y-10">
      <div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-geo-surface text-geo-navy">
              <FileBarChart className="h-5 w-5" strokeWidth={2} />
            </div>
            <div>
              <h3 className="font-semibold text-geo-navy">Plantillas de reporte</h3>
              <p className="mt-0.5 text-sm text-geo-muted">
                Catálogo publicado en `/reportes` (`reporte_plantillas`). {activas} activas de{" "}
                {plantillas.length}.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              href="/reportes"
              variant="ghost"
              size="md"
              className="border border-geo-border"
            >
              Ver centro público
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
              Nueva plantilla
            </Button>
          </div>
        </div>

        {dataSource !== "supabase" && (
          <p className="mt-4 rounded-lg bg-amber-50 px-4 py-2 text-sm text-amber-900">
            Conecta Supabase y usa rol Autoridad para gestionar plantillas desde el panel.
          </p>
        )}

        <div className="mt-6 overflow-hidden rounded-xl border border-geo-border bg-geo-card shadow-sm">
          {loading && (
            <p className="border-b border-geo-border px-5 py-2 text-xs text-geo-muted">
              Cargando plantillas…
            </p>
          )}
          <ResponsiveTable
            mobile={
              <div className={adminMobileCardList}>
                {plantillas.map((row) => (
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
                        {row.activo ? "Activa" : "Inactiva"}
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
                            <ToggleRight className="h-4 w-4 text-emerald-600" />
                          ) : (
                            <ToggleLeft className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    }
                  >
                    <MobileDataRow label="Categoría" value={row.categoria} />
                    <MobileDataRow label="Formatos" value={row.formatos.join(", ")} />
                    <MobileDataRow label="Orden" value={row.orden} />
                  </MobileDataCard>
                ))}
              </div>
            }
          >
            <table className="w-full min-w-[880px] text-left text-sm">
              <thead>
                <tr className="border-b border-geo-border bg-geo-surface text-geo-muted">
                  <th className="px-4 py-3 text-xs font-semibold uppercase">ID</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase">Título</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase">Categoría</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase">Formatos</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase">Orden</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase">Estado</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {plantillas.map((row) => (
                  <tr
                    key={row.id}
                    className={cn(
                      "border-b border-geo-border last:border-0 hover:bg-geo-hover/60",
                      !row.activo && "opacity-60",
                    )}
                  >
                    <td className="px-4 py-3 font-mono text-xs text-geo-muted">{row.id}</td>
                    <td className="max-w-[220px] px-4 py-3">
                      <p className="font-semibold text-geo-navy">{row.titulo}</p>
                      <p className="mt-0.5 line-clamp-2 text-xs text-geo-muted">
                        {row.descripcion}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-geo-muted">{row.categoria}</td>
                    <td className="px-4 py-3 text-xs text-geo-muted">
                      {row.formatos.join(", ")}
                    </td>
                    <td className="px-4 py-3 text-geo-muted">{row.orden}</td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                          row.activo
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-200 text-slate-600",
                        )}
                      >
                        {row.activo ? "Activa" : "Inactiva"}
                      </span>
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
                {plantillas.length === 0 && !loading && (
                  <tr>
                    <td colSpan={7} className="px-5 py-8 text-center text-geo-muted">
                      No hay plantillas registradas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </ResponsiveTable>
        </div>
      </div>

      <div className="rounded-xl border border-geo-border bg-geo-card p-5 shadow-sm">
        <h3 className="font-semibold text-geo-navy">Texto de ayuda del centro</h3>
        <p className="mt-0.5 text-sm text-geo-muted">
          Mensaje y enlace que aparecen en la barra lateral de `/reportes` (`reportes_centro_config`).
        </p>

        {configError && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{configError}</p>
        )}

        <form
          className="mt-4 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            onSaveConfig(configForm);
          }}
        >
          <div>
            <label htmlFor="rep-ayuda" className="text-xs font-semibold text-geo-navy">
              Texto de ayuda *
            </label>
            <textarea
              id="rep-ayuda"
              required
              rows={3}
              value={configForm.ayudaTexto}
              onChange={(e) =>
                setConfigForm((prev) => ({ ...prev, ayudaTexto: e.target.value }))
              }
              disabled={dataSource !== "supabase" || configSaving}
              className="mt-1 w-full rounded-lg border border-geo-border px-3 py-2 text-sm outline-none focus:border-geo-pink disabled:bg-geo-surface"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="rep-enlace-label" className="text-xs font-semibold text-geo-navy">
                Etiqueta del enlace *
              </label>
              <input
                id="rep-enlace-label"
                required
                value={configForm.ayudaEnlaceLabel}
                onChange={(e) =>
                  setConfigForm((prev) => ({ ...prev, ayudaEnlaceLabel: e.target.value }))
                }
                disabled={dataSource !== "supabase" || configSaving}
                className="mt-1 w-full rounded-lg border border-geo-border px-3 py-2 text-sm outline-none focus:border-geo-pink disabled:bg-geo-surface"
              />
            </div>
            <div>
              <label htmlFor="rep-enlace-href" className="text-xs font-semibold text-geo-navy">
                URL del enlace *
              </label>
              <input
                id="rep-enlace-href"
                required
                value={configForm.ayudaEnlaceHref}
                onChange={(e) =>
                  setConfigForm((prev) => ({ ...prev, ayudaEnlaceHref: e.target.value }))
                }
                disabled={dataSource !== "supabase" || configSaving}
                placeholder="/perfil"
                className="mt-1 w-full rounded-lg border border-geo-border px-3 py-2 text-sm outline-none focus:border-geo-pink disabled:bg-geo-surface"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={dataSource !== "supabase" || configSaving}
              className="gap-2"
            >
              {configSaving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
              Guardar ayuda
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
