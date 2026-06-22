import type { Prioridad } from "@/lib/domain/home";
import { cn } from "@/lib/utils";

const prioridadStyles: Record<Prioridad, string> = {
  Crítico: "bg-geo-pink text-white",
  Atención: "bg-geo-surface text-geo-muted",
  Estable: "bg-geo-surface text-geo-muted",
};

type PriorityBadgeProps = {
  prioridad: Prioridad;
};

export function PriorityBadge({ prioridad }: PriorityBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
        prioridadStyles[prioridad],
      )}
    >
      {prioridad}
    </span>
  );
}
