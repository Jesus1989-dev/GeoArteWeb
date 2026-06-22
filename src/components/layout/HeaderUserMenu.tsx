"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { LogOut, User, UserCircle } from "lucide-react";
import type { AuthSession } from "@/lib/data/mock/auth";
import { getIniciales } from "@/lib/auth/display";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { cn } from "@/lib/utils";

type HeaderUserMenuProps = {
  session: AuthSession;
  onLogout: () => void | Promise<void>;
};

export function HeaderUserMenu({ session, onLogout }: HeaderUserMenuProps) {
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
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="relative inline-flex min-h-11 min-w-11 items-center justify-center rounded-full outline-none transition focus-visible:ring-2 focus-visible:ring-geo-pink focus-visible:ring-offset-2"
        aria-label="Menú de cuenta"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
      >
        <UserAvatar
          nombre={session.nombre}
          iniciales={getIniciales(session.nombre)}
          avatarUrl={session.avatarUrl}
          className="h-9 w-9 bg-gradient-to-br from-geo-navy to-geo-navy-dark ring-1 ring-gray-200"
          textClassName="text-xs"
        />
        <span
          className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500"
          aria-hidden
        />
      </button>

      {open && (
        <div
          id={menuId}
          role="menu"
          className="absolute right-0 top-full z-[1100] mt-2 min-w-[11.5rem] max-w-[min(100vw-1rem,18rem)] overflow-hidden rounded-lg border border-geo-border bg-background py-1 shadow-lg"
        >
          <div className="border-b border-geo-border px-3 py-2.5">
            <p className="truncate text-sm font-medium text-geo-navy">{session.nombre}</p>
            <p className="truncate text-xs text-geo-muted">{session.email}</p>
          </div>

          <Link
            href="/perfil"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-geo-navy transition hover:bg-geo-surface"
          >
            <UserCircle className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
            Cambiar perfil
          </Link>

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              void onLogout();
            }}
            className={cn(
              "flex w-full items-center gap-2 border-t border-geo-border px-3 py-2.5 text-left text-sm text-red-700 transition hover:bg-red-50",
            )}
          >
            <LogOut className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}
