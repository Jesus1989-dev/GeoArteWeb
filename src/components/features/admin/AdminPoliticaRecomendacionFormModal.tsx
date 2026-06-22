"use client";

import { Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/shared/Button";
import type { AdminPoliticaRecomendacionFormInput } from "@/lib/domain/admin";
import type { AdminPoliticaObjetivoId } from "@/lib/domain/admin";
import type { PrioridadAccion } from "@/lib/domain/politicas";
import type { AdminPoliticaFormModalState } from "@/hooks/use-admin-controller";
import { CDMX_ALCALDIAS } from "@/lib/data/supabase/search.repository";

type AdminPoliticaRecomendacionFormModalProps = {
  modal: AdminPoliticaFormModalState;
  saving: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (input: AdminPoliticaRecomendacionFormInput) => void;
};

const OBJETIVO_OPTIONS: { value: AdminPoliticaObjetivoId; label: string }[] = [
  { value: "genero", label: "Cerrar brecha de género" },
  { value: "periferias", label: "Infraestructura en Periferias" },
  { value: "digitalizacion", label: "Digitalización" },
  { value: "economia", label: "Economía Creativa" },
];

const PRIORIDAD_OPTIONS: PrioridadAccion[] = [
  "Prioridad Alta",
  "Prioridad Media",
  "Prioridad Baja",
];

export function AdminPoliticaRecomendacionFormModal({
  modal,
  saving,
  error,
  onClose,
  onSubmit,
}: AdminPoliticaRecomendacionFormModalProps) {
  const [form, setForm] = useState<AdminPoliticaRecomendacionFormInput>({
    id: "",
    objetivoId: "genero",
    titulo: "",
    prioridad: "Prioridad Media",
    costoNivel: 2,
    alcaldia: CDMX_ALCALDIAS[0] ?? "Cuauhtémoc",
    descripcion: "",
    impacto: "",
    impactoCiudadanos: null,
    presupuestoMxn: null,
    orden: 0,
    activo: true,
  });

  useEffect(() => {
    if (modal.open) setForm(modal.initial);
  }, [modal]);

  if (!modal.open) return null;

  const isEdit = modal.mode === "edit";

  function updateField<K extends keyof AdminPoliticaRecomendacionFormInput>(
    key: K,
    value: AdminPoliticaRecomendacionFormInput[K],
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
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-geo-border bg-geo-card shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-geo-border bg-geo-card px-5 py-4">
          <h2 className="text-lg font-bold text-geo-navy">
            {isEdit ? "Editar recomendación" : "Nueva recomendación"}
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

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="pol-id" className="text-xs font-semibold text-geo-navy">
                ID *
              </label>
              <input
                id="pol-id"
                required
                disabled={isEdit}
                value={form.id}
                onChange={(e) =>
                  updateField("id", e.target.value.toLowerCase().replace(/\s/g, ""))
                }
                placeholder="g3"
                className="mt-1 w-full rounded-lg border border-geo-border px-3 py-2 text-sm outline-none focus:border-geo-pink disabled:bg-geo-surface"
              />
            </div>
            <div>
              <label htmlFor="pol-obj" className="text-xs font-semibold text-geo-navy">
                Objetivo *
              </label>
              <select
                id="pol-obj"
                value={form.objetivoId}
                onChange={(e) =>
                  updateField("objetivoId", e.target.value as AdminPoliticaObjetivoId)
                }
                className="mt-1 w-full rounded-lg border border-geo-border bg-geo-card px-3 py-2 text-sm outline-none focus:border-geo-pink"
              >
                {OBJETIVO_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="pol-titulo" className="text-xs font-semibold text-geo-navy">
              Título *
            </label>
            <input
              id="pol-titulo"
              required
              value={form.titulo}
              onChange={(e) => updateField("titulo", e.target.value)}
              className="mt-1 w-full rounded-lg border border-geo-border px-3 py-2 text-sm outline-none focus:border-geo-pink"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="pol-prior" className="text-xs font-semibold text-geo-navy">
                Prioridad *
              </label>
              <select
                id="pol-prior"
                value={form.prioridad}
                onChange={(e) =>
                  updateField("prioridad", e.target.value as PrioridadAccion)
                }
                className="mt-1 w-full rounded-lg border border-geo-border bg-geo-card px-3 py-2 text-sm outline-none focus:border-geo-pink"
              >
                {PRIORIDAD_OPTIONS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="pol-costo" className="text-xs font-semibold text-geo-navy">
                Costo (1–3) *
              </label>
              <select
                id="pol-costo"
                value={form.costoNivel}
                onChange={(e) =>
                  updateField("costoNivel", Number(e.target.value) as 1 | 2 | 3)
                }
                className="mt-1 w-full rounded-lg border border-geo-border bg-geo-card px-3 py-2 text-sm outline-none focus:border-geo-pink"
              >
                <option value={1}>$</option>
                <option value={2}>$$</option>
                <option value={3}>$$$</option>
              </select>
            </div>
            <div>
              <label htmlFor="pol-orden" className="text-xs font-semibold text-geo-navy">
                Orden
              </label>
              <input
                id="pol-orden"
                type="number"
                min={0}
                value={form.orden}
                onChange={(e) =>
                  updateField("orden", Number.parseInt(e.target.value, 10) || 0)
                }
                className="mt-1 w-full rounded-lg border border-geo-border px-3 py-2 text-sm outline-none focus:border-geo-pink"
              />
            </div>
          </div>

          <div>
            <label htmlFor="pol-alc" className="text-xs font-semibold text-geo-navy">
              Alcaldía focal *
            </label>
            <select
              id="pol-alc"
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
            <label htmlFor="pol-desc" className="text-xs font-semibold text-geo-navy">
              Descripción *
            </label>
            <textarea
              id="pol-desc"
              required
              rows={3}
              value={form.descripcion}
              onChange={(e) => updateField("descripcion", e.target.value)}
              className="mt-1 w-full rounded-lg border border-geo-border px-3 py-2 text-sm outline-none focus:border-geo-pink"
            />
          </div>

          <div>
            <label htmlFor="pol-impacto" className="text-xs font-semibold text-geo-navy">
              Impacto (texto público) *
            </label>
            <input
              id="pol-impacto"
              required
              value={form.impacto}
              onChange={(e) => updateField("impacto", e.target.value)}
              className="mt-1 w-full rounded-lg border border-geo-border px-3 py-2 text-sm outline-none focus:border-geo-pink"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="pol-ciud" className="text-xs font-semibold text-geo-navy">
                Ciudadanos beneficiados
              </label>
              <input
                id="pol-ciud"
                type="number"
                min={0}
                value={form.impactoCiudadanos ?? ""}
                onChange={(e) =>
                  updateField(
                    "impactoCiudadanos",
                    e.target.value === "" ? null : Number(e.target.value),
                  )
                }
                className="mt-1 w-full rounded-lg border border-geo-border px-3 py-2 text-sm outline-none focus:border-geo-pink"
              />
            </div>
            <div>
              <label htmlFor="pol-pres" className="text-xs font-semibold text-geo-navy">
                Presupuesto (MXN)
              </label>
              <input
                id="pol-pres"
                type="number"
                min={0}
                step={1000}
                value={form.presupuestoMxn ?? ""}
                onChange={(e) =>
                  updateField(
                    "presupuestoMxn",
                    e.target.value === "" ? null : Number(e.target.value),
                  )
                }
                className="mt-1 w-full rounded-lg border border-geo-border px-3 py-2 text-sm outline-none focus:border-geo-pink"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-geo-navy">
            <input
              type="checkbox"
              checked={form.activo}
              onChange={(e) => updateField("activo", e.target.checked)}
              className="rounded border-geo-border text-geo-pink focus:ring-geo-pink"
            />
            Visible en la página Políticas
          </label>

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
