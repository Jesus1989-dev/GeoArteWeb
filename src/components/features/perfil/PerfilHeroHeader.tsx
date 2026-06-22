"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  Camera,
  Microscope,
  ShieldCheck,
  User,
  type LucideIcon,
} from "lucide-react";
import { UserAvatar } from "@/components/shared/UserAvatar";
import type { perfilRoles, RolPerfil } from "@/lib/data/mock/perfil";
import type { PerfilUsuarioDisplay } from "@/components/features/perfil/PerfilView";
import { cn } from "@/lib/utils";

const roleIcons: Record<
  (typeof perfilRoles)[number]["icon"],
  LucideIcon
> = {
  user: User,
  microscope: Microscope,
  shield: ShieldCheck,
};

const roleIconById: Record<RolPerfil, (typeof perfilRoles)[number]["icon"]> = {
  ciudadano: "user",
  investigador: "microscope",
  autoridad: "shield",
};

type PerfilHeroHeaderProps = {
  usuario: PerfilUsuarioDisplay;
  rolActivo: RolPerfil;
  rolLabel: string;
  canUploadAvatar?: boolean;
  onUploadAvatar?: (file: File) => Promise<string | null>;
};

export function PerfilHeroHeader({
  usuario,
  rolActivo,
  rolLabel,
  canUploadAvatar = false,
  onUploadAvatar,
}: PerfilHeroHeaderProps) {
  const inputId = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    usuario.avatarUrl ?? null,
  );
  const [subiendo, setSubiendo] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  useEffect(() => {
    setAvatarUrl(usuario.avatarUrl ?? null);
  }, [usuario.avatarUrl]);

  const RoleIcon = roleIcons[roleIconById[rolActivo]];
  const puedeSubir = canUploadAvatar && onUploadAvatar != null;

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !onUploadAvatar) return;

    setSubiendo(true);
    setAvatarError(null);
    const errorMsg = await onUploadAvatar(file);
    if (errorMsg != null) {
      setAvatarError(errorMsg);
    }
    setSubiendo(false);
  }

  return (
    <section className="border-b border-geo-border bg-slate-100/80 dark:bg-geo-card/50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <div className="relative mx-auto shrink-0 sm:mx-0">
              <div className="group relative">
                <UserAvatar
                  nombre={usuario.nombre}
                  iniciales={usuario.avatarIniciales}
                  avatarUrl={avatarUrl ?? usuario.avatarUrl}
                  className="h-24 w-24 ring-4 ring-white shadow-md dark:ring-geo-border"
                  textClassName="text-2xl"
                />
                {puedeSubir && (
                  <>
                    <input
                      ref={fileRef}
                      id={inputId}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="sr-only"
                      disabled={subiendo}
                      onChange={handleFileChange}
                    />
                    <button
                      type="button"
                      disabled={subiendo}
                      onClick={() => fileRef.current?.click()}
                      className={cn(
                        "absolute inset-0 flex items-center justify-center rounded-full bg-black/0 text-white transition hover:bg-black/35 focus-visible:bg-black/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-geo-pink focus-visible:ring-offset-2",
                        subiendo && "cursor-wait bg-black/25",
                      )}
                      aria-label={
                        subiendo ? "Subiendo foto de perfil" : "Cambiar foto de perfil"
                      }
                    >
                      <Camera
                        className={cn(
                          "h-7 w-7 transition",
                          subiendo
                            ? "animate-pulse opacity-100"
                            : "opacity-0 group-hover:opacity-90",
                        )}
                        strokeWidth={1.75}
                        aria-hidden
                      />
                    </button>
                  </>
                )}
              </div>
              <span
                className="absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-white bg-emerald-500"
                aria-label="En línea"
              />
            </div>

            <div className="min-w-0 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <h1 className="text-xl font-bold text-geo-navy sm:text-2xl">
                  {usuario.nombre}
                </h1>
                <span className="rounded-full bg-geo-pink px-2.5 py-0.5 text-xs font-semibold text-white">
                  {rolLabel}
                </span>
              </div>
              <p className="mt-1.5 text-sm text-geo-muted">{usuario.subtitulo}</p>
              {puedeSubir && (
                <p className="mt-1 text-xs text-geo-muted">
                  {subiendo
                    ? "Subiendo foto…"
                    : "Toca tu foto para cambiarla (JPG, PNG o WebP, máx. 5 MB)."}
                </p>
              )}
              {avatarError && (
                <p className="mt-1 text-xs text-red-600" role="alert">
                  {avatarError}
                </p>
              )}

              <p className="mt-4 inline-flex items-center gap-2 text-sm text-geo-muted">
                <RoleIcon className="h-4 w-4 shrink-0 text-foreground" strokeWidth={1.75} aria-hidden />
                <span>
                  <span className="sr-only">{usuario.perfilActivoLabel}: </span>
                  Sesión como <span className="font-medium text-geo-navy">{rolLabel}</span>
                </span>
              </p>
            </div>
          </div>

          <div className="mx-auto w-full shrink-0 rounded-xl border border-geo-border bg-geo-card px-6 py-5 shadow-sm sm:max-w-[200px] lg:mx-0">
            {usuario.stats.map((stat, index) => (
              <div key={stat.label}>
                {index > 0 && (
                  <div className="my-4 border-t border-geo-border" aria-hidden />
                )}
                <div className="text-center">
                  <p
                    className={cn(
                      "text-2xl font-bold tracking-tight sm:text-3xl",
                      stat.accent === "pink" ? "text-geo-pink" : "text-geo-navy",
                    )}
                  >
                    {stat.value}
                  </p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-wide text-geo-muted">
                    {stat.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
