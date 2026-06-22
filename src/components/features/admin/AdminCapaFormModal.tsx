"use client";

import { Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/shared/Button";
import type { AdminCapaFormInput } from "@/lib/domain/admin";
import type { AdminCapaFormModalState } from "@/hooks/use-admin-controller";

type AdminCapaFormModalProps = {
  modal: AdminCapaFormModalState;
  saving: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (input: AdminCapaFormInput) => void;
};

export function AdminCapaFormModal({
  modal,
  saving,
  error,
  onClose,
  onSubmit,
}: AdminCapaFormModalProps) {
  const [form, setForm] = useState<AdminCapaFormInput>({
    nombre: "",
    descripcion: "",
    orden: 0,
  });

  useEffect(() => {
    if (modal.open) setForm(modal.initial);
  }, [modal]);

  if (!modal.open) return null;

  function updateField<K extends keyof AdminCapaFormInput>(
    key: K,
    value: AdminCapaFormInput[K],
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
          <h2 className="text-lg font-bold text-geo-navy">
            {modal.mode === "create" ? "Nueva tipología SIC" : "Editar tipología"}
          </h2>
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

          <div>
            <label className="block text-xs font-semibold uppercase text-geo-muted">
              Nombre
            </label>
            <input
              required
              value={form.nombre}
              onChange={(e) => updateField("nombre", e.target.value)}
              className="mt-1 w-full rounded-lg border border-geo-border px-3 py-2 text-sm"
              placeholder="Ej. Museos"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-geo-muted">
              Descripción
            </label>
            <textarea
              value={form.descripcion ?? ""}
              onChange={(e) => updateField("descripcion", e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-lg border border-geo-border px-3 py-2 text-sm"
              placeholder="Descripción para el catálogo y el mapa"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-geo-muted">
              Orden en mapa
            </label>
            <input
              type="number"
              value={form.orden}
              onChange={(e) => updateField("orden", Number.parseInt(e.target.value, 10) || 0)}
              className="mt-1 w-full rounded-lg border border-geo-border px-3 py-2 text-sm"
            />
          </div>

          <div className="flex justify-end gap-2 border-t border-geo-border pt-4">
            <Button type="button" variant="ghost" size="md" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="md" disabled={saving} className="gap-2">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Guardar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
