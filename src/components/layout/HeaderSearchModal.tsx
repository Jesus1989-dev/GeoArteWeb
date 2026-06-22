"use client";

import { useEffect, useId, useState } from "react";
import { Search, X } from "lucide-react";
import { CulturalSearchField } from "@/components/features/search/CulturalSearchField";
import { CDMX_ALCALDIAS } from "@/lib/data/supabase/search.repository";

type HeaderSearchModalProps = {
  open: boolean;
  onClose: () => void;
  narrow?: boolean;
};

export function HeaderSearchModal({
  open,
  onClose,
  narrow = false,
}: HeaderSearchModalProps) {
  const titleId = useId();
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) return;

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
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1200] xl:hidden" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        aria-label="Cerrar búsqueda"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative mx-auto mt-[max(1rem,env(safe-area-inset-top))] w-[min(100vw-1.5rem,32rem)] rounded-2xl border border-geo-border bg-background p-4 shadow-xl"
      >
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 id={titleId} className="flex items-center gap-2 text-base font-semibold text-geo-navy">
            <Search className="h-5 w-5 text-geo-pink" aria-hidden />
            Buscar
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-geo-muted transition hover:bg-geo-surface hover:text-geo-navy"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <CulturalSearchField
          variant="compact"
          query={query}
          onQueryChange={setQuery}
          alcaldias={CDMX_ALCALDIAS}
          placeholder={
            narrow ? "Buscar alcaldía..." : "Buscar alcaldía o espacio..."
          }
          className="relative w-full [&_[role=listbox]]:max-w-none"
        />
      </div>
    </div>
  );
}
