"use client";

import { useHomePageData } from "@/hooks/use-home-page-data";
import type { HomePageData } from "@/lib/services/home.service";
import { HomeView } from "./HomeView";

type HomeControllerProps = {
  initialData?: HomePageData;
};

/** Controlador — orquesta modelo (servicio) y vista. */
export function HomeController({ initialData }: HomeControllerProps) {
  const { data, error, refreshing, refresh } = useHomePageData(initialData);

  if (error != null && data == null) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 bg-geo-surface px-4 text-center">
        <p className="text-sm font-medium text-geo-navy">Error al cargar la página de inicio</p>
        <p className="max-w-md text-sm text-geo-muted">{error}</p>
        <button
          type="button"
          onClick={refresh}
          className="rounded-lg border border-geo-border bg-white px-4 py-2 text-sm font-medium text-geo-navy hover:border-geo-pink"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (data == null) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 bg-geo-surface px-4">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-geo-pink border-t-transparent" />
        <p className="text-sm text-geo-muted">Cargando indicadores culturales…</p>
      </div>
    );
  }

  return <HomeView data={data} refreshing={refreshing} onRefresh={refresh} />;
}
