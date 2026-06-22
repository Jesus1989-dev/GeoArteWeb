"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import type { FooterNavItem } from "@/lib/constants/navigation";
import { cn } from "@/lib/utils";

function isNavActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

type MobileNavSectionProps = {
  title: string;
  items: FooterNavItem[];
  pathname: string;
  defaultOpen?: boolean;
  onNavigate?: () => void;
  variant?: "drawer" | "footer";
};

export function MobileNavSection({
  title,
  items,
  pathname,
  defaultOpen = true,
  onNavigate,
  variant = "drawer",
}: MobileNavSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const isFooter = variant === "footer";

  return (
    <section>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-lg text-left transition",
          isFooter ? "py-2" : "px-1 py-2 hover:bg-geo-surface/60",
        )}
        aria-expanded={open}
      >
        <h3 className="text-sm font-semibold text-geo-navy">{title}</h3>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-geo-muted transition-transform duration-200",
            !open && "-rotate-90",
          )}
          aria-hidden
        />
      </button>

      <ul
        className={cn(
          "grid gap-1.5 overflow-hidden transition-all duration-200",
          isFooter ? "mt-2" : "mt-1 px-0.5",
          open ? "max-h-[40rem] opacity-100" : "max-h-0 opacity-0",
        )}
      >
        {items.map((item) => {
          const Icon = item.icon;
          const active = isNavActive(pathname, item.href);

          return (
            <li key={`${item.href}-${item.label}`}>
              <Link
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "group flex min-h-11 items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-medium transition active:scale-[0.98]",
                  active
                    ? "border-geo-pink/30 bg-geo-pink/10 text-geo-navy ring-1 ring-geo-pink/20"
                    : "border-geo-border/70 bg-geo-surface/40 text-gray-600 hover:border-geo-pink/25 hover:bg-geo-surface hover:text-geo-navy dark:text-geo-muted dark:hover:text-foreground",
                )}
              >
                <span
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition",
                    active
                      ? "bg-geo-pink/15 text-geo-pink"
                      : "bg-background text-geo-muted group-hover:text-geo-pink",
                  )}
                >
                  <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                </span>
                <span className="min-w-0 flex-1 leading-snug">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
