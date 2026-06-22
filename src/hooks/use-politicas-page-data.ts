"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { fetchPageData } from "@/lib/api/fetch-page-data";
import { queryKeys } from "@/lib/cache/query-keys";
import { consumePoliticasRefreshFlag } from "@/lib/politicas/politicas-refresh";
import type { PoliticasPageData } from "@/lib/services/politicas.service";

type UsePoliticasPageDataResult = {
  data: PoliticasPageData | null;
  error: string | null;
  isLoading: boolean;
};

export function usePoliticasPageData(
  initialData?: PoliticasPageData | null,
): UsePoliticasPageDataResult {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.politicas,
    queryFn: () => fetchPageData<PoliticasPageData>("/api/data/politicas"),
    initialData: initialData ?? undefined,
  });

  useEffect(() => {
    if (consumePoliticasRefreshFlag()) {
      void queryClient.invalidateQueries({ queryKey: queryKeys.politicas });
    }
  }, [queryClient]);

  useEffect(() => {
    const tryRefreshFromAdmin = () => {
      if (consumePoliticasRefreshFlag()) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.politicas });
      }
    };

    tryRefreshFromAdmin();

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        tryRefreshFromAdmin();
      }
    };

    window.addEventListener("focus", tryRefreshFromAdmin);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("focus", tryRefreshFromAdmin);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [queryClient]);

  const errorMessage =
    query.error instanceof Error
      ? query.error.message
      : query.error != null
        ? "No se pudo cargar políticas"
        : null;

  return {
    data: query.data ?? null,
    error: errorMessage,
    isLoading: query.isLoading && query.data == null,
  };
}
