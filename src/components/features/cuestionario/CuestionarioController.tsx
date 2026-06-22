"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchPageData } from "@/lib/api/fetch-page-data";
import { useCuestionarioController } from "@/hooks/use-cuestionario-controller";
import { useCuestionarioRealtime } from "@/hooks/use-cuestionario-realtime";
import type { CuestionarioPageData } from "@/lib/services/cuestionario.service";
import { CuestionarioView } from "./CuestionarioView";

function buildCuestionarioUrl(periodo: string, alcaldia: string): string {
  const params = new URLSearchParams();
  if (periodo) params.set("periodo", periodo);
  if (alcaldia && alcaldia !== "Todas") params.set("alcaldia", alcaldia);
  const qs = params.toString();
  return qs ? `/api/data/cuestionario?${qs}` : "/api/data/cuestionario";
}

function CuestionarioControllerInner({ data }: { data: CuestionarioPageData }) {
  const onFetch = useCallback(
    async (query: { periodo: string; alcaldia: string }) =>
      fetchPageData<CuestionarioPageData>(
        buildCuestionarioUrl(query.periodo, query.alcaldia),
      ),
    [],
  );

  const controller = useCuestionarioController({ initialData: data, onFetch });
  useCuestionarioRealtime(controller.reload, controller.data.dataSource === "supabase");
  return <CuestionarioView {...controller} />;
}

type CuestionarioControllerProps = {
  initialData?: CuestionarioPageData;
};

/** Controlador — cuestionario SECTEI (Supabase, sincronizado con app móvil). */
export function CuestionarioController({ initialData }: CuestionarioControllerProps) {
  const [data, setData] = useState<CuestionarioPageData | null>(initialData ?? null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData != null) return;

    let cancelled = false;

    fetchPageData<CuestionarioPageData>("/api/data/cuestionario")
      .then((next) => {
        if (!cancelled) {
          setData(next);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message =
          err instanceof Error ? err.message : "No se pudo cargar el cuestionario";
        setError(message);
      });

    return () => {
      cancelled = true;
    };
  }, [initialData]);

  if (error != null) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 bg-geo-surface px-4 text-center">
        <p className="text-sm font-medium text-geo-navy">Error al cargar el cuestionario</p>
        <p className="max-w-md text-sm text-geo-muted">{error}</p>
      </div>
    );
  }

  if (data == null) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 bg-geo-surface px-4">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-geo-pink border-t-transparent" />
        <p className="text-sm text-geo-muted">Cargando cuestionario SECTEI…</p>
      </div>
    );
  }

  return <CuestionarioControllerInner data={data} />;
}
