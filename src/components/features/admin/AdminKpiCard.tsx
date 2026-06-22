import {
  AlertCircle,
  Building2,
  Layers,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AdminKpi } from "@/lib/domain/admin";

const kpiIcons: Record<AdminKpi["icon"], LucideIcon> = {
  building: Building2,
  alert: AlertCircle,
  layers: Layers,
  users: Users,
};

type AdminKpiCardProps = {
  kpi: AdminKpi;
};

export function AdminKpiCard({ kpi }: AdminKpiCardProps) {
  const Icon = kpiIcons[kpi.icon];

  return (
    <div className="rounded-xl border border-geo-border bg-geo-card p-6 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-geo-navy">{kpi.label}</p>
        <Icon
          size={20}
          color="var(--geo-navy)"
          strokeWidth={2}
          className="shrink-0"
          aria-hidden
        />
      </div>
      <p className="mt-3 text-3xl font-bold tracking-tight text-geo-navy">
        {kpi.value}
      </p>
      <p className="mt-2 text-sm text-geo-muted">{kpi.descripcion}</p>
      {kpi.tendencia != null && (
        <p
          className={cn(
            "mt-2 flex items-center gap-1 text-xs font-medium",
            kpi.tendenciaPositiva ? "text-emerald-600" : "text-rose-600",
          )}
        >
          {kpi.tendenciaPositiva && (
            <TrendingUp className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
          )}
          {kpi.tendencia}
        </p>
      )}
    </div>
  );
}
