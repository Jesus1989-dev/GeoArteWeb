"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthProvider";
import { buildPerfilUsuarioFromSession } from "@/lib/auth/display";
import type { AuthSession } from "@/lib/data/mock/auth";
import { authRoutes } from "@/lib/data/mock/auth";
import {
  getPerfilPageData,
  removeSavedEspacio,
  updatePerfilName,
  uploadPerfilAvatar,
  type PerfilPageData,
} from "@/lib/services/perfil.service";
import { PerfilView } from "./PerfilView";

function PerfilControllerInner({ session }: { session: AuthSession }) {
  const { refreshSession } = useAuth();
  const [data, setData] = useState<PerfilPageData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [eliminandoId, setEliminandoId] = useState<string | null>(null);

  const reload = useCallback(async () => {
    const next = await getPerfilPageData({
      userId: session.userId,
      autor: session.nombre,
    });
    setData(next);
    setError(null);
    return next;
  }, [session.userId, session.nombre]);

  useEffect(() => {
    let cancelled = false;

    getPerfilPageData({ userId: session.userId, autor: session.nombre })
      .then((next) => {
        if (!cancelled) {
          setData(next);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message =
          err instanceof Error ? err.message : "No se pudo cargar el perfil";
        setError(message);
      });

    return () => {
      cancelled = true;
    };
  }, [session.userId, session.nombre]);

  async function handleEliminarEspacio(espacioId: string) {
    if (!session.userId || !data?.canEliminar) return;

    setEliminandoId(espacioId);
    try {
      await removeSavedEspacio({ userId: session.userId, espacioId });
      await reload();
    } catch (err) {
      console.error("[perfil] eliminar espacio:", err);
    } finally {
      setEliminandoId(null);
    }
  }

  async function handleSaveName(input: {
    firstName: string;
    lastName: string;
  }): Promise<string | null> {
    if (!session.userId || !data?.canEditConfig) {
      return "No disponible en modo demo.";
    }

    try {
      await updatePerfilName({
        userId: session.userId,
        firstName: input.firstName,
        lastName: input.lastName,
      });
      await refreshSession();
      await reload();
      return null;
    } catch (err) {
      return err instanceof Error ? err.message : "No se pudo actualizar el nombre.";
    }
  }

  async function handleUploadAvatar(file: File): Promise<string | null> {
    if (!session.userId || !data?.canEditConfig) {
      return "No disponible en modo demo.";
    }

    try {
      await uploadPerfilAvatar({ userId: session.userId, file });
      await refreshSession();
      await reload();
      return null;
    } catch (err) {
      return err instanceof Error ? err.message : "No se pudo subir la foto.";
    }
  }

  if (error != null) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="text-sm font-medium text-geo-navy">Error al cargar perfil</p>
        <p className="max-w-md text-sm text-geo-muted">{error}</p>
      </div>
    );
  }

  if (data == null) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-geo-muted">
        Cargando perfil…
      </div>
    );
  }

  const usuario = {
    ...buildPerfilUsuarioFromSession(session),
    stats: data.perfilStats,
    email: session.email,
    firstName: session.firstName,
    lastName: session.lastName,
  };

  return (
    <PerfilView
      data={data}
      usuario={usuario}
      rolInicial={session.rol}
      onEliminarEspacio={data.canEliminar ? handleEliminarEspacio : undefined}
      eliminandoId={eliminandoId}
      onReloadHistorial={reload}
      onSaveName={data.canEditConfig ? handleSaveName : undefined}
      canUploadAvatar={data.canEditConfig}
      onUploadAvatar={data.canEditConfig ? handleUploadAvatar : undefined}
    />
  );
}

/** Controlador — perfil de usuario. */
export function PerfilController() {
  const { session, ready } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    if (session == null) {
      router.replace(authRoutes.login);
      return;
    }
    if (session.emailVerified === false) {
      router.replace(
        `${authRoutes.verificar}?email=${encodeURIComponent(session.email)}`,
      );
    }
  }, [ready, session, router]);

  if (!ready) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-geo-muted">
        Comprobando sesión…
      </div>
    );
  }

  if (session == null) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="text-sm font-medium text-geo-navy">Inicia sesión para ver tu perfil</p>
        <p className="max-w-md text-sm text-geo-muted">
          No hay una sesión activa en este navegador. Entra con tu cuenta de Supabase.
        </p>
        <Link
          href={`${authRoutes.login}?next=${encodeURIComponent("/perfil")}`}
          className="rounded-lg bg-geo-pink px-4 py-2 text-sm font-medium text-white hover:bg-geo-pink/90"
        >
          Ir a iniciar sesión
        </Link>
      </div>
    );
  }

  if (session.emailVerified === false) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="text-sm font-medium text-geo-navy">Confirma tu correo</p>
        <p className="max-w-md text-sm text-geo-muted">
          Revisa tu bandeja y abre el enlace de verificación antes de usar el perfil.
        </p>
        <Link
          href={`${authRoutes.verificar}?email=${encodeURIComponent(session.email)}`}
          className="rounded-lg border border-geo-border px-4 py-2 text-sm font-medium text-geo-navy hover:bg-geo-surface"
        >
          Ir a verificación
        </Link>
      </div>
    );
  }

  return <PerfilControllerInner session={session} />;
}
