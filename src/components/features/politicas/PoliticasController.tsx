"use client";

import { usePoliticasPageData } from "@/hooks/use-politicas-page-data";
import type { PoliticasPageData } from "@/lib/services/politicas.service";
import { PoliticasView } from "./PoliticasView";

type PoliticasControllerProps = {
  initialData?: PoliticasPageData;
};

/** Controlador — políticas y recomendaciones (Supabase o mock). */
export function PoliticasController({ initialData }: PoliticasControllerProps) {
  const { data, error, isLoading } = usePoliticasPageData(initialData);

  if (error != null) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 bg-geo-surface px-4 text-center">
        <p className="text-sm font-medium text-geo-navy">Error al cargar políticas</p>
        <p className="max-w-md text-sm text-geo-muted">{error}</p>
      </div>
    );
  }

  if (isLoading || data == null) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 bg-geo-surface px-4">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-geo-pink border-t-transparent" />
        <p className="text-sm text-geo-muted">Cargando recomendaciones de política…</p>
      </div>
    );
  }

  return <PoliticasView data={data} />;
}
