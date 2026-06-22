import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type MobileDataCardProps = {
  title: ReactNode;
  subtitle?: ReactNode;
  badge?: ReactNode;
  children?: ReactNode;
  actions?: ReactNode;
  className?: string;
};

export function MobileDataCard({
  title,
  subtitle,
  badge,
  children,
  actions,
  className,
}: MobileDataCardProps) {
  return (
    <article className={cn("space-y-3 p-4", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="break-words font-semibold leading-snug text-geo-navy line-clamp-2">
            {title}
          </h3>
          {subtitle != null && (
            <p className="mt-0.5 text-sm text-geo-muted">{subtitle}</p>
          )}
        </div>
        {badge}
      </div>
      {children != null && <div className="space-y-2">{children}</div>}
      {actions != null && (
        <div className="flex flex-wrap gap-2 border-t border-geo-border pt-3">
          {actions}
        </div>
      )}
    </article>
  );
}

type MobileDataRowProps = {
  label: string;
  value: ReactNode;
};

export function MobileDataRow({ label, value }: MobileDataRowProps) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <span className="shrink-0 text-geo-muted">{label}</span>
      <span className="min-w-0 break-words text-right font-medium text-foreground">
        {value}
      </span>
    </div>
  );
}
