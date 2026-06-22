"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { fetchPageData } from "@/lib/api/fetch-page-data";
import { queryKeys } from "@/lib/cache/query-keys";
import { consumeContactoRefreshFlag } from "@/lib/contacto/contacto-refresh";
import type { ContactoPageData } from "@/lib/services/contacto.service";

type UseContactoPageDataResult = {
  data: ContactoPageData | null;
  error: string | null;
  isLoading: boolean;
};

export function useContactoPageData(
  initialData?: ContactoPageData | null,
): UseContactoPageDataResult {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.contacto,
    queryFn: () => fetchPageData<ContactoPageData>("/api/data/contacto"),
    initialData: initialData ?? undefined,
  });

  useEffect(() => {
    if (consumeContactoRefreshFlag()) {
      void queryClient.invalidateQueries({ queryKey: queryKeys.contacto });
    }
  }, [queryClient]);

  useEffect(() => {
    const tryRefreshFromAdmin = () => {
      if (consumeContactoRefreshFlag()) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.contacto });
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
        ? "No se pudo cargar contacto"
        : null;

  return {
    data: query.data ?? null,
    error: errorMessage,
    isLoading: query.isLoading && query.data == null,
  };
}
