"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import { fetchPageData } from "@/lib/api/fetch-page-data";
import { queryKeys } from "@/lib/cache/query-keys";
import {
  HOME_DATA_STALE_EVENT,
  consumeHomeDataStale,
} from "@/lib/data/home-revalidation";
import type { HomePageData } from "@/lib/services/home.service";

type UseHomePageDataResult = {
  data: HomePageData | null;
  error: string | null;
  refreshing: boolean;
  refresh: () => void;
};

export function useHomePageData(initialData?: HomePageData | null): UseHomePageDataResult {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.home,
    queryFn: () => fetchPageData<HomePageData>("/api/data/home"),
    initialData: initialData ?? undefined,
  });

  useEffect(() => {
    if (consumeHomeDataStale()) {
      void queryClient.invalidateQueries({ queryKey: queryKeys.home });
    }
  }, [queryClient]);

  useEffect(() => {
    const onStale = () => {
      consumeHomeDataStale();
      void queryClient.invalidateQueries({ queryKey: queryKeys.home });
    };

    window.addEventListener(HOME_DATA_STALE_EVENT, onStale);
    return () => window.removeEventListener(HOME_DATA_STALE_EVENT, onStale);
  }, [queryClient]);

  const refresh = useCallback(() => {
    void query.refetch();
  }, [query]);

  const errorMessage =
    query.error instanceof Error
      ? query.error.message
      : query.error != null
        ? "No se pudo cargar la página de inicio"
        : null;

  return {
    data: query.data ?? null,
    error: errorMessage,
    refreshing: query.isFetching && query.data != null,
    refresh,
  };
}
