import { cn } from "@/lib/utils";
import type { AdminPageData } from "@/lib/services/admin.service";

type AdminValidacionesSectionProps = {
  pendientes: AdminPageData["adminValidacionPendientes"];
  activo: boolean;
  onSelect: () => void;
};

export function AdminValidacionesSection({
  pendientes,
  activo,
  onSelect,
}: AdminValidacionesSectionProps) {
  return (
    <div className="border-b border-geo-border p-4">
      <p className="text-[10px] font-bold uppercase tracking-wider text-geo-muted">
        Validaciones
      </p>
      <button
        type="button"
        onClick={onSelect}
        className={cn(
          "mt-2 flex w-full items-center justify-between gap-3 rounded-xl border p-4 text-left transition",
          activo
            ? "border-geo-pink bg-geo-pink/5 ring-1 ring-geo-pink/30"
            : "border-pink-100 bg-geo-card hover:border-geo-pink/40 hover:bg-geo-pink/[0.02]",
        )}
      >
        <div className="min-w-0">
          <p className="font-bold text-geo-pink">{pendientes.titulo}</p>
          <p className="mt-0.5 text-sm text-geo-muted">{pendientes.subtitulo}</p>
        </div>
        <span
          className="flex h-7 min-w-[2rem] shrink-0 items-center justify-center rounded-full bg-geo-pink px-3 text-sm font-bold text-white"
          aria-label={`${pendientes.badge} pendientes`}
        >
          {pendientes.badge}
        </span>
      </button>
    </div>
  );
}
