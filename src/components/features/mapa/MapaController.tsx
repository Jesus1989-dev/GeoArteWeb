"use client";

import MapaInteractivo from "@/components/mapa/MapaInteractivo";
import { useMapaPageData } from "@/hooks/use-mapa-page-data";
import type { MapaPageData } from "@/lib/services/mapa.service";

type MapaControllerProps = {
  initialData?: MapaPageData;
};

/** Controlador — mapa interactivo (Supabase o mock). */
export function MapaController({ initialData }: MapaControllerProps) {
  const { data, error, isLoading } = useMapaPageData(initialData);

  if (error != null) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 bg-geo-surface px-4 text-center">
        <p className="text-sm font-medium text-geo-navy">Error al cargar el mapa</p>
        <p className="max-w-md text-sm text-geo-muted">{error}</p>
      </div>
    );
  }

  if (isLoading || data == null) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 bg-geo-surface px-4">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-geo-pink border-t-transparent" />
        <p className="text-sm text-geo-muted">Cargando espacios culturales…</p>
      </div>
    );
  }

  return <MapaInteractivo data={data} />;
}
