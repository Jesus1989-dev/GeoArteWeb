import { ContactoApiSection } from "@/components/features/contacto/ContactoApiSection";
import { ContactoDatasetsSection } from "@/components/features/contacto/ContactoDatasetsSection";
import { ContactoHero } from "@/components/features/contacto/ContactoHero";
import { ContactoPoliticasSection } from "@/components/features/contacto/ContactoPoliticasSection";
import { ContactoRecursosSection } from "@/components/features/contacto/ContactoRecursosSection";
import type { ContactoPageData } from "@/lib/services/contacto.service";

type ContactoViewProps = {
  data: ContactoPageData;
};

export function ContactoView({ data }: ContactoViewProps) {
  const {
    contactoHero,
    contactoBuzon,
    contactoFaq,
    contactoApi,
    apiEndpoints,
    contactoDatasetsSection,
    datasets,
    contactoPoliticas,
    faqItems,
  } = data;

  return (
    <div className="min-h-[calc(100dvh-6rem)] bg-geo-surface">
      <ContactoHero hero={contactoHero} />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        {data.dataSourceNote && (
          <p className="mb-6 text-xs text-geo-muted">
            {data.dataSource === "supabase" ? "● " : "○ "}
            {data.dataSourceNote}
          </p>
        )}

        <ContactoRecursosSection
          data={{ contactoBuzon, contactoFaq, faqItems }}
        />

        <ContactoApiSection
          data={{
            contactoApi,
            apiEndpoints,
            apiBaseUrl: data.apiBaseUrl,
            curlExample: data.curlExample,
            apiToken: data.apiToken,
          }}
        />

        <ContactoDatasetsSection
          data={{ contactoDatasetsSection, datasets }}
        />

        <ContactoPoliticasSection politicas={contactoPoliticas} />
      </div>
    </div>
  );
}
