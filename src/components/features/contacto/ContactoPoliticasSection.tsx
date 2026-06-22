import Link from "next/link";
import { ExternalLink, Info, ShieldCheck } from "lucide-react";
import { Button } from "@/components/shared/Button";
import type { ContactoPageData } from "@/lib/services/contacto.service";

type ContactoPoliticasSectionProps = {
  politicas: ContactoPageData["contactoPoliticas"];
};

export function ContactoPoliticasSection({ politicas }: ContactoPoliticasSectionProps) {
  const { politicas: pol, atribucion, apiKey } = politicas;

  return (
    <section className="mt-16 border-t border-gray-200 pt-12">
      <div className="grid gap-10 lg:grid-cols-3">
        <div>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-geo-pink/10 text-geo-pink">
            <ShieldCheck className="h-5 w-5" strokeWidth={2} aria-hidden />
          </div>
          <h3 className="mt-4 font-bold text-geo-navy">{pol.titulo}</h3>
          <p className="mt-2 text-sm leading-relaxed text-geo-muted">
            {pol.descripcion}
          </p>
          <Link
            href={pol.linkHref}
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-sky-700 hover:text-sky-900 hover:underline"
          >
            {pol.linkLabel}
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>

        <div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-geo-pink/10 text-geo-pink">
            <Info className="h-5 w-5" strokeWidth={2} aria-hidden />
          </div>
          <h3 className="mt-4 font-bold text-geo-navy">{atribucion.titulo}</h3>
          <p className="mt-2 text-sm leading-relaxed text-geo-muted">
            {atribucion.descripcion}
          </p>
          <Link
            href={atribucion.linkHref}
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-sky-700 hover:text-sky-900 hover:underline"
          >
            {atribucion.linkLabel}
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>

        <div className="rounded-xl border border-geo-pink/30 bg-geo-pink/5 p-6">
          <h3 className="font-bold text-geo-navy">{apiKey.titulo}</h3>
          <p className="mt-2 text-sm leading-relaxed text-geo-muted">
            {apiKey.descripcion}
          </p>
          <Button
            href={apiKey.btnHref}
            variant="secondary"
            className="mt-6 w-full justify-center"
          >
            {apiKey.btnLabel}
          </Button>
        </div>
      </div>
    </section>
  );
}
