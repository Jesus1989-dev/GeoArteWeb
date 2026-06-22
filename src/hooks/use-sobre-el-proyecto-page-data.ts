"use client";

import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import { fetchPageData } from "@/lib/api/fetch-page-data";
import { queryKeys } from "@/lib/cache/query-keys";
import type { SobreElProyectoPageData } from "@/lib/services/sobre-el-proyecto.service";

type UseSobreElProyectoPageDataResult = {
  data: SobreElProyectoPageData | null;
  error: string | null;
  isLoading: boolean;
  refresh: () => void;
};

export function useSobreElProyectoPageData(
  initialData?: SobreElProyectoPageData | null,
): UseSobreElProyectoPageDataResult {
  const query = useQuery({
    queryKey: queryKeys.sobreElProyecto,
    queryFn: () =>
      fetchPageData<SobreElProyectoPageData>("/api/data/sobre-el-proyecto"),
    initialData: initialData ?? undefined,
  });

  const refresh = useCallback(() => {
    void query.refetch();
  }, [query]);

  const errorMessage =
    query.error instanceof Error
      ? query.error.message
      : query.error != null
        ? "No se pudo cargar la página del proyecto"
        : null;

  return {
    data: query.data ?? null,
    error: errorMessage,
    isLoading: query.isLoading && query.data == null,
    refresh,
  };
}
