"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MobileNavSection } from "@/components/layout/MobileNavSection";
import {
  footerExplore,
  footerResources,
  type FooterNavItem,
} from "@/lib/constants/navigation";
import { cn } from "@/lib/utils";

function isNavActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

function FooterLinkColumn({
  title,
  items,
  pathname,
}: {
  title: string;
  items: FooterNavItem[];
  pathname: string;
}) {
  return (
    <div className="hidden md:block">
      <h3 className="text-sm font-semibold text-geo-navy">{title}</h3>
      <ul className="mt-4 space-y-2">
        {items.map((item) => {
          const active = isNavActive(pathname, item.href);

          return (
            <li key={`${item.href}-${item.label}`}>
              <Link
                href={item.href}
                className={cn(
                  "text-sm transition-colors",
                  active
                    ? "font-medium text-geo-pink"
                    : "text-geo-muted hover:text-geo-pink",
                )}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function FooterNavColumns() {
  const pathname = usePathname();

  return (
    <>
      <div className="space-y-1 md:hidden">
        <MobileNavSection
          title="Explorar"
          items={footerExplore}
          pathname={pathname}
          defaultOpen
          variant="footer"
        />
        <MobileNavSection
          title="Recursos"
          items={footerResources}
          pathname={pathname}
          defaultOpen={false}
          variant="footer"
        />
      </div>

      <FooterLinkColumn
        title="Explorar"
        items={footerExplore}
        pathname={pathname}
      />
      <FooterLinkColumn
        title="Recursos"
        items={footerResources}
        pathname={pathname}
      />
    </>
  );
}
