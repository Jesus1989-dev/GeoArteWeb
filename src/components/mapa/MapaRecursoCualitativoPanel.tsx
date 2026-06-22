"use client";

import Link from "next/link";
import { MapPin, X } from "lucide-react";
import { Button } from "@/components/shared/Button";
import type { RecursoCualitativo } from "@/lib/domain/investigacion";
import { MapPanelShell } from "@/components/shared/MapPanelShell";
import { buildInvestigacionUrlForRecurso } from "@/lib/investigacion/assemble-investigacion-page";

type MapaRecursoCualitativoPanelProps = {
  recurso: RecursoCualitativo;
  onCerrar: () => void;
};

export function MapaRecursoCualitativoPanel({
  recurso,
  onCerrar,
}: MapaRecursoCualitativoPanelProps) {
  return (
    <MapPanelShell>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="inline-block rounded bg-geo-pink/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-geo-pink">
            {recurso.tipo}
          </span>
          <h3 className="mt-2 text-sm font-semibold leading-snug text-geo-navy">
            {recurso.titulo}
          </h3>
          <p className="mt-1 flex items-center gap-1 text-xs text-geo-muted">
            <MapPin className="h-3 w-3 shrink-0" />
            {recurso.alcaldia}
          </p>
          <p className="mt-2 line-clamp-2 text-xs text-geo-muted">{recurso.snippet}</p>
        </div>
        <button
          type="button"
          onClick={onCerrar}
          className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-md text-geo-muted hover:bg-geo-surface"
          aria-label="Cerrar panel de recurso"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-4">
        <Button href={buildInvestigacionUrlForRecurso(recurso.id)} size="sm">
          Ver ficha en investigación
        </Button>
      </div>
    </MapPanelShell>
  );
}
