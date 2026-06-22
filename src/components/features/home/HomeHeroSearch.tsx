"use client";

import { useState } from "react";
import { CulturalSearchField } from "@/components/features/search/CulturalSearchField";

type HomeHeroSearchProps = {
  alcaldias: string[];
};

export function HomeHeroSearch({ alcaldias }: HomeHeroSearchProps) {
  const [query, setQuery] = useState("");

  return (
    <CulturalSearchField
      variant="hero"
      query={query}
      onQueryChange={setQuery}
      alcaldias={alcaldias}
      placeholder="Buscar alcaldía o espacio cultural…"
      showExploreButton
      exploreLabel="Explorar Datos"
    />
  );
}
