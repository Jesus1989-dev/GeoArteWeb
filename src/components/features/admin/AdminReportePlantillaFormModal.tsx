"use client";

import { Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/shared/Button";
import type { AdminReportePlantillaFormInput } from "@/lib/domain/admin";
import type { AdminReportePlantillaFormModalState } from "@/hooks/use-admin-controller";

const FORMATO_OPTIONS: AdminReportePlantillaFormInput["formatos"][number][] = [
  "PDF",
  "CSV",
  "XLSX",
];

type AdminReportePlantillaFormModalProps = {
  modal: AdminReportePlantillaFormModalState;
  saving: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (input: AdminReportePlantillaFormInput) => void;
};

export function AdminReportePlantillaFormModal({
  modal,
  saving,
  error,
  onClose,
  onSubmit,
}: AdminReportePlantillaFormModalProps) {
  const [form, setForm] = useState<AdminReportePlantillaFormInput>({
    id: "",
    titulo: "",
    descripcion: "",
    categoria: "",
    formatos: ["PDF"],
    filtrosDefaultJson: "{}",
    orden: 0,
    activo: true,
  });

  useEffect(() => {
    if (modal.open) setForm(modal.initial);
  }, [modal]);

  if (!modal.open) return null;

  const isEdit = modal.mode === "edit";

  function updateField<K extends keyof AdminReportePlantillaFormInput>(
    key: K,
    value: AdminReportePlantillaFormInput[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleFormato(formato: AdminReportePlantillaFormInput["formatos"][number]) {
    setForm((prev) => {
      const has = prev.formatos.includes(formato);
      const next = has
        ? prev.formatos.filter((f) => f !== formato)
        : [...prev.formatos, formato];
      return { ...prev, formatos: next.length > 0 ? next : prev.formatos };
    });
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
            {isEdit ? "Editar plantilla" : "Nueva plantilla"}
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
              <label htmlFor="rep-id" className="text-xs font-semibold text-geo-navy">
                ID *
              </label>
              <input
                id="rep-id"
                required
                disabled={isEdit}
                value={form.id}
                onChange={(e) =>
                  updateField("id", e.target.value.toLowerCase().replace(/\s/g, ""))
                }
                placeholder="p4"
                className="mt-1 w-full rounded-lg border border-geo-border px-3 py-2 text-sm outline-none focus:border-geo-pink disabled:bg-geo-surface"
              />
              <p className="mt-1 text-[11px] text-geo-muted">
                Debe comenzar con p (ej. p1, p4).
              </p>
            </div>
            <div>
              <label htmlFor="rep-orden" className="text-xs font-semibold text-geo-navy">
                Orden
              </label>
              <input
                id="rep-orden"
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
            <label htmlFor="rep-titulo" className="text-xs font-semibold text-geo-navy">
              Título *
            </label>
            <input
              id="rep-titulo"
              required
              value={form.titulo}
              onChange={(e) => updateField("titulo", e.target.value)}
              className="mt-1 w-full rounded-lg border border-geo-border px-3 py-2 text-sm outline-none focus:border-geo-pink"
            />
          </div>

          <div>
            <label htmlFor="rep-desc" className="text-xs font-semibold text-geo-navy">
              Descripción *
            </label>
            <textarea
              id="rep-desc"
              required
              rows={2}
              value={form.descripcion}
              onChange={(e) => updateField("descripcion", e.target.value)}
              className="mt-1 w-full rounded-lg border border-geo-border px-3 py-2 text-sm outline-none focus:border-geo-pink"
            />
          </div>

          <div>
            <label htmlFor="rep-cat" className="text-xs font-semibold text-geo-navy">
              Categoría *
            </label>
            <input
              id="rep-cat"
              required
              value={form.categoria}
              onChange={(e) => updateField("categoria", e.target.value)}
              className="mt-1 w-full rounded-lg border border-geo-border px-3 py-2 text-sm outline-none focus:border-geo-pink"
            />
          </div>

          <div>
            <span className="text-xs font-semibold text-geo-navy">Formatos *</span>
            <div className="mt-2 flex flex-wrap gap-3">
              {FORMATO_OPTIONS.map((formato) => (
                <label key={formato} className="flex items-center gap-2 text-sm text-geo-navy">
                  <input
                    type="checkbox"
                    checked={form.formatos.includes(formato)}
                    onChange={() => toggleFormato(formato)}
                    className="rounded border-geo-border text-geo-pink focus:ring-geo-pink"
                  />
                  {formato}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="rep-filtros" className="text-xs font-semibold text-geo-navy">
              Filtros por defecto (JSON) *
            </label>
            <textarea
              id="rep-filtros"
              required
              rows={8}
              spellCheck={false}
              value={form.filtrosDefaultJson}
              onChange={(e) => updateField("filtrosDefaultJson", e.target.value)}
              className="mt-1 w-full rounded-lg border border-geo-border px-3 py-2 font-mono text-xs outline-none focus:border-geo-pink"
            />
            <p className="mt-1 text-[11px] text-geo-muted">
              Claves: alcaldia, disciplina, periodo, nse, edad, genero. Valores literales o{" "}
              <code className="rounded bg-geo-hover px-1">{`{"pick":"first"}`}</code>.
            </p>
          </div>

          <label className="flex items-center gap-2 text-sm text-geo-navy">
            <input
              type="checkbox"
              checked={form.activo}
              onChange={(e) => updateField("activo", e.target.checked)}
              className="rounded border-geo-border text-geo-pink focus:ring-geo-pink"
            />
            Visible en el Centro de reportes
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
