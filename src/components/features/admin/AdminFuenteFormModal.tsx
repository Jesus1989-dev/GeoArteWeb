"use client";

import { Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/shared/Button";
import type { AdminFuenteFormInput } from "@/lib/domain/admin";
import type { AdminFuenteFormModalState } from "@/hooks/use-admin-controller";

type AdminFuenteFormModalProps = {
  modal: AdminFuenteFormModalState;
  saving: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (input: AdminFuenteFormInput) => void;
};

const TIPO_OPTIONS = [
  { value: "activo", label: "Activo / sincronizado" },
  { value: "api", label: "Conexión API" },
  { value: "estatico", label: "Estático" },
  { value: "procesado", label: "Procesado" },
] as const;

export function AdminFuenteFormModal({
  modal,
  saving,
  error,
  onClose,
  onSubmit,
}: AdminFuenteFormModalProps) {
  const [form, setForm] = useState<AdminFuenteFormInput>({
    institucion: "",
    dataset: "",
    estado: "",
    tipoEstado: "activo",
  });

  useEffect(() => {
    if (modal.open) setForm(modal.initial);
  }, [modal]);

  if (!modal.open) return null;

  function updateField<K extends keyof AdminFuenteFormInput>(
    key: K,
    value: AdminFuenteFormInput[K],
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
            {modal.mode === "create" ? "Nueva fuente" : "Editar fuente"}
          </h2>
          <button type="button" onClick={onClose} className="rounded-md p-1 text-geo-muted hover:bg-geo-surface">
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
            <label htmlFor="fuente-institucion" className="text-xs font-semibold text-geo-navy">
              Institución *
            </label>
            <input
              id="fuente-institucion"
              required
              value={form.institucion}
              onChange={(e) => updateField("institucion", e.target.value)}
              className="mt-1 w-full rounded-lg border border-geo-border px-3 py-2 text-sm outline-none focus:border-geo-pink"
            />
          </div>

          <div>
            <label htmlFor="fuente-dataset" className="text-xs font-semibold text-geo-navy">
              Dataset *
            </label>
            <input
              id="fuente-dataset"
              required
              value={form.dataset}
              onChange={(e) => updateField("dataset", e.target.value)}
              className="mt-1 w-full rounded-lg border border-geo-border px-3 py-2 text-sm outline-none focus:border-geo-pink"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="fuente-estado" className="text-xs font-semibold text-geo-navy">
                Etiqueta de estado *
              </label>
              <input
                id="fuente-estado"
                required
                value={form.estado}
                onChange={(e) => updateField("estado", e.target.value)}
                placeholder="Sincronizado"
                className="mt-1 w-full rounded-lg border border-geo-border px-3 py-2 text-sm outline-none focus:border-geo-pink"
              />
            </div>
            <div>
              <label htmlFor="fuente-tipo" className="text-xs font-semibold text-geo-navy">
                Tipo
              </label>
              <select
                id="fuente-tipo"
                value={form.tipoEstado}
                onChange={(e) =>
                  updateField("tipoEstado", e.target.value as AdminFuenteFormInput["tipoEstado"])
                }
                className="mt-1 w-full rounded-lg border border-geo-border bg-geo-card px-3 py-2 text-sm outline-none focus:border-geo-pink"
              >
                {TIPO_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="fuente-url" className="text-xs font-semibold text-geo-navy">
                URL
              </label>
              <input
                id="fuente-url"
                type="url"
                value={form.urlFuente ?? ""}
                onChange={(e) => updateField("urlFuente", e.target.value)}
                className="mt-1 w-full rounded-lg border border-geo-border px-3 py-2 text-sm outline-none focus:border-geo-pink"
              />
            </div>
            <div>
              <label htmlFor="fuente-orden" className="text-xs font-semibold text-geo-navy">
                Orden
              </label>
              <input
                id="fuente-orden"
                type="number"
                min={0}
                value={form.orden ?? 0}
                onChange={(e) => updateField("orden", Number.parseInt(e.target.value, 10) || 0)}
                className="mt-1 w-full rounded-lg border border-geo-border px-3 py-2 text-sm outline-none focus:border-geo-pink"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-geo-border pt-4">
            <Button type="button" variant="ghost" size="md" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="md" disabled={saving} className="gap-2">
              {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
              Guardar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
