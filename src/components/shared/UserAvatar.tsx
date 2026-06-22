"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type UserAvatarProps = {
  nombre: string;
  iniciales: string;
  avatarUrl?: string | null;
  className?: string;
  textClassName?: string;
};

export function UserAvatar({
  nombre,
  iniciales,
  avatarUrl,
  className,
  textClassName,
}: UserAvatarProps) {
  const [failed, setFailed] = useState(false);
  const src = avatarUrl?.trim();
  const showImage = Boolean(src) && !failed;

  // La URL puede llegar después del primer render (sesión async); reintentar carga.
  useEffect(() => {
    setFailed(false);
  }, [src]);

  return (
    <span
      className={cn(
        "flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-slate-300 to-slate-400 font-bold text-white",
        className,
      )}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element -- Supabase Storage (URL dinámica).
        <img
          key={src}
          src={src}
          alt={`Foto de perfil de ${nombre}`}
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className={textClassName}>{iniciales}</span>
      )}
    </span>
  );
}
