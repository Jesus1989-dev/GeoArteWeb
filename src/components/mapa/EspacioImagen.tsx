"use client";

import { useState } from "react";
import { ImageIcon } from "lucide-react";
import type { EspacioTipoColor } from "@/lib/domain/mapa";
import { cn } from "@/lib/utils";

type EspacioImagenProps = {
  nombre: string;
  imagenUrl?: string;
  tipoColor: EspacioTipoColor;
  className?: string;
  aspectClassName?: string;
};

export function EspacioImagen({
  nombre,
  imagenUrl,
  tipoColor,
  className,
  aspectClassName = "aspect-[16/9]",
}: EspacioImagenProps) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(imagenUrl) && !failed;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border border-geo-border bg-geo-surface",
        aspectClassName,
        className,
      )}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element -- URLs externas (Supabase Storage / SIC).
        <img
          src={imagenUrl}
          alt={`Fotografía de ${nombre}`}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <div
          className="flex h-full w-full flex-col items-center justify-center gap-2 px-4 text-center"
          style={{
            background: `linear-gradient(135deg, ${tipoColor.fill}22 0%, ${tipoColor.stroke}18 100%)`,
          }}
        >
          <ImageIcon className="h-8 w-8 opacity-60" style={{ color: tipoColor.stroke }} aria-hidden />
          <span className="text-[11px] font-medium text-geo-muted">Sin fotografía disponible</span>
        </div>
      )}
    </div>
  );
}
