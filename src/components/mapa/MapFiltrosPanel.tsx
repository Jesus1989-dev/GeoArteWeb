"use client";

import { ChevronDown, X } from "lucide-react";
import { ESPEACIO_TIPOS, ESPEACIO_TIPO_LABELS, type EspacioTipo } from "@/lib/domain/mapa";
import type { MapaFiltrosAvanzados } from "@/lib/domain/mapa-territorial";
import { CDMX_ALCALDIAS } from "@/lib/data/supabase/search.repository";
import { cn } from "@/lib/utils";

type MapFiltrosPanelProps = {
  open: boolean;
  onClose: () => void;
  filtros: MapaFiltrosAvanzados;
  onChange: (next: MapaFiltrosAvanzados) => void;
  alcaldiaSeleccionada: string;
  onAlcaldiaChange: (alcaldia: string) => void;
  onAplicar: () => void;
  onLimpiar: () => void;
};

export function MapFiltrosPanel({
  open,
  onClose,
  filtros,
  onChange,
  alcaldiaSeleccionada,
  onAlcaldiaChange,
  onAplicar,
  onLimpiar,
}: MapFiltrosPanelProps) {
  if (!open) return null;

  function toggleTipo(tipo: EspacioTipo) {
    onChange({
      ...filtros,
      tipos: { ...filtros.tipos, [tipo]: !filtros.tipos[tipo] },
    });
  }

  return (
    <div
      className="fixed inset-0 z-[1200] flex items-end justify-center bg-black/30 p-0 sm:items-start sm:justify-end sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mapa-filtros-title"
      onClick={onClose}
    >
      <div
        className="max-h-[min(90vh,640px)] w-full max-w-md overflow-hidden rounded-t-2xl border border-geo-border bg-geo-card shadow-xl sm:max-h-none sm:rounded-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-geo-border px-4 py-3">
          <h2 id="mapa-filtros-title" className="text-sm font-bold text-geo-navy">
            Filtros avanzados
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-geo-muted hover:bg-geo-surface hover:text-geo-navy"
            aria-label="Cerrar filtros"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[min(80vh,640px)] space-y-5 overflow-y-auto p-4">
          <div>
            <label htmlFor="filtro-alcaldia" className="text-xs font-semibold text-geo-navy">
              Alcaldía
            </label>
            <div className="relative mt-1.5">
              <select
                id="filtro-alcaldia"
                value={alcaldiaSeleccionada}
                onChange={(event) => onAlcaldiaChange(event.target.value)}
                className="w-full appearance-none rounded-lg border border-geo-border bg-geo-card py-2.5 pl-3 pr-9 text-sm text-geo-navy shadow-sm outline-none focus:border-geo-pink focus:ring-2 focus:ring-geo-pink/20"
              >
                <option value="">Todas las alcaldías</option>
                {CDMX_ALCALDIAS.map((nombre) => (
                  <option key={nombre} value={nombre}>
                    {nombre}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-geo-muted"
                aria-hidden
              />
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-geo-navy">Tipos de espacio</p>
            <div className="mt-2 max-h-52 space-y-2 overflow-y-auto pr-1">
              {ESPEACIO_TIPOS.map((tipo) => (
                <label
                  key={tipo}
                  className="flex cursor-pointer items-center gap-2 text-sm text-geo-navy"
                >
                  <input
                    type="checkbox"
                    checked={filtros.tipos[tipo]}
                    onChange={() => toggleTipo(tipo)}
                    className="h-4 w-4 rounded border-geo-border text-geo-pink focus:ring-geo-pink/30"
                  />
                  {ESPEACIO_TIPO_LABELS[tipo]}
                </label>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-geo-navy">Brecha territorial mínima</span>
              <span className="text-geo-muted">{filtros.brechaMinima}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={80}
              step={5}
              value={filtros.brechaMinima}
              onChange={(event) =>
                onChange({ ...filtros, brechaMinima: Number(event.target.value) })
              }
              className="mt-2 w-full accent-geo-pink"
            />
          </div>

          <label className="flex cursor-pointer items-start gap-2 text-sm text-geo-navy">
            <input
              type="checkbox"
              checked={filtros.soloVacios}
              onChange={(event) =>
                onChange({ ...filtros, soloVacios: event.target.checked })
              }
              className="mt-0.5 h-4 w-4 rounded border-geo-border text-geo-pink"
            />
            <span>
              Resaltar solo vacíos territoriales
              <span className="mt-0.5 block text-xs text-geo-muted">
                Muestra alcaldías con brecha ≥ 35% en la capa de vacíos.
              </span>
            </span>
          </label>
        </div>

        <div className="flex gap-2 border-t border-geo-border p-4">
          <button
            type="button"
            onClick={onLimpiar}
            className="flex-1 rounded-lg border border-geo-border py-2.5 text-sm font-medium text-geo-navy hover:bg-geo-surface"
          >
            Limpiar
          </button>
          <button
            type="button"
            onClick={onAplicar}
            className={cn(
              "flex-1 rounded-lg py-2.5 text-sm font-semibold text-white",
              "bg-geo-pink hover:bg-geo-pink/90",
            )}
          >
            Aplicar filtros
          </button>
        </div>
      </div>
    </div>
  );
}
