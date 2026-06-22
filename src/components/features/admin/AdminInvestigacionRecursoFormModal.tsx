"use client";

import { Loader2, Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/shared/Button";
import type { AdminRecursoCualitativoFormInput } from "@/lib/domain/admin";
import type { TipoRecursoDb, TranscripcionRol } from "@/lib/domain/investigacion";
import type { AdminRecursoFormModalState } from "@/hooks/use-admin-controller";
import { CDMX_ALCALDIAS } from "@/lib/data/supabase/search.repository";

type AdminInvestigacionRecursoFormModalProps = {
  modal: AdminRecursoFormModalState;
  saving: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (input: AdminRecursoCualitativoFormInput) => void;
};

const TIPO_OPTIONS: { value: TipoRecursoDb; label: string }[] = [
  { value: "entrevista", label: "Entrevista" },
  { value: "encuesta", label: "Encuesta" },
  { value: "grupo_focal", label: "Grupo focal" },
];

export function AdminInvestigacionRecursoFormModal({
  modal,
  saving,
  error,
  onClose,
  onSubmit,
}: AdminInvestigacionRecursoFormModalProps) {
  const [form, setForm] = useState<AdminRecursoCualitativoFormInput>({
    id: "",
    tipo: "entrevista",
    fecha: "",
    titulo: "",
    alcaldia: CDMX_ALCALDIAS[0] ?? "Cuauhtémoc",
    snippet: "",
    verificado: false,
    digitalizado: true,
    investigador: "Equipo investigación",
    fechaDetalle: "",
    resumen: "",
    transcripcion: [{ rol: "Investigador", texto: "" }],
    lat: null,
    lng: null,
    orden: 0,
    activo: true,
  });

  useEffect(() => {
    if (modal.open) setForm(modal.initial);
  }, [modal]);

  if (!modal.open) return null;

  const isEdit = modal.mode === "edit";

  function updateField<K extends keyof AdminRecursoCualitativoFormInput>(
    key: K,
    value: AdminRecursoCualitativoFormInput[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function updateBloque(
    index: number,
    field: "rol" | "texto",
    value: TranscripcionRol | string,
  ) {
    setForm((prev) => {
      const next = [...prev.transcripcion];
      const bloque = { ...next[index], [field]: value };
      next[index] = bloque;
      return { ...prev, transcripcion: next };
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
            {isEdit ? "Editar recurso cualitativo" : "Nuevo recurso cualitativo"}
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
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-geo-navy">
              ID
              <input
                value={form.id}
                onChange={(e) => updateField("id", e.target.value)}
                disabled={isEdit}
                className="mt-1 w-full rounded-lg border border-geo-border px-3 py-2 text-sm disabled:bg-geo-surface"
                placeholder="c6"
                required
              />
            </label>
            <label className="block text-sm font-medium text-geo-navy">
              Orden
              <input
                type="number"
                min={0}
                value={form.orden}
                onChange={(e) => updateField("orden", Number(e.target.value) || 0)}
                className="mt-1 w-full rounded-lg border border-geo-border px-3 py-2 text-sm"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-geo-navy">
              Tipo
              <select
                value={form.tipo}
                onChange={(e) => updateField("tipo", e.target.value as TipoRecursoDb)}
                className="mt-1 w-full rounded-lg border border-geo-border px-3 py-2 text-sm"
              >
                {TIPO_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium text-geo-navy">
              Fecha (listado)
              <input
                value={form.fecha}
                onChange={(e) => updateField("fecha", e.target.value)}
                className="mt-1 w-full rounded-lg border border-geo-border px-3 py-2 text-sm"
                placeholder="12 may 2024"
                required
              />
            </label>
          </div>

          <label className="block text-sm font-medium text-geo-navy">
            Título
            <input
              value={form.titulo}
              onChange={(e) => updateField("titulo", e.target.value)}
              className="mt-1 w-full rounded-lg border border-geo-border px-3 py-2 text-sm"
              required
            />
          </label>

          <label className="block text-sm font-medium text-geo-navy">
            Alcaldía
            <select
              value={form.alcaldia}
              onChange={(e) => updateField("alcaldia", e.target.value)}
              className="mt-1 w-full rounded-lg border border-geo-border px-3 py-2 text-sm"
            >
              {CDMX_ALCALDIAS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
              <option value="Varias">Varias</option>
            </select>
          </label>

          <label className="block text-sm font-medium text-geo-navy">
            Fragmento (snippet)
            <textarea
              value={form.snippet}
              onChange={(e) => updateField("snippet", e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-lg border border-geo-border px-3 py-2 text-sm"
              required
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-geo-navy">
              Investigador/a
              <input
                value={form.investigador}
                onChange={(e) => updateField("investigador", e.target.value)}
                className="mt-1 w-full rounded-lg border border-geo-border px-3 py-2 text-sm"
                required
              />
            </label>
            <label className="block text-sm font-medium text-geo-navy">
              Fecha detalle
              <input
                value={form.fechaDetalle}
                onChange={(e) => updateField("fechaDetalle", e.target.value)}
                className="mt-1 w-full rounded-lg border border-geo-border px-3 py-2 text-sm"
                placeholder="12 may 2024 · 47 min"
                required
              />
            </label>
          </div>

          <label className="block text-sm font-medium text-geo-navy">
            Resumen ejecutivo
            <textarea
              value={form.resumen}
              onChange={(e) => updateField("resumen", e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-lg border border-geo-border px-3 py-2 text-sm"
              required
            />
          </label>

          <div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-geo-navy">Transcripción</span>
              <button
                type="button"
                onClick={() =>
                  updateField("transcripcion", [
                    ...form.transcripcion,
                    { rol: "Informante", texto: "" },
                  ])
                }
                className="flex items-center gap-1 text-xs text-geo-pink hover:underline"
              >
                <Plus className="h-3 w-3" />
                Agregar bloque
              </button>
            </div>
            <div className="mt-2 space-y-3">
              {form.transcripcion.map((bloque, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-geo-border bg-geo-surface/40 p-3"
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <select
                      value={bloque.rol}
                      onChange={(e) =>
                        updateBloque(i, "rol", e.target.value as TranscripcionRol)
                      }
                      className="rounded-md border border-geo-border bg-geo-card px-2 py-1 text-xs"
                    >
                      <option value="Investigador">Investigador</option>
                      <option value="Informante">Informante</option>
                    </select>
                    {form.transcripcion.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          updateField(
                            "transcripcion",
                            form.transcripcion.filter((_, j) => j !== i),
                          )
                        }
                        className="rounded p-1 text-geo-muted hover:bg-geo-card"
                        title="Eliminar bloque"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <textarea
                    value={bloque.texto}
                    onChange={(e) => updateBloque(i, "texto", e.target.value)}
                    rows={2}
                    className="w-full rounded-md border border-geo-border bg-geo-card px-2 py-1.5 text-sm"
                    required
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-geo-navy">
              Latitud (opcional)
              <input
                type="number"
                step="any"
                value={form.lat ?? ""}
                onChange={(e) =>
                  updateField(
                    "lat",
                    e.target.value === "" ? null : Number(e.target.value),
                  )
                }
                className="mt-1 w-full rounded-lg border border-geo-border px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-sm font-medium text-geo-navy">
              Longitud (opcional)
              <input
                type="number"
                step="any"
                value={form.lng ?? ""}
                onChange={(e) =>
                  updateField(
                    "lng",
                    e.target.value === "" ? null : Number(e.target.value),
                  )
                }
                className="mt-1 w-full rounded-lg border border-geo-border px-3 py-2 text-sm"
              />
            </label>
          </div>
          <p className="text-xs text-geo-muted">
            Latitud y longitud habilitan el botón «Ver en mapa» en el repositorio público.
          </p>

          <div className="flex flex-wrap gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.verificado}
                onChange={(e) => updateField("verificado", e.target.checked)}
              />
              Verificado
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.digitalizado}
                onChange={(e) => updateField("digitalizado", e.target.checked)}
              />
              Digitalizado
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.activo}
                onChange={(e) => updateField("activo", e.target.checked)}
              />
              Activo (visible en web)
            </label>
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
