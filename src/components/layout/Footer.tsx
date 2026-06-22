import Link from "next/link";
import { Activity, Mail } from "lucide-react";
import { FooterNavColumns } from "@/components/layout/FooterNavColumns";
import { siteConfig } from "@/lib/constants/site";
import { Button } from "@/components/shared/Button";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-geo-border bg-geo-surface">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2 md:gap-10 lg:grid-cols-4 lg:gap-12">
          <div className="md:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-geo-navy text-white">
                <Activity className="h-5 w-5" />
              </div>
              <span className="font-bold text-geo-navy">{siteConfig.name}</span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-geo-muted">
              {siteConfig.description}
            </p>
          </div>

          <FooterNavColumns />

          <div className="md:col-span-2 lg:col-span-1">
            <h3 className="text-sm font-semibold text-geo-navy">Contacto</h3>
            <div className="mt-4 flex gap-2.5">
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-geo-navy/15 bg-geo-card text-geo-navy shadow-sm transition hover:border-geo-pink hover:text-geo-pink"
                aria-label="Twitter"
              >
                <span className="text-xs font-bold">X</span>
              </a>
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-geo-navy/15 bg-geo-card text-geo-navy shadow-sm transition hover:border-geo-pink hover:text-geo-pink"
                aria-label="GitHub"
              >
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden
                  className="h-4 w-4 fill-current"
                >
                  <path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2.3c-3.3.7-4-1.4-4-1.4-.6-1.5-1.3-1.9-1.3-1.9-1.1-.8.1-.8.1-.8 1.2.1 1.9 1.3 1.9 1.3 1.1 1.9 2.9 1.3 3.6 1 .1-.8.4-1.3.7-1.6-2.7-.3-5.5-1.4-5.5-6.1 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.6.1-3.2 0 0 1-.3 3.2 1.2a11 11 0 0 1 5.9 0c2.2-1.5 3.2-1.2 3.2-1.2.6 1.6.2 2.9.1 3.2.8.8 1.2 1.8 1.2 3.1 0 4.8-2.8 5.8-5.5 6.1.5.4.8 1.2.8 2.4v3.5c0 .3.2.7.8.6A12 12 0 0 0 12 .3" />
                </svg>
              </a>
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-geo-navy/15 bg-geo-card text-geo-navy shadow-sm transition hover:border-geo-pink hover:text-geo-pink"
                aria-label="Email"
              >
                <Mail className="h-4 w-4" />
              </a>
            </div>
            <div className="mt-4">
              <Button
                href="/contacto"
                variant="secondary"
                size="sm"
                className="w-fit"
              >
                Buzón de Sugerencias
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-geo-border pt-6 text-sm text-geo-muted sm:flex-row sm:items-center sm:justify-between">
          <p>{siteConfig.copyright}</p>
          <div className="flex flex-wrap gap-4">
            <Link href="#" className="hover:text-geo-navy">
              Aviso de Privacidad
            </Link>
            <Link href="#" className="hover:text-geo-navy">
              Términos de Uso
            </Link>
            <Link href="#" className="hover:text-geo-navy">
              Accesibilidad
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
