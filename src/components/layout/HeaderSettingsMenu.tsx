"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { Settings, UserCircle } from "lucide-react";
import { ThemePicker } from "@/components/shared/ThemePicker";
import { cn } from "@/lib/utils";

type HeaderSettingsMenuProps = {
  showPerfilLink?: boolean;
};

export function HeaderSettingsMenu({ showPerfilLink = false }: HeaderSettingsMenuProps) {
  const menuId = useId();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative hidden sm:block">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-gray-600 transition hover:bg-geo-surface hover:text-geo-navy dark:text-geo-muted dark:hover:text-foreground"
        aria-label="Configuración y apariencia"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
      >
        <Settings size={20} strokeWidth={1.75} aria-hidden />
      </button>

      {open && (
        <div
          id={menuId}
          role="menu"
          className="absolute right-0 top-full z-[1100] mt-2 w-56 max-w-[min(100vw-1rem,14rem)] overflow-hidden rounded-lg border border-geo-border bg-background py-1 shadow-lg"
        >
          <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-geo-muted">
            Apariencia
          </p>

          <div className="px-2 pb-2">
            <ThemePicker
              layout="vertical"
              onSelect={() => setOpen(false)}
            />
          </div>

          {showPerfilLink && (
            <>
              <div className="border-t border-geo-border" aria-hidden />
              <Link
                href="/perfil"
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex min-h-11 w-full items-center gap-2 px-3 text-sm text-geo-navy transition hover:bg-geo-surface dark:text-foreground"
              >
                <UserCircle className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
                Cuenta y perfil
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
