"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { Activity, LogOut, Search, User, X } from "lucide-react";
import { ThemePicker } from "@/components/shared/ThemePicker";
import type { NavItem } from "@/lib/constants/navigation";
import { siteConfig } from "@/lib/constants/site";
import { cn } from "@/lib/utils";

function isNavActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

type HeaderMobileDrawerProps = {
  open: boolean;
  onClose: () => void;
  navItems: NavItem[];
  pathname: string;
  session: { nombre: string; email: string } | null;
  ready: boolean;
  onLogout: () => void | Promise<void>;
  onOpenSearch: () => void;
};

export function HeaderMobileDrawer({
  open,
  onClose,
  navItems,
  pathname,
  session,
  ready,
  onLogout,
  onOpenSearch,
}: HeaderMobileDrawerProps) {
  const titleId = useId();
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      const frame = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(frame);
    }

    setVisible(false);
    const timeout = window.setTimeout(() => setMounted(false), 280);
    return () => window.clearTimeout(timeout);
  }, [open]);

  useEffect(() => {
    if (!mounted) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [mounted, onClose]);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-[1200] lg:hidden" role="presentation">
      <button
        type="button"
        className={cn(
          "absolute inset-0 bg-black/45 backdrop-blur-[2px] transition-opacity duration-300",
          visible ? "opacity-100" : "opacity-0",
        )}
        aria-label="Cerrar menú"
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "absolute inset-y-0 left-0 flex w-[min(22rem,92vw)] flex-col border-r border-geo-border bg-background shadow-2xl transition-transform duration-300 ease-out",
          visible ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-geo-border px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
          <h2 id={titleId} className="sr-only">
            Menú de navegación
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="ml-auto inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-geo-muted transition hover:bg-geo-surface hover:text-geo-navy"
            aria-label="Cerrar menú"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4">
          <div className="mb-5 rounded-2xl border border-geo-border/80 bg-geo-surface/50 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-geo-navy text-white">
                <Activity className="h-5 w-5" strokeWidth={2} aria-hidden />
              </div>
              <div className="min-w-0">
                <p className="font-bold tracking-tight text-geo-navy">{siteConfig.name}</p>
                <p className="mt-1 text-xs leading-relaxed text-geo-muted">
                  {siteConfig.description}
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenSearch();
            }}
            className="mb-5 flex min-h-11 w-full items-center gap-3 rounded-xl border border-geo-border bg-geo-surface/60 px-4 text-sm font-medium text-geo-navy transition hover:border-geo-pink/30 hover:bg-geo-surface active:scale-[0.99]"
          >
            <Search className="h-5 w-5 text-geo-pink" aria-hidden />
            Buscar alcaldía o espacio
          </button>

          <nav aria-label="Navegación principal">
            <p className="mb-2 px-1 text-[10px] font-bold uppercase tracking-wider text-geo-muted">
              Navegación
            </p>
            <ul className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isNavActive(pathname, item.href);

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onClose}
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
                        {Icon != null && (
                          <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                        )}
                      </span>
                      <span className="min-w-0 flex-1 leading-snug">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="mt-6 border-t border-geo-border pt-4">
            <p className="mb-2 px-1 text-[10px] font-bold uppercase tracking-wider text-geo-muted">
              Apariencia
            </p>
            <ThemePicker layout="vertical" onSelect={onClose} />
          </div>

          {ready && session == null && (
            <Link
              href="/login"
              onClick={onClose}
              className="mt-6 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-geo-navy px-4 text-sm font-medium text-white transition hover:bg-geo-navy/90 active:scale-[0.99]"
            >
              <User className="h-4 w-4" aria-hidden />
              Iniciar sesión
            </Link>
          )}

          {session != null && (
            <div className="mt-6 space-y-2 border-t border-geo-border pt-4">
              <div className="px-1">
                <p className="truncate text-sm font-medium text-geo-navy">{session.nombre}</p>
                <p className="truncate text-xs text-geo-muted">{session.email}</p>
              </div>
              <Link
                href="/perfil"
                onClick={onClose}
                className="flex min-h-11 w-full items-center justify-center rounded-xl border border-geo-border px-4 text-sm font-medium text-geo-navy transition hover:bg-geo-surface active:scale-[0.99]"
              >
                Mi perfil
              </Link>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  void onLogout();
                }}
                className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium text-red-700 transition hover:bg-red-50 active:scale-[0.99]"
              >
                <LogOut className="h-4 w-4" aria-hidden />
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
