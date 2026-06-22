"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchPageData } from "@/lib/api/fetch-page-data";
import { queryKeys } from "@/lib/cache/query-keys";
import type { MapaPageData } from "@/lib/services/mapa.service";

type UseMapaPageDataResult = {
  data: MapaPageData | null;
  error: string | null;
  isLoading: boolean;
};

export function useMapaPageData(initialData?: MapaPageData | null): UseMapaPageDataResult {
  const query = useQuery({
    queryKey: queryKeys.mapa,
    queryFn: () => fetchPageData<MapaPageData>("/api/data/mapa"),
    initialData: initialData ?? undefined,
  });

  const errorMessage =
    query.error instanceof Error
      ? query.error.message
      : query.error != null
        ? "No se pudo cargar el mapa"
        : null;

  return {
    data: query.data ?? null,
    error: errorMessage,
    isLoading: query.isLoading && query.data == null,
  };
}
