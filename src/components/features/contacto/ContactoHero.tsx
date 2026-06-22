import Link from "next/link";
import type { ContactoPageData } from "@/lib/services/contacto.service";

type ContactoHeroProps = {
  hero: ContactoPageData["contactoHero"];
};

export function ContactoHero({ hero }: ContactoHeroProps) {
  return (
    <section className="border-b border-geo-border bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <p className="text-xs font-semibold uppercase tracking-wider text-geo-muted">
          <Link href="/" className="transition hover:text-geo-pink">
            {hero.breadcrumbInicio}
          </Link>
          <span className="mx-2 text-gray-300">/</span>
          {hero.breadcrumbActual}
        </p>
        <h1 className="mt-4 text-3xl font-bold text-geo-navy sm:text-4xl">
          {hero.titulo}
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-geo-muted">
          {hero.subtitulo}
        </p>
      </div>
    </section>
  );
}
