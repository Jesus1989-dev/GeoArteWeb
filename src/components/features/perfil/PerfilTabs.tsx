"use client";

import { Clock, Save, SlidersHorizontal, type LucideIcon } from "lucide-react";
import type { perfilTabs } from "@/lib/data/mock/perfil";
import { cn } from "@/lib/utils";

const tabIcons: Record<(typeof perfilTabs)[number]["icon"], LucideIcon> = {
  save: Save,
  clock: Clock,
  settings: SlidersHorizontal,
};

export type PerfilTabId = (typeof perfilTabs)[number]["id"];

type PerfilTabsProps = {
  tabs: typeof perfilTabs;
  active: PerfilTabId;
  onChange: (id: PerfilTabId) => void;
};

export function PerfilTabs({ tabs, active, onChange }: PerfilTabsProps) {
  return (
    <div
      className="inline-flex w-full max-w-md rounded-lg border border-geo-border bg-geo-surface/80 p-1 sm:w-auto"
      role="tablist"
      aria-label="Secciones del perfil"
    >
      {tabs.map((tab) => {
        const Icon = tabIcons[tab.icon];
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={cn(
              "inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium transition sm:flex-initial sm:px-4",
              isActive
                ? "bg-background text-geo-navy shadow-sm ring-1 ring-geo-border"
                : "text-geo-muted hover:bg-geo-hover/60 hover:text-geo-navy",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
            <span className="max-sm:sr-only">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
