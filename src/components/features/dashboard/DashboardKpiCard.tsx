import {
  Layers,
  MapPin,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type KpiAccent = "navy" | "pink";
export type KpiIcon = "layers" | "users" | "trendingUp" | "mapPin";

const iconMap: Record<KpiIcon, LucideIcon> = {
  layers: Layers,
  users: Users,
  trendingUp: TrendingUp,
  mapPin: MapPin,
};

type DashboardKpiCardProps = {
  label: string;
  value: string;
  delta: string;
  deltaPositive: boolean;
  accent: KpiAccent;
  icon: KpiIcon;
};

export function DashboardKpiCard({
  label,
  value,
  delta,
  deltaPositive,
  accent,
  icon,
}: DashboardKpiCardProps) {
  const Icon = iconMap[icon];
  const isNavy = accent === "navy";

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-geo-border bg-geo-card shadow-sm",
        isNavy ? "border-t-4 border-t-geo-navy" : "border-t-4 border-t-geo-pink",
      )}
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
              isNavy ? "bg-geo-navy/10 text-geo-navy" : "bg-geo-pink/10 text-geo-pink",
            )}
          >
            <Icon className="h-5 w-5" strokeWidth={2} />
          </div>
          <span
            className={cn(
              "shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold",
              deltaPositive
                ? "bg-geo-surface text-geo-navy"
                : "bg-red-500 text-white",
            )}
          >
            {delta}
          </span>
        </div>
        <p className="mt-4 text-sm text-geo-muted">{label}</p>
        <p className="mt-1 text-2xl font-bold tracking-tight text-geo-navy sm:text-3xl">
          {value}
        </p>
      </div>
    </div>
  );
}
