"use client";

import { Eye, Mail, RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";
import { AdminContactoCentroConfigPanel } from "@/components/features/admin/AdminContactoCentroConfigPanel";
import { Button } from "@/components/shared/Button";
import { MobileDataCard, MobileDataRow } from "@/components/shared/MobileDataCard";
import type { AdminControllerState } from "@/hooks/use-admin-controller";
import type { AdminContactoCentroConfigFormInput } from "@/lib/domain/admin";
import {
  CONSULTA_CONTACTO_ESTADO_LABELS,
  CONSULTA_CONTACTO_ESTADOS,
  type ConsultaContactoEstado,
  type ConsultaContactoRow,
} from "@/lib/domain/contacto";
import { adminMobileCardList } from "@/lib/theme/admin-table";
import { cn } from "@/lib/utils";

type AdminConsultasContactoSectionProps = {
  consultas: ConsultaContactoRow[];
  loading: boolean;
  config: AdminContactoCentroConfigFormInput;
  configSaving: boolean;
  configError: string | null;
  dataSource: "supabase" | "mock";
  onRefresh: AdminControllerState["loadConsultas"];
  onSaveConfig: AdminControllerState["saveContactoCentroConfig"];
  onOpenDetail: AdminControllerState["openConsultaDetailModal"];
};

const ESTADO_BADGE: Record<ConsultaContactoEstado, string> = {
  nuevo: "bg-sky-100 text-sky-800",
  en_revision: "bg-amber-100 text-amber-900",
  respondido: "bg-emerald-100 text-emerald-800",
  archivado: "bg-slate-100 text-slate-600",
};

export function AdminConsultasContactoSection({
  consultas,
  loading,
  config,
  configSaving,
  configError,
  dataSource,
  onRefresh,
  onSaveConfig,
  onOpenDetail,
}: AdminConsultasContactoSectionProps) {
  const [filtroEstado, setFiltroEstado] = useState<ConsultaContactoEstado | "todos">("todos");

  const consultasFiltradas = useMemo(() => {
    if (filtroEstado === "todos") return consultas;
    return consultas.filter((c) => c.estado === filtroEstado);
  }, [consultas, filtroEstado]);

  const nuevasCount = consultas.filter((c) => c.estado === "nuevo").length;

  return (
    <div className="mt-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-geo-surface text-geo-navy">
            <Mail className="h-5 w-5" strokeWidth={2} />
          </div>
          <div>
            <h3 className="font-semibold text-geo-navy">Buzón de consultas</h3>
            <p className="mt-0.5 text-sm text-geo-muted">
              Solicitudes recibidas desde el formulario de contacto institucional.
              {nuevasCount > 0 && (
                <span className="ml-1 font-medium text-sky-700">
                  {nuevasCount} sin revisar
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filtroEstado}
            onChange={(e) =>
              setFiltroEstado(e.target.value as ConsultaContactoEstado | "todos")
            }
            className="rounded-lg border border-geo-border bg-geo-card px-3 py-2 text-sm text-geo-navy outline-none focus:border-geo-pink focus:ring-2 focus:ring-geo-pink/15"
          >
            <option value="todos">Todos los estados</option>
            {CONSULTA_CONTACTO_ESTADOS.map((estado) => (
              <option key={estado} value={estado}>
                {CONSULTA_CONTACTO_ESTADO_LABELS[estado]}
              </option>
            ))}
          </select>
          <Button
            type="button"
            variant="ghost"
            size="md"
            onClick={onRefresh}
            disabled={loading || dataSource !== "supabase"}
            className="gap-2 border border-geo-border"
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            Actualizar
          </Button>
        </div>
      </div>

      {dataSource !== "supabase" && (
        <p className="mt-4 rounded-lg bg-amber-50 px-4 py-2 text-sm text-amber-900">
          Conecta Supabase para gestionar consultas desde el panel.
        </p>
      )}

      <div className="mt-6 overflow-hidden rounded-xl border border-geo-border bg-geo-card shadow-sm">
        {loading && (
          <p className="border-b border-geo-border px-5 py-2 text-xs text-geo-muted">
            Cargando consultas…
          </p>
        )}
        <div className={adminMobileCardList}>
          {consultasFiltradas.map((row) => (
            <MobileDataCard
              key={row.id}
              title={row.asunto}
              subtitle={row.createdAtLabel}
              badge={
                <span
                  className={cn(
                    "inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold",
                    ESTADO_BADGE[row.estado],
                  )}
                >
                  {CONSULTA_CONTACTO_ESTADO_LABELS[row.estado]}
                </span>
              }
              actions={
                <button
                  type="button"
                  onClick={() => onOpenDetail(row)}
                  disabled={dataSource !== "supabase"}
                  className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-geo-border px-3 text-sm font-medium text-geo-navy hover:bg-geo-hover disabled:opacity-40"
                >
                  <Eye className="h-4 w-4" />
                  Ver detalle
                </button>
              }
            >
              <MobileDataRow label="Contacto" value={row.nombre} />
              <MobileDataRow label="Correo" value={row.email} />
            </MobileDataCard>
          ))}
          {consultasFiltradas.length === 0 && !loading && (
            <p className="px-4 py-12 text-center text-sm text-geo-muted">
              {filtroEstado === "todos"
                ? "No hay consultas registradas."
                : "No hay consultas con este estado."}
            </p>
          )}
        </div>
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead>
              <tr className="border-b border-geo-border bg-geo-surface text-geo-muted">
                <th className="px-5 py-3.5 text-xs font-semibold uppercase">Fecha</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase">Contacto</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase">Asunto</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase">Estado</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {consultasFiltradas.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-geo-border last:border-0 hover:bg-geo-hover/60"
                >
                  <td className="px-5 py-4 text-geo-muted">{row.createdAtLabel}</td>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-geo-navy">{row.nombre}</p>
                    <p className="mt-0.5 text-xs text-geo-muted">{row.email}</p>
                  </td>
                  <td className="max-w-xs truncate px-5 py-4 text-geo-muted" title={row.asunto}>
                    {row.asunto}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold",
                        ESTADO_BADGE[row.estado],
                      )}
                    >
                      {CONSULTA_CONTACTO_ESTADO_LABELS[row.estado]}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <button
                      type="button"
                      onClick={() => onOpenDetail(row)}
                      disabled={dataSource !== "supabase"}
                      className="inline-flex items-center gap-1.5 rounded-lg px-0.5 py-2 text-sm font-medium text-geo-navy hover:bg-geo-hover disabled:opacity-40"
                    >
                      <Eye className="h-4 w-4" />
                      Ver detalle
                    </button>
                  </td>
                </tr>
              ))}
              {consultasFiltradas.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-sm text-geo-muted">
                    {filtroEstado === "todos"
                      ? "No hay consultas registradas."
                      : "No hay consultas con este estado."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AdminContactoCentroConfigPanel
        config={config}
        saving={configSaving}
        error={configError}
        dataSource={dataSource}
        onSave={onSaveConfig}
      />
    </div>
  );
}
