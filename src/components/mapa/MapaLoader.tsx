"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import type { MapaPageData } from "@/lib/services/mapa.service";

const MapaController = dynamic(
  () =>
    import("@/components/features/mapa/MapaController").then((m) => ({
      default: m.MapaController,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 bg-geo-surface px-4">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-geo-pink border-t-transparent" />
        <p className="text-sm text-geo-muted">Cargando mapa…</p>
      </div>
    ),
  },
);

type MapaLoaderProps = {
  initialData?: MapaPageData;
};

export function MapaLoader({ initialData }: MapaLoaderProps) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 bg-geo-surface px-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-geo-pink border-t-transparent" />
          <p className="text-sm text-geo-muted">Cargando mapa…</p>
        </div>
      }
    >
      <MapaController initialData={initialData} />
    </Suspense>
  );
}
