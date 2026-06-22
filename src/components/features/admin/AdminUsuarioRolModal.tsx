"use client";

import { Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/shared/Button";
import { perfilRoles } from "@/lib/data/mock/perfil";
import type { AdminUsuarioRolFormInput } from "@/lib/domain/admin";
import type { AdminUsuarioRolModalState } from "@/hooks/use-admin-controller";

type AdminUsuarioRolModalProps = {
  modal: AdminUsuarioRolModalState;
  saving: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (input: AdminUsuarioRolFormInput) => void;
};

export function AdminUsuarioRolModal({
  modal,
  saving,
  error,
  onClose,
  onSubmit,
}: AdminUsuarioRolModalProps) {
  const [rol, setRol] = useState<AdminUsuarioRolFormInput["rol"]>("ciudadano");

  useEffect(() => {
    if (modal.open) setRol(modal.initial.rol);
  }, [modal]);

  if (!modal.open) return null;

  const { usuario } = modal;

  return (
    <div
      className="fixed inset-0 z-[600] flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl border border-geo-border bg-geo-card shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-geo-border px-5 py-4">
          <h2 className="text-lg font-bold text-geo-navy">Cambiar rol</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-geo-muted hover:bg-geo-surface"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit({ rol });
          }}
          className="space-y-4 p-5"
        >
          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}

          <p className="text-sm text-geo-muted">
            Usuario: <strong className="text-geo-navy">{usuario.displayName}</strong>
            <span className="ml-2 font-mono text-xs">({usuario.id})</span>
          </p>

          <div>
            <label
              htmlFor="usuario-rol"
              className="block text-xs font-semibold uppercase text-geo-muted"
            >
              Rol en la plataforma
            </label>
            <select
              id="usuario-rol"
              value={rol}
              onChange={(e) =>
                setRol(e.target.value as AdminUsuarioRolFormInput["rol"])
              }
              className="mt-1 w-full rounded-lg border border-geo-border px-3 py-2 text-sm text-geo-navy"
            >
              {perfilRoles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <p className="text-xs text-geo-muted">
            El rol define acceso al panel de administración (Autoridad), reportes avanzados
            (Investigador) o uso ciudadano.
          </p>

          <div className="flex justify-end gap-2 border-t border-geo-border pt-4">
            <Button type="button" variant="ghost" size="md" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={saving || rol === usuario.rolApp}
              className="gap-2"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Guardar rol
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
