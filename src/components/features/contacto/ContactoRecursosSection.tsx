import { HelpCircle, Mail } from "lucide-react";
import { ContactForm } from "@/components/contacto/ContactForm";
import { FaqAccordion } from "@/components/contacto/FaqAccordion";
import type { ContactoPageData } from "@/lib/services/contacto.service";

type ContactoRecursosSectionProps = {
  data: Pick<
    ContactoPageData,
    "contactoBuzon" | "contactoFaq" | "faqItems"
  >;
};

export function ContactoRecursosSection({ data }: ContactoRecursosSectionProps) {
  const { contactoBuzon, contactoFaq, faqItems } = data;

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-geo-pink/10 text-geo-pink">
            <Mail className="h-5 w-5" strokeWidth={2} aria-hidden />
          </div>
          <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-geo-muted">
            {contactoBuzon.badge}
          </span>
        </div>
        <h2 className="mt-4 text-xl font-bold text-geo-navy">
          {contactoBuzon.titulo}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-geo-muted">
          {contactoBuzon.descripcion}
        </p>
        <div className="mt-6">
          <ContactForm buzon={contactoBuzon} />
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-geo-navy">
            <HelpCircle className="h-5 w-5" strokeWidth={1.75} aria-hidden />
          </div>
          <h2 className="text-xl font-bold text-geo-navy">
            {contactoFaq.titulo}
          </h2>
        </div>
        <div className="mt-6">
          <FaqAccordion items={faqItems} defaultOpenId="actualizacion" />
        </div>
      </div>
    </div>
  );
}
