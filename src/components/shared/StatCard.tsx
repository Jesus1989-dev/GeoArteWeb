import type { LucideIcon } from "lucide-react";

type StatCardProps = {
  icon: LucideIcon;
  value: string;
  label: string;
  description: string;
};

export function StatCard({
  icon: Icon,
  value,
  label,
  description,
}: StatCardProps) {
  return (
    <div className="rounded-2xl border border-geo-border bg-geo-card p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5">
      <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-geo-surface text-geo-navy sm:h-9 sm:w-9">
        <Icon className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={1.75} />
      </div>
      <p className="mt-3 text-xl font-bold tracking-tight text-geo-navy sm:mt-4 sm:text-2xl md:text-3xl">
        {value}
      </p>
      <p className="mt-1 text-xs font-semibold text-geo-navy sm:text-sm">{label}</p>
      <p className="mt-1 text-xs leading-relaxed text-geo-muted">
        {description}
      </p>
    </div>
  );
}
