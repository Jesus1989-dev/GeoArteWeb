"use client";

import { useEffect, useState } from "react";
import { useDashboardController } from "@/hooks/use-dashboard-controller";
import { fetchPageData } from "@/lib/api/fetch-page-data";
import type { DashboardPageData } from "@/lib/services/dashboard.service";
import { DashboardView } from "./DashboardView";

type DashboardControllerProps = {
  initialData?: DashboardPageData;
};

function DashboardControllerInner({ data }: { data: DashboardPageData }) {
  const controller = useDashboardController(data);
  return <DashboardView {...controller} />;
}

/** Controlador — dashboard estadístico (Supabase o mock). */
export function DashboardController({ initialData }: DashboardControllerProps) {
  const [data, setData] = useState<DashboardPageData | null>(initialData ?? null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData != null) return;

    let cancelled = false;

    fetchPageData<DashboardPageData>("/api/data/dashboard?includeEspacios=false")
      .then((next) => {
        if (!cancelled) {
          setData(next);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message =
          err instanceof Error ? err.message : "No se pudo cargar el dashboard";
        setError(message);
      });

    return () => {
      cancelled = true;
    };
  }, [initialData]);

  if (error != null) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 bg-geo-surface px-4 text-center">
        <p className="text-sm font-medium text-geo-navy">Error al cargar el dashboard</p>
        <p className="max-w-md text-sm text-geo-muted">{error}</p>
      </div>
    );
  }

  if (data == null) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 bg-geo-surface px-4">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-geo-pink border-t-transparent" />
        <p className="text-sm text-geo-muted">Cargando métricas culturales…</p>
      </div>
    );
  }

  return <DashboardControllerInner data={data} />;
}
