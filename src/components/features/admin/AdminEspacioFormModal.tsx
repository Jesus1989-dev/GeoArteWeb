"use client";

import { Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/shared/Button";
import type { AdminEspacioFormInput } from "@/lib/domain/admin";
import type { AdminFormModalState } from "@/hooks/use-admin-controller";
import { CDMX_ALCALDIAS } from "@/lib/data/supabase/search.repository";

type AdminEspacioFormModalProps = {
  modal: AdminFormModalState;
  categorias: string[];
  saving: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (input: AdminEspacioFormInput) => void;
};

export function AdminEspacioFormModal({
  modal,
  categorias,
  saving,
  error,
  onClose,
  onSubmit,
}: AdminEspacioFormModalProps) {
  const [form, setForm] = useState<AdminEspacioFormInput>({
    nombre: "",
    alcaldia: CDMX_ALCALDIAS[0] ?? "Cuauhtémoc",
  });

  useEffect(() => {
    if (modal.open) {
      setForm(modal.initial);
    }
  }, [modal]);

  if (!modal.open) return null;

  const titulo = modal.mode === "create" ? "Nuevo espacio cultural" : "Editar espacio";

  function updateField<K extends keyof AdminEspacioFormInput>(
    key: K,
    value: AdminEspacioFormInput[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    onSubmit(form);
  }

  return (
    <div
      className="fixed inset-0 z-[600] flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-espacio-form-title"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-geo-border bg-geo-card shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-geo-border px-5 py-4">
          <h2 id="admin-espacio-form-title" className="text-lg font-bold text-geo-navy">
            {titulo}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-geo-muted hover:bg-geo-surface"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}

          <div>
            <label htmlFor="esp-nombre" className="text-xs font-semibold text-geo-navy">
              Nombre *
            </label>
            <input
              id="esp-nombre"
              required
              value={form.nombre}
              onChange={(e) => updateField("nombre", e.target.value)}
              className="mt-1 w-full rounded-lg border border-geo-border px-3 py-2 text-sm outline-none focus:border-geo-pink focus:ring-2 focus:ring-geo-pink/20"
            />
          </div>

          <div>
            <label htmlFor="esp-direccion" className="text-xs font-semibold text-geo-navy">
              Dirección
            </label>
            <input
              id="esp-direccion"
              value={form.direccion ?? ""}
              onChange={(e) => updateField("direccion", e.target.value)}
              className="mt-1 w-full rounded-lg border border-geo-border px-3 py-2 text-sm outline-none focus:border-geo-pink focus:ring-2 focus:ring-geo-pink/20"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="esp-alcaldia" className="text-xs font-semibold text-geo-navy">
                Alcaldía *
              </label>
              <select
                id="esp-alcaldia"
                required
                value={form.alcaldia}
                onChange={(e) => updateField("alcaldia", e.target.value)}
                className="mt-1 w-full rounded-lg border border-geo-border bg-geo-card px-3 py-2 text-sm outline-none focus:border-geo-pink"
              >
                {CDMX_ALCALDIAS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="esp-tipo" className="text-xs font-semibold text-geo-navy">
                Tipo / categoría
              </label>
              <input
                id="esp-tipo"
                list="esp-categorias"
                value={form.tipo ?? ""}
                onChange={(e) => updateField("tipo", e.target.value)}
                className="mt-1 w-full rounded-lg border border-geo-border px-3 py-2 text-sm outline-none focus:border-geo-pink focus:ring-2 focus:ring-geo-pink/20"
              />
              <datalist id="esp-categorias">
                {categorias.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="esp-horario" className="text-xs font-semibold text-geo-navy">
                Horario
              </label>
              <input
                id="esp-horario"
                value={form.horario ?? ""}
                onChange={(e) => updateField("horario", e.target.value)}
                placeholder="L–V 10:00–18:00"
                className="mt-1 w-full rounded-lg border border-geo-border px-3 py-2 text-sm outline-none focus:border-geo-pink focus:ring-2 focus:ring-geo-pink/20"
              />
            </div>
            <div>
              <label htmlFor="esp-telefono" className="text-xs font-semibold text-geo-navy">
                Teléfono
              </label>
              <input
                id="esp-telefono"
                value={form.telefono ?? ""}
                onChange={(e) => updateField("telefono", e.target.value)}
                className="mt-1 w-full rounded-lg border border-geo-border px-3 py-2 text-sm outline-none focus:border-geo-pink focus:ring-2 focus:ring-geo-pink/20"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="esp-lat" className="text-xs font-semibold text-geo-navy">
                Latitud
              </label>
              <input
                id="esp-lat"
                type="number"
                step="any"
                value={form.latitud ?? ""}
                onChange={(e) =>
                  updateField(
                    "latitud",
                    e.target.value === "" ? null : Number.parseFloat(e.target.value),
                  )
                }
                className="mt-1 w-full rounded-lg border border-geo-border px-3 py-2 text-sm outline-none focus:border-geo-pink focus:ring-2 focus:ring-geo-pink/20"
              />
            </div>
            <div>
              <label htmlFor="esp-lng" className="text-xs font-semibold text-geo-navy">
                Longitud
              </label>
              <input
                id="esp-lng"
                type="number"
                step="any"
                value={form.longitud ?? ""}
                onChange={(e) =>
                  updateField(
                    "longitud",
                    e.target.value === "" ? null : Number.parseFloat(e.target.value),
                  )
                }
                className="mt-1 w-full rounded-lg border border-geo-border px-3 py-2 text-sm outline-none focus:border-geo-pink focus:ring-2 focus:ring-geo-pink/20"
              />
            </div>
          </div>

          <div>
            <label htmlFor="esp-desc" className="text-xs font-semibold text-geo-navy">
              Descripción
            </label>
            <textarea
              id="esp-desc"
              rows={3}
              value={form.descripcion ?? ""}
              onChange={(e) => updateField("descripcion", e.target.value)}
              className="mt-1 w-full rounded-lg border border-geo-border px-3 py-2 text-sm outline-none focus:border-geo-pink focus:ring-2 focus:ring-geo-pink/20"
            />
          </div>

          <div className="flex justify-end gap-3 border-t border-geo-border pt-4">
            <Button type="button" variant="ghost" size="md" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="md" disabled={saving} className="gap-2">
              {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
              {modal.mode === "create" ? "Crear espacio" : "Guardar cambios"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
