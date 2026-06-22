"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthProvider";
import { authRoutes } from "@/lib/data/mock/auth";
import {
  getReportesPageData,
  type ReportesPageData,
} from "@/lib/services/reportes.service";
import { useReportesController } from "@/hooks/use-reportes-controller";
import { consumeReportesRefreshFlag } from "@/lib/reportes/reportes-refresh";
import { ReportesView } from "./ReportesView";

/** Controlador — reportes (Supabase o mock). */
export function ReportesController() {
  const { session, ready, usesSupabase } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<ReportesPageData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadNonce, setReloadNonce] = useState(0);

  const loadData = useCallback(async () => {
    const next = await getReportesPageData({
      userId: session?.userId,
      autor: session?.nombre,
    });
    setData(next);
    setError(null);
    return next;
  }, [session?.userId, session?.nombre]);

  useEffect(() => {
    if (!ready) return;
    if (usesSupabase && session == null) {
      router.replace(`${authRoutes.login}?next=${encodeURIComponent("/reportes")}`);
    }
  }, [ready, session, usesSupabase, router]);

  useEffect(() => {
    if (!ready) return;
    if (usesSupabase && session == null) return;

    let cancelled = false;

    loadData().catch((err: unknown) => {
      if (cancelled) return;
      const message =
        err instanceof Error ? err.message : "No se pudo cargar reportes";
      setError(message);
    });

    return () => {
      cancelled = true;
    };
  }, [ready, session, usesSupabase, loadData, reloadNonce]);

  useEffect(() => {
    function tryRefreshFromAdmin() {
      if (consumeReportesRefreshFlag()) {
        setReloadNonce((n) => n + 1);
      }
    }

    tryRefreshFromAdmin();

    function onVisible() {
      if (document.visibilityState === "visible") {
        tryRefreshFromAdmin();
      }
    }

    window.addEventListener("focus", tryRefreshFromAdmin);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("focus", tryRefreshFromAdmin);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  if (!ready) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-geo-muted">
        Comprobando sesión…
      </div>
    );
  }

  if (usesSupabase && session == null) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="text-sm font-medium text-geo-navy">Inicia sesión para ver reportes</p>
        <p className="max-w-md text-sm text-geo-muted">
          Esta sección requiere una cuenta en Supabase (investigador o autoridad).
        </p>
        <Link
          href={`${authRoutes.login}?next=${encodeURIComponent("/reportes")}`}
          className="rounded-lg bg-geo-pink px-4 py-2 text-sm font-medium text-white hover:bg-geo-pink/90"
        >
          Ir a iniciar sesión
        </Link>
      </div>
    );
  }

  if (error != null) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="text-sm font-medium text-geo-navy">Error al cargar reportes</p>
        <p className="max-w-md text-sm text-geo-muted">{error}</p>
      </div>
    );
  }

  if (data == null) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-geo-muted">
        Cargando reportes…
      </div>
    );
  }

  return (
    <ReportesControllerInner
      data={data}
      autor={session?.nombre ?? "Demo"}
      onReload={loadData}
    />
  );
}

function ReportesControllerInner({
  data,
  autor,
  onReload,
}: {
  data: ReportesPageData;
  autor: string;
  onReload: () => Promise<ReportesPageData>;
}) {
  const searchParams = useSearchParams();
  const controller = useReportesController(data, {
    autor,
    onReload,
    initialPlantillaId: searchParams.get("plantilla"),
  });
  return <ReportesView data={data} {...controller} />;
}
