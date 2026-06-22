"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type MapPanelShellProps = {
  children: ReactNode;
  className?: string;
};

/** Contenedor responsive: bottom sheet en móvil, panel flotante en desktop. */
export function MapPanelShell({ children, className }: MapPanelShellProps) {
  return (
    <div
      className={cn(
        "z-[450] border border-geo-border bg-geo-card shadow-lg",
        "fixed inset-x-0 bottom-0 max-h-[min(55vh,28rem)] overflow-y-auto overscroll-contain rounded-t-2xl p-4",
        "pb-[max(1rem,env(safe-area-inset-bottom))]",
        "lg:absolute lg:inset-auto lg:bottom-4 lg:left-auto lg:right-4 lg:max-h-[calc(100%-2rem)] lg:max-w-md lg:rounded-xl lg:pb-4",
        className,
      )}
    >
      <div
        className="mx-auto mb-3 h-1 w-10 shrink-0 rounded-full bg-geo-border lg:hidden"
        aria-hidden
      />
      {children}
    </div>
  );
}
