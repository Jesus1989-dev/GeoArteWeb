"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthProvider";
import { useAdminController } from "@/hooks/use-admin-controller";
import { authRoutes } from "@/lib/data/mock/auth";
import { fetchPageData } from "@/lib/api/fetch-page-data";
import { markHomeDataStale } from "@/lib/data/home-revalidation";
import type { AdminPageData } from "@/lib/services/admin.service";
import { AdminView } from "./AdminView";

function AdminControllerInner({ data }: { data: AdminPageData }) {
  const searchParams = useSearchParams();
  const initialSeccion = searchParams.get("seccion");
  const controller = useAdminController(data, { initialSeccion });
  return <AdminView data={data} {...controller} />;
}

/** Controlador — panel de administración (Supabase o mock). */
export function AdminController() {
  const { session, ready, usesSupabase } = useAuth();
  const [data, setData] = useState<AdminPageData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ready) return;
    if (usesSupabase && session == null) return;
    if (usesSupabase && session?.rol !== "autoridad") return;

    let cancelled = false;

    fetchPageData<AdminPageData>("/api/data/admin")
      .then((next) => {
        if (!cancelled) {
          setData(next);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message =
          err instanceof Error ? err.message : "No se pudo cargar el panel admin";
        setError(message);
      });

    return () => {
      cancelled = true;
    };
  }, [ready, session, usesSupabase]);

  useEffect(() => {
    return () => {
      if (data?.dataSource === "supabase") {
        markHomeDataStale();
      }
    };
  }, [data?.dataSource]);

  if (!ready) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-geo-surface px-4 text-sm text-geo-muted">
        Comprobando sesión…
      </div>
    );
  }

  if (usesSupabase && session == null) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 bg-geo-surface px-4 text-center">
        <p className="text-sm font-medium text-geo-navy">Inicia sesión como Autoridad</p>
        <Link
          href={`${authRoutes.login}?next=${encodeURIComponent("/admin")}`}
          className="rounded-lg bg-geo-pink px-4 py-2 text-sm font-medium text-white hover:bg-geo-pink/90"
        >
          Ir a iniciar sesión
        </Link>
      </div>
    );
  }

  if (usesSupabase && session != null && session.rol !== "autoridad") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 bg-geo-surface px-4 text-center">
        <p className="text-sm font-medium text-geo-navy">Acceso restringido</p>
        <p className="max-w-md text-sm text-geo-muted">
          El panel de administración solo está disponible para cuentas con rol{" "}
          <strong>Autoridad</strong>. Tu sesión actual es de tipo{" "}
          <span className="capitalize">{session.rol}</span>.
        </p>
        <Link
          href="/perfil"
          className="rounded-lg border border-geo-border px-4 py-2 text-sm font-medium text-geo-navy hover:bg-geo-card"
        >
          Ir a mi perfil
        </Link>
      </div>
    );
  }

  if (error != null) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 bg-geo-surface px-4 text-center">
        <p className="text-sm font-medium text-geo-navy">Error al cargar administración</p>
        <p className="max-w-md text-sm text-geo-muted">{error}</p>
      </div>
    );
  }

  if (data == null) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 bg-geo-surface px-4">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-geo-pink border-t-transparent" />
        <p className="text-sm text-geo-muted">Cargando panel de administración…</p>
      </div>
    );
  }

  return <AdminControllerInner data={data} />;
}
