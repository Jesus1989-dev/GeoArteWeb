import type { EstadoEspacio } from "@/lib/domain/admin";
import { cn } from "@/lib/utils";

const dotStyles: Record<EstadoEspacio, string> = {
  Publicado: "bg-emerald-500",
  Revisión: "bg-amber-400",
  Borrador: "bg-slate-400",
};

export function AdminEspacioEstado({ estado }: { estado: EstadoEspacio }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm text-geo-navy">
      <span
        className={cn("h-2 w-2 shrink-0 rounded-full", dotStyles[estado])}
        aria-hidden
      />
      {estado}
    </span>
  );
}
