"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Activity, LogOut, Menu, Search, User } from "lucide-react";
import { HeaderMobileDrawer } from "@/components/layout/HeaderMobileDrawer";
import { HeaderSearch } from "@/components/layout/HeaderSearch";
import { HeaderSearchModal } from "@/components/layout/HeaderSearchModal";
import { HeaderSettingsMenu } from "@/components/layout/HeaderSettingsMenu";
import { HeaderUserMenu } from "@/components/layout/HeaderUserMenu";
import { useAuth } from "@/contexts/AuthProvider";
import { getMainNavForRole, type NavItem } from "@/lib/constants/navigation";
import { siteConfig } from "@/lib/constants/site";
import { cn } from "@/lib/utils";

function isNavActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

function HeaderNavLink({
  item,
  pathname,
  compact = false,
  className,
}: {
  item: NavItem;
  pathname: string;
  compact?: boolean;
  className?: string;
}) {
  const Icon = item.icon;
  const active = isNavActive(pathname, item.href);
  const text = compact && item.shortLabel != null ? item.shortLabel : item.label;

  return (
    <Link
      href={item.href}
      className={cn(
        "inline-flex shrink-0 items-center gap-1 whitespace-nowrap font-medium transition-colors",
        active ? "text-geo-navy" : "text-gray-600 hover:text-geo-navy dark:text-geo-muted dark:hover:text-foreground",
        className,
      )}
    >
      {Icon != null && (
        <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} aria-hidden />
      )}
      {item.shortLabel != null ? (
        <>
          <span className="2xl:hidden">{item.shortLabel}</span>
          <span className="hidden 2xl:inline">{item.label}</span>
        </>
      ) : (
        <span>{text}</span>
      )}
    </Link>
  );
}

export function Header() {
  const pathname = usePathname();
  const { session, ready, logout } = useAuth();
  const perfilHref = session != null ? "/perfil" : "/login";
  const navItems = getMainNavForRole(session?.rol);
  const narrowSearch = session?.rol === "autoridad";

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-[1100] border-b border-geo-border bg-background pt-[env(safe-area-inset-top,0px)]">
        <div className="relative mx-auto flex h-14 w-full max-w-[100rem] items-center gap-1 pl-2 pr-2 sm:gap-1.5 sm:pl-3 sm:pr-3 lg:pl-3 lg:pr-4">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-lg text-geo-navy transition hover:bg-geo-surface lg:hidden"
            aria-label="Abrir menú de navegación"
            aria-expanded={drawerOpen}
          >
            <Menu className="h-5 w-5" strokeWidth={1.75} />
          </button>

          <Link
            href="/"
            className="flex shrink-0 items-center gap-1.5 lg:gap-2"
            aria-label={`${siteConfig.name} — inicio`}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-geo-navy text-white lg:h-9 lg:w-9">
              <Activity className="h-4 w-4 lg:h-5 lg:w-5" strokeWidth={2} aria-hidden />
            </div>
            <span className="hidden max-w-[7rem] truncate font-bold tracking-tight text-geo-navy sm:inline lg:hidden 2xl:inline 2xl:max-w-none 2xl:text-sm">
              {siteConfig.name}
            </span>
          </Link>

          <nav
            className="hidden min-w-0 flex-1 items-center gap-0.5 lg:flex lg:gap-1 xl:gap-1.5"
            aria-label="Navegación principal"
          >
            {navItems.map((item) => (
              <HeaderNavLink
                key={item.href}
                item={item}
                pathname={pathname}
                className="min-h-10 px-1.5 py-1.5 text-[13px] xl:min-h-11 xl:px-2 xl:text-sm"
              />
            ))}
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-0.5 sm:gap-1">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-geo-navy transition hover:bg-geo-surface xl:hidden"
              aria-label="Buscar"
            >
              <Search className="h-5 w-5" strokeWidth={1.75} />
            </button>

            <HeaderSearch narrow={narrowSearch} />

            <div className="hidden h-6 w-px bg-geo-border xl:block" aria-hidden />

            <HeaderSettingsMenu showPerfilLink={session != null} />

            {ready && session == null && (
              <Link
                href="/login"
                className="hidden min-h-11 items-center rounded-lg px-3 text-sm font-medium text-geo-navy transition hover:bg-geo-surface md:inline-flex dark:text-foreground"
              >
                Iniciar sesión
              </Link>
            )}

            {session != null && (
              <>
                <button
                  type="button"
                  onClick={logout}
                  className="hidden min-h-11 min-w-11 items-center justify-center rounded-lg text-gray-500 transition hover:bg-geo-surface hover:text-geo-pink sm:inline-flex dark:text-geo-muted"
                  aria-label="Cerrar sesión"
                >
                  <LogOut size={20} color="currentColor" strokeWidth={1.75} />
                </button>

                <HeaderUserMenu session={session} onLogout={logout} />
              </>
            )}

            {session == null && (
              <Link
                href={perfilHref}
                className="relative shrink-0 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-geo-pink focus-visible:ring-offset-2"
                aria-label="Iniciar sesión"
              >
                <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-gray-100 ring-1 ring-gray-200">
                  <User size={20} color="#64748b" strokeWidth={1.75} />
                </span>
              </Link>
            )}
          </div>
        </div>
      </header>

      <HeaderMobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        navItems={navItems}
        pathname={pathname}
        session={session}
        ready={ready}
        onLogout={logout}
        onOpenSearch={() => setSearchOpen(true)}
      />

      <HeaderSearchModal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        narrow={narrowSearch}
      />
    </>
  );
}
