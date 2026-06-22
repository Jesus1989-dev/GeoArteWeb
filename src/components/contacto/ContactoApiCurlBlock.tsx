"use client";

import { useState } from "react";
import { Check, FileCode } from "lucide-react";
import type { ContactoPageData } from "@/lib/services/contacto.service";
import { cn } from "@/lib/utils";

type ContactoApiCurlBlockProps = {
  api: ContactoPageData["contactoApi"];
  curlExample: string;
  apiToken: string;
};

export function ContactoApiCurlBlock({ api, curlExample, apiToken }: ContactoApiCurlBlockProps) {
  const [copied, setCopied] = useState(false);

  async function copyToken() {
    try {
      await navigator.clipboard.writeText(apiToken);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl bg-geo-navy p-5 sm:flex-row sm:items-center sm:gap-6 sm:p-6">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-geo-pink text-white">
        <FileCode className="h-6 w-6" strokeWidth={2} aria-hidden />
      </div>

      <div className="min-w-0 flex-1">
        <p className="font-semibold text-white">{api.curlTitulo}</p>
        <pre
          className={cn(
            "mt-2 overflow-x-auto font-mono text-xs leading-relaxed text-slate-300 sm:text-sm",
          )}
        >
          {curlExample}
        </pre>
        <p className="mt-2 text-xs text-slate-400">
          Token opcional en desarrollo. En producción configure{" "}
          <code className="text-slate-200">GEOARTE_API_REQUIRE_TOKEN=true</code>.
        </p>
      </div>

      <button
        type="button"
        onClick={copyToken}
        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-geo-pink px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-geo-pink-hover"
      >
        {copied ? (
          <>
            <Check className="h-4 w-4" aria-hidden />
            Copiado
          </>
        ) : (
          api.btnCopiarToken
        )}
      </button>
    </div>
  );
}
