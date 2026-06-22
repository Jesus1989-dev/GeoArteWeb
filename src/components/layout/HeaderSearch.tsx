"use client";

import { useState } from "react";
import { CulturalSearchField } from "@/components/features/search/CulturalSearchField";
import { CDMX_ALCALDIAS } from "@/lib/data/supabase/search.repository";
import { cn } from "@/lib/utils";

type HeaderSearchProps = {
  /** Perfil Autoridad: barra más estrecha para dejar espacio a la navegación completa. */
  narrow?: boolean;
};

export function HeaderSearch({ narrow = false }: HeaderSearchProps) {
  const [query, setQuery] = useState("");

  return (
    <CulturalSearchField
      variant="compact"
      query={query}
      onQueryChange={setQuery}
      alcaldias={CDMX_ALCALDIAS}
      placeholder={narrow ? "Buscar alcaldía..." : "Buscar alcaldía o espacio..."}
      className={cn(
        "relative hidden shrink-0 xl:block",
        narrow ? "w-28 2xl:w-36" : "w-32 xl:w-36 2xl:w-44",
      )}
    />
  );
}
