import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type QuickAccessCardProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
  highlighted?: boolean;
};

export function QuickAccessCard({
  icon: Icon,
  title,
  description,
  href,
  highlighted = false,
}: QuickAccessCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center gap-3 rounded-xl border bg-geo-card p-3.5 transition-all hover:-translate-y-0.5 hover:border-geo-pink hover:bg-geo-pink/5 hover:shadow-md sm:gap-4 sm:p-4",
        highlighted
          ? "border-geo-pink/30 bg-geo-pink/5"
          : "border-geo-border",
      )}
    >
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors sm:h-11 sm:w-11",
          highlighted
            ? "bg-geo-pink text-white"
            : "bg-geo-surface text-geo-navy group-hover:bg-geo-pink group-hover:text-white",
        )}
      >
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-semibold text-geo-navy transition-colors group-hover:text-geo-pink sm:text-base">
          {title}
        </h3>
        <p className="mt-0.5 text-xs leading-snug text-geo-muted transition-colors group-hover:text-geo-pink/80 sm:text-sm">
          {description}
        </p>
      </div>
      <ArrowRight
        className="h-4 w-4 shrink-0 text-geo-muted transition-all group-hover:translate-x-1 group-hover:text-geo-pink"
        strokeWidth={1.75}
      />
    </Link>
  );
}
