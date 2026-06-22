import { useCallback, useMemo, useState } from "react";
import type { CuestionarioPageData } from "@/lib/services/cuestionario.service";

export type CuestionarioControllerState = {
  data: CuestionarioPageData;
  periodo: string;
  alcaldia: string;
  loading: boolean;
  error: string | null;
  setPeriodo: (periodo: string) => void;
  setAlcaldia: (alcaldia: string) => void;
  reload: () => void;
  resumenFiltrado: CuestionarioPageData["resumenAlcaldia"];
};

type UseCuestionarioControllerArgs = {
  initialData: CuestionarioPageData;
  onFetch: (query: { periodo: string; alcaldia: string }) => Promise<CuestionarioPageData>;
};

export function useCuestionarioController({
  initialData,
  onFetch,
}: UseCuestionarioControllerArgs): CuestionarioControllerState {
  const [data, setData] = useState(initialData);
  const [periodo, setPeriodoState] = useState(initialData.periodo);
  const [alcaldia, setAlcaldiaState] = useState(initialData.alcaldiaFiltro);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWithFilters = useCallback(
    async (nextPeriodo: string, nextAlcaldia: string) => {
      setLoading(true);
      setError(null);
      try {
        const next = await onFetch({
          periodo: nextPeriodo,
          alcaldia: nextAlcaldia,
        });
        setData(next);
        setPeriodoState(next.periodo);
        setAlcaldiaState(next.alcaldiaFiltro);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "No se pudo actualizar el cuestionario";
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [onFetch],
  );

  const setPeriodo = useCallback(
    (next: string) => {
      void fetchWithFilters(next, alcaldia);
    },
    [alcaldia, fetchWithFilters],
  );

  const setAlcaldia = useCallback(
    (next: string) => {
      void fetchWithFilters(periodo, next);
    },
    [periodo, fetchWithFilters],
  );

  const reload = useCallback(() => {
    void fetchWithFilters(periodo, alcaldia);
  }, [periodo, alcaldia, fetchWithFilters]);

  const resumenFiltrado = useMemo(() => {
    if (alcaldia === "Todas") return data.resumenAlcaldia;
    return data.resumenAlcaldia.filter(
      (r) => r.alcaldiaNombre === alcaldia,
    );
  }, [data.resumenAlcaldia, alcaldia]);

  return {
    data,
    periodo,
    alcaldia,
    loading,
    error,
    setPeriodo,
    setAlcaldia,
    reload,
    resumenFiltrado,
  };
}
