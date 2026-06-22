"use client";

import { FileText, Loader2, Plus, SquarePen, ToggleLeft, ToggleRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/shared/Button";
import { MobileDataCard, MobileDataRow } from "@/components/shared/MobileDataCard";
import type { AdminControllerState } from "@/hooks/use-admin-controller";
import type {
  AdminPoliticaRecomendacionRow,
  AdminPoliticasCentroConfigFormInput,
} from "@/lib/domain/admin";
import { formatPresupuestoMxnDetalle } from "@/lib/politicas/format-politicas-metricas";
import { adminMobileCardList } from "@/lib/theme/admin-table";
import { cn } from "@/lib/utils";

const OBJETIVO_LABEL: Record<AdminPoliticaRecomendacionRow["objetivoId"], string> = {
  genero: "Género",
  periferias: "Periferias",
  digitalizacion: "Digitalización",
  economia: "Economía creativa",
};

type AdminPoliticasRecomendacionesSectionProps = {
  recomendaciones: AdminPoliticaRecomendacionRow[];
  loading: boolean;
  config: AdminPoliticasCentroConfigFormInput;
  configSaving: boolean;
  configError: string | null;
  dataSource: "supabase" | "mock";
  onCreate: AdminControllerState["openCreatePoliticaModal"];
  onEdit: AdminControllerState["openEditPoliticaModal"];
  onToggleActivo: AdminControllerState["togglePoliticaActivo"];
  onRefresh: AdminControllerState["loadPoliticasRecomendaciones"];
  onSaveConfig: AdminControllerState["savePoliticasCentroConfig"];
};

export function AdminPoliticasRecomendacionesSection({
  recomendaciones,
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
}: AdminPoliticasRecomendacionesSectionProps) {
  const [configForm, setConfigForm] = useState<AdminPoliticasCentroConfigFormInput>(config);
  const activas = recomendaciones.filter((r) => r.activo).length;

  useEffect(() => {
    setConfigForm(config);
  }, [config]);

  return (
    <div className="mt-8 space-y-10">
      <div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-geo-surface text-geo-navy">
              <FileText className="h-5 w-5" strokeWidth={2} />
            </div>
            <div>
              <h3 className="font-semibold text-geo-navy">Recomendaciones de política</h3>
              <p className="mt-0.5 text-sm text-geo-muted">
                Catálogo publicado en `/politicas` (`politicas_recomendaciones`). {activas}{" "}
                activas de {recomendaciones.length}.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              href="/politicas"
              variant="ghost"
              size="md"
              className="border border-geo-border"
            >
              Ver página pública
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
              Nueva recomendación
            </Button>
          </div>
        </div>

        {dataSource !== "supabase" && (
          <p className="mt-4 rounded-lg bg-amber-50 px-4 py-2 text-sm text-amber-900">
            Conecta Supabase y usa rol Autoridad para gestionar recomendaciones desde el panel.
          </p>
        )}

        <div className="mt-6 overflow-hidden rounded-xl border border-geo-border bg-geo-card shadow-sm">
          {loading && (
            <p className="border-b border-geo-border px-5 py-2 text-xs text-geo-muted">
              Cargando recomendaciones…
            </p>
          )}
          <div className={adminMobileCardList}>
            {recomendaciones.map((row) => (
              <MobileDataCard
                key={row.id}
                title={row.titulo}
                subtitle={row.id}
                badge={
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
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
                      className="inline-flex min-h-11 items-center justify-center rounded-lg px-3 text-geo-navy hover:bg-geo-surface disabled:opacity-40"
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
                <MobileDataRow label="Objetivo" value={OBJETIVO_LABEL[row.objetivoId]} />
                <MobileDataRow label="Alcaldía" value={row.alcaldia} />
                <MobileDataRow
                  label="Métricas"
                  value={
                    <>
                      {row.impactoCiudadanos != null && (
                        <span className="block">
                          +{row.impactoCiudadanos.toLocaleString("es-MX")} hab.
                        </span>
                      )}
                      {row.presupuestoMxn != null && (
                        <span className="block">
                          {formatPresupuestoMxnDetalle(row.presupuestoMxn)}
                        </span>
                      )}
                      {row.impactoCiudadanos == null && row.presupuestoMxn == null && "—"}
                    </>
                  }
                />
              </MobileDataCard>
            ))}
          </div>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[960px] text-left text-sm">
              <thead>
                <tr className="border-b border-geo-border bg-geo-surface text-geo-muted">
                  <th className="px-4 py-3 text-xs font-semibold uppercase">ID</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase">Objetivo</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase">Título</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase">Alcaldía</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase">Métricas</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase">Estado</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {recomendaciones.map((row) => (
                  <tr
                    key={row.id}
                    className={cn(
                      "border-b border-geo-border last:border-0 hover:bg-geo-hover/60",
                      !row.activo && "opacity-60",
                    )}
                  >
                    <td className="px-4 py-3 font-mono text-xs text-geo-muted">{row.id}</td>
                    <td className="px-4 py-3 text-geo-muted">
                      {OBJETIVO_LABEL[row.objetivoId]}
                    </td>
                    <td className="max-w-[200px] px-4 py-3 font-semibold text-geo-navy">
                      {row.titulo}
                    </td>
                    <td className="px-4 py-3 text-geo-muted">{row.alcaldia}</td>
                    <td className="px-4 py-3 text-xs text-geo-muted">
                      {row.impactoCiudadanos != null && (
                        <span className="block">
                          +{row.impactoCiudadanos.toLocaleString("es-MX")} hab.
                        </span>
                      )}
                      {row.presupuestoMxn != null && (
                        <span className="block">
                          {formatPresupuestoMxnDetalle(row.presupuestoMxn)}
                        </span>
                      )}
                      {row.impactoCiudadanos == null && row.presupuestoMxn == null && "—"}
                    </td>
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
                {recomendaciones.length === 0 && !loading && (
                  <tr>
                    <td colSpan={7} className="px-5 py-8 text-center text-geo-muted">
                      No hay recomendaciones registradas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-geo-border bg-geo-card p-5 shadow-sm">
        <h3 className="font-semibold text-geo-navy">Contenido editorial de `/politicas`</h3>
        <p className="mt-0.5 text-sm text-geo-muted">
          Hero, filtros de objetivo y CTA inferior (`politicas_centro_config`). Usa{" "}
          <code className="rounded bg-geo-hover px-1">{`{anio}`}</code> en el badge para el corte
          automático.
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
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="pol-hero-badge" className="text-xs font-semibold text-geo-navy">
                Badge del hero *
              </label>
              <input
                id="pol-hero-badge"
                required
                value={configForm.heroBadge}
                onChange={(e) =>
                  setConfigForm((prev) => ({ ...prev, heroBadge: e.target.value }))
                }
                disabled={dataSource !== "supabase" || configSaving}
                className="mt-1 w-full rounded-lg border border-geo-border px-3 py-2 text-sm outline-none focus:border-geo-pink disabled:bg-geo-surface"
              />
            </div>
            <div>
              <label htmlFor="pol-hero-l1" className="text-xs font-semibold text-geo-navy">
                Título línea 1 *
              </label>
              <input
                id="pol-hero-l1"
                required
                value={configForm.heroTituloLinea1}
                onChange={(e) =>
                  setConfigForm((prev) => ({ ...prev, heroTituloLinea1: e.target.value }))
                }
                disabled={dataSource !== "supabase" || configSaving}
                className="mt-1 w-full rounded-lg border border-geo-border px-3 py-2 text-sm outline-none focus:border-geo-pink disabled:bg-geo-surface"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="pol-hero-l2" className="text-xs font-semibold text-geo-navy">
                Título línea 2 *
              </label>
              <input
                id="pol-hero-l2"
                required
                value={configForm.heroTituloLinea2}
                onChange={(e) =>
                  setConfigForm((prev) => ({ ...prev, heroTituloLinea2: e.target.value }))
                }
                disabled={dataSource !== "supabase" || configSaving}
                className="mt-1 w-full rounded-lg border border-geo-border px-3 py-2 text-sm outline-none focus:border-geo-pink disabled:bg-geo-surface"
              />
            </div>
            <div>
              <label htmlFor="pol-cta-href" className="text-xs font-semibold text-geo-navy">
                URL del botón CTA *
              </label>
              <input
                id="pol-cta-href"
                required
                value={configForm.ctaHref}
                onChange={(e) =>
                  setConfigForm((prev) => ({ ...prev, ctaHref: e.target.value }))
                }
                disabled={dataSource !== "supabase" || configSaving}
                className="mt-1 w-full rounded-lg border border-geo-border px-3 py-2 text-sm outline-none focus:border-geo-pink disabled:bg-geo-surface"
              />
            </div>
          </div>

          <div>
            <label htmlFor="pol-hero-desc" className="text-xs font-semibold text-geo-navy">
              Descripción del hero *
            </label>
            <textarea
              id="pol-hero-desc"
              required
              rows={2}
              value={configForm.heroDescripcion}
              onChange={(e) =>
                setConfigForm((prev) => ({ ...prev, heroDescripcion: e.target.value }))
              }
              disabled={dataSource !== "supabase" || configSaving}
              className="mt-1 w-full rounded-lg border border-geo-border px-3 py-2 text-sm outline-none focus:border-geo-pink disabled:bg-geo-surface"
            />
          </div>

          <div>
            <label htmlFor="pol-cta-titulo" className="text-xs font-semibold text-geo-navy">
              Título del CTA *
            </label>
            <input
              id="pol-cta-titulo"
              required
              value={configForm.ctaTitulo}
              onChange={(e) =>
                setConfigForm((prev) => ({ ...prev, ctaTitulo: e.target.value }))
              }
              disabled={dataSource !== "supabase" || configSaving}
              className="mt-1 w-full rounded-lg border border-geo-border px-3 py-2 text-sm outline-none focus:border-geo-pink disabled:bg-geo-surface"
            />
          </div>

          <div>
            <label htmlFor="pol-cta-desc" className="text-xs font-semibold text-geo-navy">
              Descripción del CTA *
            </label>
            <textarea
              id="pol-cta-desc"
              required
              rows={2}
              value={configForm.ctaDescripcion}
              onChange={(e) =>
                setConfigForm((prev) => ({ ...prev, ctaDescripcion: e.target.value }))
              }
              disabled={dataSource !== "supabase" || configSaving}
              className="mt-1 w-full rounded-lg border border-geo-border px-3 py-2 text-sm outline-none focus:border-geo-pink disabled:bg-geo-surface"
            />
          </div>

          <div>
            <label htmlFor="pol-cta-boton" className="text-xs font-semibold text-geo-navy">
              Texto del botón CTA *
            </label>
            <input
              id="pol-cta-boton"
              required
              value={configForm.ctaBoton}
              onChange={(e) =>
                setConfigForm((prev) => ({ ...prev, ctaBoton: e.target.value }))
              }
              disabled={dataSource !== "supabase" || configSaving}
              className="mt-1 w-full rounded-lg border border-geo-border px-3 py-2 text-sm outline-none focus:border-geo-pink disabled:bg-geo-surface"
            />
          </div>

          <div>
            <label htmlFor="pol-filtros" className="text-xs font-semibold text-geo-navy">
              Filtros de objetivo (JSON) *
            </label>
            <textarea
              id="pol-filtros"
              required
              rows={8}
              spellCheck={false}
              value={configForm.filtrosObjetivoJson}
              onChange={(e) =>
                setConfigForm((prev) => ({ ...prev, filtrosObjetivoJson: e.target.value }))
              }
              disabled={dataSource !== "supabase" || configSaving}
              className="mt-1 w-full rounded-lg border border-geo-border px-3 py-2 font-mono text-xs outline-none focus:border-geo-pink disabled:bg-geo-surface"
            />
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
              Guardar contenido editorial
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
