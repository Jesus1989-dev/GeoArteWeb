"use client";

import { Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/shared/Button";
import type { AdminConsultaDetailModalState } from "@/hooks/use-admin-controller";
import {
  CONSULTA_CONTACTO_ESTADO_LABELS,
  CONSULTA_CONTACTO_ESTADOS,
  type ConsultaContactoEstado,
} from "@/lib/domain/contacto";

type AdminConsultaDetailModalProps = {
  modal: AdminConsultaDetailModalState;
  saving: boolean;
  error: string | null;
  onClose: () => void;
  onSaveEstado: (estado: ConsultaContactoEstado) => void;
};

export function AdminConsultaDetailModal({
  modal,
  saving,
  error,
  onClose,
  onSaveEstado,
}: AdminConsultaDetailModalProps) {
  const [estado, setEstado] = useState<ConsultaContactoEstado>("nuevo");

  useEffect(() => {
    if (modal.open) setEstado(modal.consulta.estado);
  }, [modal]);

  if (!modal.open) return null;

  const { consulta } = modal;

  return (
    <div
      className="fixed inset-0 z-[600] flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="consulta-detail-title"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-geo-border bg-geo-card shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-geo-border px-5 py-4">
          <h2 id="consulta-detail-title" className="text-lg font-bold text-geo-navy">
            Detalle de consulta
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

        <div className="space-y-4 p-5">
          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}

          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-xs font-semibold uppercase text-geo-muted">Fecha</dt>
              <dd className="mt-1 text-geo-navy">{consulta.createdAtLabel}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase text-geo-muted">Nombre</dt>
              <dd className="mt-1 font-medium text-geo-navy">{consulta.nombre}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase text-geo-muted">Correo</dt>
              <dd className="mt-1">
                <a
                  href={`mailto:${consulta.email}?subject=${encodeURIComponent(`Re: ${consulta.asunto}`)}`}
                  className="text-geo-pink hover:underline"
                >
                  {consulta.email}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase text-geo-muted">Asunto</dt>
              <dd className="mt-1 text-geo-navy">{consulta.asunto}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase text-geo-muted">Mensaje</dt>
              <dd className="mt-1 whitespace-pre-wrap rounded-lg bg-geo-surface px-3 py-2.5 text-geo-navy">
                {consulta.mensaje}
              </dd>
            </div>
          </dl>

          <div>
            <label htmlFor="consulta-estado" className="block text-xs font-semibold uppercase text-geo-muted">
              Estado
            </label>
            <select
              id="consulta-estado"
              value={estado}
              onChange={(e) => setEstado(e.target.value as ConsultaContactoEstado)}
              disabled={saving}
              className="mt-1.5 w-full rounded-lg border border-geo-border bg-geo-card px-3 py-2.5 text-sm text-geo-navy outline-none focus:border-geo-pink focus:ring-2 focus:ring-geo-pink/15"
            >
              {CONSULTA_CONTACTO_ESTADOS.map((value) => (
                <option key={value} value={value}>
                  {CONSULTA_CONTACTO_ESTADO_LABELS[value]}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 border-t border-geo-border pt-4">
            <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>
              Cerrar
            </Button>
            <Button
              type="button"
              variant="primary"
              disabled={saving || estado === consulta.estado}
              className="gap-2"
              onClick={() => onSaveEstado(estado)}
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
              Guardar estado
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
