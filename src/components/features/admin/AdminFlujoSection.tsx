"use client";

import { Check, Loader2, SquarePen } from "lucide-react";
import { AdminEspacioEstado } from "@/components/features/admin/AdminEspacioEstado";
import type { AdminControllerState } from "@/hooks/use-admin-controller";
import type { AdminEspacioRow } from "@/lib/domain/admin";
import type { AdminPageData } from "@/lib/services/admin.service";
import { getEspacioPublishBlocker } from "@/lib/espacios/espacio-registro";
import { cn } from "@/lib/utils";

type AdminFlujoSectionProps = {
  espacios: AdminEspacioRow[];
  loading: boolean;
  publishingId: string | null;
  dataSource: AdminPageData["dataSource"];
  onEdit: (row: AdminEspacioRow) => void;
  onPublish: AdminControllerState["publishFlujoEspacio"];
  onOpenEditor?: (row: AdminEspacioRow) => void;
};

const COLUMNAS = [
  { id: "Borrador" as const, titulo: "Borrador", subtitulo: "Sin coordenadas" },
  { id: "Revisión" as const, titulo: "Revisión", subtitulo: "Faltan horario o teléfono" },
];

export function AdminFlujoSection({
  espacios,
  loading,
  publishingId,
  dataSource,
  onEdit,
  onPublish,
  onOpenEditor,
}: AdminFlujoSectionProps) {
  return (
    <div className="mt-6">
      {loading && (
        <p className="mb-4 text-xs text-geo-muted">Cargando espacios en revisión…</p>
      )}

      <p className="mb-4 text-sm text-geo-muted">
        Usa <strong className="text-geo-navy">Marcar como publicado</strong> cuando el espacio
        esté listo para el mapa. Si faltan horario o teléfono, se rellenan con valores
        institucionales (&quot;Por confirmar&quot; / &quot;No registrado&quot;).
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        {COLUMNAS.map((col) => {
          const filas = espacios.filter((e) => e.estado === col.id);
          return (
            <div
              key={col.id}
              className="rounded-xl border border-geo-border bg-geo-card shadow-sm"
            >
              <div className="border-b border-geo-border px-4 py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-geo-navy">{col.titulo}</h3>
                    <p className="text-xs text-geo-muted">{col.subtitulo}</p>
                  </div>
                  <span className="rounded-full bg-geo-hover px-2.5 py-0.5 text-xs font-semibold text-geo-navy">
                    {filas.length}
                  </span>
                </div>
              </div>
              <ul className="max-h-[420px] divide-y divide-gray-100 overflow-y-auto">
                {filas.map((row) => {
                  const blocker = getEspacioPublishBlocker(row);
                  const publishing = publishingId === row.fullId;
                  const canPublish = blocker == null && !publishing;

                  return (
                    <li
                      key={row.fullId}
                      className="flex flex-col gap-2 px-4 py-3 hover:bg-geo-hover/80 sm:flex-row sm:items-start sm:justify-between"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {row.nombre}
                        </p>
                        <p className="text-xs text-geo-muted">
                          {row.alcaldia} · {row.id}
                        </p>
                        <div className="mt-1">
                          <AdminEspacioEstado estado={row.estado} />
                        </div>
                        {blocker && (
                          <p className="mt-1 text-xs text-amber-800">{blocker}</p>
                        )}
                      </div>
                      <div className="flex shrink-0 flex-wrap items-center gap-1">
                        {col.id === "Borrador" && onOpenEditor && (
                          <button
                            type="button"
                            onClick={() => onOpenEditor(row)}
                            className="rounded-lg border border-geo-border px-2.5 py-1.5 text-xs font-medium text-geo-navy hover:bg-geo-surface"
                          >
                            Editor mapa
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onEdit(row)}
                          className={cn(
                            "rounded-lg p-2 text-geo-muted transition hover:bg-geo-hover hover:text-geo-navy",
                          )}
                          aria-label={`Editar ${row.nombre}`}
                        >
                          <SquarePen className="h-4 w-4" strokeWidth={1.75} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onPublish(row)}
                          disabled={!canPublish}
                          title={blocker ?? "Marcar como publicado en el mapa"}
                          className={cn(
                            "inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition",
                            canPublish
                              ? "bg-emerald-600 text-white hover:bg-emerald-700"
                              : "cursor-not-allowed bg-geo-hover text-geo-muted",
                          )}
                        >
                          {publishing ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                          )}
                          Publicar
                        </button>
                      </div>
                    </li>
                  );
                })}
                {filas.length === 0 && !loading && (
                  <li className="px-4 py-8 text-center text-sm text-geo-muted">
                    No hay espacios en esta columna.
                  </li>
                )}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
