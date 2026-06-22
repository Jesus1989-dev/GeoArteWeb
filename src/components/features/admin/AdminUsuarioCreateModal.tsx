"use client";

import { Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/shared/Button";
import { perfilRoles } from "@/lib/data/mock/perfil";
import type { AdminUsuarioCreateFormInput } from "@/lib/domain/admin";
import type { AdminUsuarioCreateModalState } from "@/hooks/use-admin-controller";
import { cn } from "@/lib/utils";

type AdminUsuarioCreateModalProps = {
  modal: AdminUsuarioCreateModalState;
  saving: boolean;
  error: string | null;
  successMessage: string | null;
  onClose: () => void;
  onSubmit: (input: AdminUsuarioCreateFormInput) => void;
};

export function AdminUsuarioCreateModal({
  modal,
  saving,
  error,
  successMessage,
  onClose,
  onSubmit,
}: AdminUsuarioCreateModalProps) {
  const [form, setForm] = useState<AdminUsuarioCreateFormInput>({
    modo: "invitar",
    nombre: "",
    email: "",
    password: "",
    rol: "investigador",
    institucion: "",
  });

  useEffect(() => {
    if (modal.open) {
      setForm(modal.initial);
    }
  }, [modal]);

  if (!modal.open) return null;

  function updateField<K extends keyof AdminUsuarioCreateFormInput>(
    key: K,
    value: AdminUsuarioCreateFormInput[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div
      className="fixed inset-0 z-[600] flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-xl border border-geo-border bg-geo-card shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-geo-border px-5 py-4">
          <h2 className="text-lg font-bold text-geo-navy">Nuevo usuario</h2>
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
            onSubmit(form);
          }}
          className="space-y-4 p-5"
        >
          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}
          {successMessage && (
            <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              {successMessage}
            </p>
          )}

          <div className="inline-flex rounded-lg border border-geo-border bg-geo-surface/80 p-1">
            {(
              [
                { id: "invitar" as const, label: "Invitar por correo" },
                { id: "crear" as const, label: "Crear con contraseña" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => updateField("modo", opt.id)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-semibold transition",
                  form.modo === opt.id
                    ? "bg-geo-card text-geo-navy shadow-sm"
                    : "text-geo-muted hover:text-geo-navy",
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <p className="text-xs text-geo-muted">
            {form.modo === "invitar"
              ? "Supabase enviará un enlace para que el usuario defina su contraseña y active la cuenta."
              : "La cuenta queda activa de inmediato; comunica la contraseña temporal al usuario por un canal seguro."}
          </p>

          <div>
            <label className="block text-xs font-semibold uppercase text-geo-muted">
              Nombre completo
            </label>
            <input
              required
              value={form.nombre}
              onChange={(e) => updateField("nombre", e.target.value)}
              className="mt-1 w-full rounded-lg border border-geo-border px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-geo-muted">
              Correo electrónico
            </label>
            <input
              required
              type="email"
              autoComplete="off"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              className="mt-1 w-full rounded-lg border border-geo-border px-3 py-2 text-sm"
            />
          </div>

          {form.modo === "crear" && (
            <div>
              <label className="block text-xs font-semibold uppercase text-geo-muted">
                Contraseña temporal
              </label>
              <input
                required
                type="password"
                minLength={8}
                autoComplete="new-password"
                value={form.password ?? ""}
                onChange={(e) => updateField("password", e.target.value)}
                className="mt-1 w-full rounded-lg border border-geo-border px-3 py-2 text-sm"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase text-geo-muted">
              Rol
            </label>
            <select
              value={form.rol}
              onChange={(e) =>
                updateField("rol", e.target.value as AdminUsuarioCreateFormInput["rol"])
              }
              className="mt-1 w-full rounded-lg border border-geo-border px-3 py-2 text-sm"
            >
              {perfilRoles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-geo-muted">
              Institución (opcional)
            </label>
            <input
              value={form.institucion ?? ""}
              onChange={(e) => updateField("institucion", e.target.value)}
              className="mt-1 w-full rounded-lg border border-geo-border px-3 py-2 text-sm"
            />
          </div>

          <div className="flex justify-end gap-2 border-t border-geo-border pt-4">
            <Button type="button" variant="ghost" size="md" onClick={onClose}>
              {successMessage ? "Cerrar" : "Cancelar"}
            </Button>
            {!successMessage && (
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={saving}
                className="gap-2"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {form.modo === "invitar" ? "Enviar invitación" : "Crear cuenta"}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
