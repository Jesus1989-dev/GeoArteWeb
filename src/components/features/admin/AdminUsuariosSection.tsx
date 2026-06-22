"use client";

import { Plus, SquarePen, Users } from "lucide-react";
import { Button } from "@/components/shared/Button";
import { MobileDataCard, MobileDataRow } from "@/components/shared/MobileDataCard";
import type { AdminControllerState } from "@/hooks/use-admin-controller";
import type { AdminPageData } from "@/lib/services/admin.service";
import {
  adminIconButton,
  adminTableBodyRow,
  adminTableCaption,
  adminTableChip,
  adminTableHeadRowCompact,
  adminTableShell,
  adminMobileCardList,
} from "@/lib/theme/admin-table";
import { cn } from "@/lib/utils";

type AdminUsuariosSectionProps = {
  usuarios: AdminControllerState["usuarios"];
  loading: boolean;
  dataSource: AdminPageData["dataSource"];
  onRefresh: AdminControllerState["loadUsuarios"];
  onCreate: AdminControllerState["openCreateUsuarioModal"];
  onEditRol: AdminControllerState["openUsuarioRolModal"];
};

const ESTADO_BADGE: Record<string, string> = {
  Activo: "bg-emerald-50 text-emerald-800",
  "Invitación enviada": "bg-sky-50 text-sky-800",
  "Pendiente verificación": "bg-amber-50 text-amber-900",
};

export function AdminUsuariosSection({
  usuarios,
  loading,
  dataSource,
  onRefresh,
  onCreate,
  onEditRol,
}: AdminUsuariosSectionProps) {
  return (
    <div className="mt-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-geo-surface text-geo-navy">
            <Users className="h-5 w-5" strokeWidth={2} />
          </div>
          <div>
            <h3 className="font-semibold text-geo-navy">Usuarios registrados</h3>
            <p className="mt-0.5 text-sm text-geo-muted">
              Invita por correo o crea cuentas con contraseña; asigna Ciudadano, Investigador o
              Autoridad.
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
            Nuevo usuario
          </Button>
        </div>
      </div>

      {dataSource !== "supabase" && (
        <p className="mt-4 rounded-lg bg-amber-50 px-4 py-2 text-sm text-amber-900">
          Conecta Supabase para gestionar usuarios desde el panel.
        </p>
      )}

      <div className={cn("mt-6", adminTableShell)}>
        {loading && <p className={adminTableCaption}>Cargando perfiles…</p>}
        <div className={adminMobileCardList}>
          {usuarios.map((u) => (
            <MobileDataCard
              key={u.fullId}
              title={u.displayName}
              subtitle={u.email || "—"}
              badge={
                <span className={adminTableChip}>{u.rol}</span>
              }
              actions={
                <button
                  type="button"
                  onClick={() => onEditRol(u)}
                  disabled={dataSource !== "supabase"}
                  className={cn(adminIconButton, "w-full justify-center")}
                >
                  <SquarePen className="h-4 w-4" />
                  Cambiar rol
                </button>
              }
            >
              <MobileDataRow label="ID" value={u.id} />
              <MobileDataRow
                label="Acceso"
                value={
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
                      ESTADO_BADGE[u.estadoAcceso] ?? "bg-slate-100 text-slate-600",
                    )}
                  >
                    {u.estadoAcceso}
                  </span>
                }
              />
              <MobileDataRow label="Registro" value={u.registradoEl} />
            </MobileDataCard>
          ))}
          {usuarios.length === 0 && !loading && (
            <p className="px-4 py-12 text-center text-sm text-geo-muted">
              No hay usuarios registrados.
            </p>
          )}
        </div>
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className={adminTableHeadRowCompact}>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide">ID</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide">
                  Nombre
                </th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide">
                  Correo
                </th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide">Rol</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide">
                  Acceso
                </th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide">
                  Registro
                </th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.fullId} className={adminTableBodyRow}>
                  <td className="px-5 py-4 font-semibold text-geo-navy">{u.id}</td>
                  <td className="px-5 py-4 font-medium text-foreground">{u.displayName}</td>
                  <td className="px-5 py-4 text-geo-muted">{u.email || "—"}</td>
                  <td className="px-5 py-4">
                    <span className={adminTableChip}>{u.rol}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
                        ESTADO_BADGE[u.estadoAcceso] ?? "bg-slate-100 text-slate-600",
                      )}
                    >
                      {u.estadoAcceso}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-geo-muted">{u.registradoEl}</td>
                  <td className="px-5 py-4">
                    <button
                      type="button"
                      onClick={() => onEditRol(u)}
                      disabled={dataSource !== "supabase"}
                      className={adminIconButton}
                    >
                      <SquarePen className="h-4 w-4" />
                      Cambiar rol
                    </button>
                  </td>
                </tr>
              ))}
              {usuarios.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-sm text-geo-muted">
                    No hay usuarios registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
