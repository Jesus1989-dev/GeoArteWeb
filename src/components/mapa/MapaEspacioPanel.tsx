"use client";

import Link from "next/link";
import { Bookmark, BookmarkCheck, Loader2, MapPin, Navigation, X } from "lucide-react";
import { EspacioImagen } from "@/components/mapa/EspacioImagen";
import type { Espacio } from "@/lib/domain/mapa";
import { buildEspacioDirectionsUrl } from "@/lib/espacios/espacio-direcciones";
import type { MapaPageData } from "@/lib/services/mapa.service";
import { MapPanelShell } from "@/components/shared/MapPanelShell";
import { cn } from "@/lib/utils";

type MapaEspacioPanelProps = {
  espacio: Espacio;
  tipoColors: MapaPageData["tipoColors"];
  guardado: boolean;
  puedeGuardar: boolean;
  guardando: boolean;
  onToggleGuardado: () => void;
  onCerrar: () => void;
};

export function MapaEspacioPanel({
  espacio,
  tipoColors,
  guardado,
  puedeGuardar,
  guardando,
  onToggleGuardado,
  onCerrar,
}: MapaEspacioPanelProps) {
  const tipo = tipoColors[espacio.tipo];
  const directionsUrl = buildEspacioDirectionsUrl(espacio);

  return (
    <MapPanelShell>
      <EspacioImagen
        nombre={espacio.nombre}
        imagenUrl={espacio.imagenUrl}
        tipoColor={tipo}
        className="mb-3"
      />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <span
            className="text-[10px] font-semibold uppercase tracking-wide"
            style={{ color: tipo.stroke }}
          >
            {tipo.label}
          </span>
          <h3 className="mt-1 text-base font-semibold text-geo-navy">{espacio.nombre}</h3>
          <p className="mt-1 flex items-start gap-1.5 text-xs text-geo-muted">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
            {espacio.direccion}
          </p>
        </div>
        <button
          type="button"
          onClick={onCerrar}
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-geo-muted transition hover:bg-gray-100 hover:text-geo-navy"
          aria-label="Cerrar detalle"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <a
        href={directionsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-geo-border bg-geo-surface/60 px-4 py-2.5 text-sm font-medium text-geo-navy transition hover:border-geo-pink/40 hover:bg-geo-surface"
      >
        <Navigation className="h-4 w-4 shrink-0 text-geo-pink" aria-hidden />
        Cómo llegar
      </a>

      <div className="mt-3 flex flex-wrap gap-2">
        {!puedeGuardar ? (
          <Link
            href="/login"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-geo-navy px-4 py-2 text-sm font-medium text-white transition hover:bg-geo-navy/90"
          >
            <Bookmark className="h-4 w-4" />
            Inicia sesión para guardar
          </Link>
        ) : (
          <button
            type="button"
            disabled={guardando}
            onClick={onToggleGuardado}
            className={cn(
              "inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition disabled:opacity-60",
              guardado
                ? "border border-geo-pink bg-geo-pink/5 text-geo-pink hover:bg-geo-pink/10"
                : "bg-geo-navy text-white hover:bg-geo-navy/90",
            )}
          >
            {guardando ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : guardado ? (
              <BookmarkCheck className="h-4 w-4" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
            {guardando
              ? "Guardando…"
              : guardado
                ? "Quitar de guardados"
                : "Guardar espacio"}
          </button>
        )}
        <Link
          href="/perfil"
          className="inline-flex items-center justify-center rounded-lg border border-geo-border px-4 py-2 text-sm font-medium text-geo-navy transition hover:bg-geo-surface"
        >
          Mi perfil
        </Link>
      </div>
    </MapPanelShell>
  );
}
