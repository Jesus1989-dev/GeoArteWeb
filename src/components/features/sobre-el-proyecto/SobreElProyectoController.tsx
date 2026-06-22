"use client";

import { useSobreElProyectoPageData } from "@/hooks/use-sobre-el-proyecto-page-data";
import type { SobreElProyectoPageData } from "@/lib/services/sobre-el-proyecto.service";
import { SobreElProyectoView } from "./SobreElProyectoView";

type SobreElProyectoControllerProps = {
  initialData?: SobreElProyectoPageData;
};

/** Controlador — sobre el proyecto (fuentes desde Supabase o mock). */
export function SobreElProyectoController({ initialData }: SobreElProyectoControllerProps) {
  const { data, error, isLoading, refresh } = useSobreElProyectoPageData(initialData);

  if (error != null && data == null) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 bg-geo-surface px-4 text-center">
        <p className="text-sm font-medium text-geo-navy">Error al cargar el proyecto</p>
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

  if (isLoading || data == null) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 bg-geo-surface px-4">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-geo-pink border-t-transparent" />
        <p className="text-sm text-geo-muted">Cargando información del proyecto…</p>
      </div>
    );
  }

  return <SobreElProyectoView data={data} />;
}
