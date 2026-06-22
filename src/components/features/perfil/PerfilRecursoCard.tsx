import Link from "next/link";
import { ExternalLink, MapPin, Trash2 } from "lucide-react";
import type { PerfilEspacioGuardado } from "@/lib/domain/perfil";
import { cn } from "@/lib/utils";

type PerfilRecursoCardProps = {
  espacio: PerfilEspacioGuardado;
  abrirLabel: string;
  onEliminar?: (id: string) => void;
  eliminando?: boolean;
};

export function PerfilRecursoCard({
  espacio,
  abrirLabel,
  onEliminar,
  eliminando = false,
}: PerfilRecursoCardProps) {
  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-geo-navy">
            <MapPin className="h-5 w-5" strokeWidth={1.75} aria-hidden />
          </div>
          <span className="rounded-full border border-gray-200 bg-white px-2.5 py-0.5 text-[11px] font-medium text-geo-navy">
            {espacio.tipo}
          </span>
        </div>
        <h3 className="mt-4 text-base font-semibold leading-snug text-geo-navy">
          {espacio.nombre}
        </h3>
        <p className="mt-1 text-xs text-geo-muted">{espacio.alcaldia}</p>
        <p className="mt-2 text-xs text-geo-muted">
          Guardado el {espacio.guardadoEl}
        </p>
      </div>

      <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3">
        <Link
          href={espacio.href}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-geo-navy transition hover:text-geo-pink"
        >
          {abrirLabel}
          <ExternalLink className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
        </Link>
        <button
          type="button"
          disabled={!onEliminar || eliminando}
          onClick={() => onEliminar?.(espacio.id)}
          className={cn(
            "rounded-lg p-2 text-geo-pink/60 transition hover:bg-geo-pink/5 hover:text-geo-pink",
            (!onEliminar || eliminando) && "cursor-not-allowed opacity-40",
          )}
          aria-label={`Quitar ${espacio.nombre} de guardados`}
        >
          <Trash2 className="h-4 w-4" strokeWidth={1.75} />
        </button>
      </div>
    </article>
  );
}
