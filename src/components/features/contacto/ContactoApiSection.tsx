import { BookOpen, Terminal } from "lucide-react";
import { ContactoApiCurlBlock } from "@/components/contacto/ContactoApiCurlBlock";
import { Button } from "@/components/shared/Button";
import { buildApiV1Url } from "@/lib/api-v1/url-builders";
import type { ContactoPageData } from "@/lib/services/contacto.service";

type ContactoApiSectionProps = {
  data: Pick<
    ContactoPageData,
    "contactoApi" | "apiEndpoints" | "apiBaseUrl" | "curlExample" | "apiToken"
  >;
};

function buildTryUrl(apiBaseUrl: string, path: string): string {
  const resolved = path
    .replace("{id}", "cuauhtemoc")
    .replace("{q}", "museo");
  return buildApiV1Url(apiBaseUrl, resolved);
}

export function ContactoApiSection({ data }: ContactoApiSectionProps) {
  const { contactoApi, apiEndpoints, apiBaseUrl, curlExample, apiToken } = data;

  return (
    <section
      id="api"
      className="mt-16 scroll-mt-24 rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-geo-navy/10 text-geo-navy">
            <Terminal className="h-5 w-5" strokeWidth={2} aria-hidden />
          </div>
          <div>
            <h2 className="text-xl font-bold text-geo-navy">{contactoApi.titulo}</h2>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-geo-muted">
              {contactoApi.subtitulo}
            </p>
            <p className="mt-2 font-mono text-xs text-geo-muted">
              Base: {apiBaseUrl}/api/v1
            </p>
          </div>
        </div>
        <Button
          href={buildApiV1Url(apiBaseUrl, "/api/v1/espacios/geojson")}
          variant="ghost"
          size="md"
          className="shrink-0 gap-2 border border-gray-200 bg-white text-geo-navy shadow-sm hover:bg-gray-50"
        >
          <BookOpen className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          {contactoApi.btnDocumentacion}
        </Button>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {apiEndpoints.map((ep) => {
          const tryUrl = buildTryUrl(apiBaseUrl, ep.path);
          return (
            <div
              key={ep.path}
              className="rounded-xl border border-gray-200 bg-white p-5"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-sky-600 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">
                  {ep.method}
                </span>
                <code className="break-all font-mono text-sm font-semibold text-geo-navy">
                  {ep.path}
                </code>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-geo-muted">
                {ep.description}
              </p>
              <a
                href={tryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block font-mono text-xs text-geo-pink hover:underline"
              >
                Probar endpoint
              </a>
            </div>
          );
        })}
      </div>

      <div className="mt-6">
        <ContactoApiCurlBlock api={contactoApi} curlExample={curlExample} apiToken={apiToken} />
      </div>
    </section>
  );
}
