"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  fetchInvestigacionList,
  fetchInvestigacionRecursoDetalle,
} from "@/lib/api/investigacion-client";
import type {
  InvestigacionListQuery,
  InvestigacionPageData,
  RecursoCualitativo,
} from "@/lib/domain/investigacion";
import { INVESTIGACION_DEFAULT_PAGE_SIZE } from "@/lib/investigacion/investigacion-query";
import { consumeInvestigacionRefreshFlag } from "@/lib/investigacion/investigacion-refresh";
import { InvestigacionView } from "./InvestigacionView";

const SEARCH_DEBOUNCE_MS = 350;

function createInitialQuery(): InvestigacionListQuery {
  return {
    q: "",
    tipo: "todos",
    alcaldia: "todas",
    page: 1,
    pageSize: INVESTIGACION_DEFAULT_PAGE_SIZE,
  };
}

/** Controlador — investigación cualitativa (Supabase o mock). */
export function InvestigacionController({
  initialData,
}: {
  initialData?: InvestigacionPageData;
}) {
  const searchParams = useSearchParams();
  const recursoFromUrl = searchParams.get("recurso")?.trim() ?? null;

  const [data, setData] = useState<InvestigacionPageData | null>(initialData ?? null);
  const [listQuery, setListQuery] = useState<InvestigacionListQuery>(createInitialQuery);
  const [busquedaInput, setBusquedaInput] = useState("");
  const [selectedId, setSelectedId] = useState<string>("");
  const [detalle, setDetalle] = useState<RecursoCualitativo | null>(null);
  const [loadingList, setLoadingList] = useState(initialData == null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadNonce, setReloadNonce] = useState(0);

  const listQueryRef = useRef(listQuery);
  listQueryRef.current = listQuery;
  const appliedInitialRecurso = useRef(false);
  const skipInitialListFetch = useRef(initialData != null);

  const isDefaultListQuery = useCallback((query: InvestigacionListQuery) => {
    const defaults = createInitialQuery();
    return (
      query.q === defaults.q &&
      query.tipo === defaults.tipo &&
      query.alcaldia === defaults.alcaldia &&
      query.page === defaults.page &&
      query.pageSize === defaults.pageSize
    );
  }, []);

  const loadList = useCallback(async (query: InvestigacionListQuery) => {
    setLoadingList(true);
    try {
      const next = await fetchInvestigacionList(query);
      setData(next);
      setError(null);
      return next;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "No se pudo cargar investigación";
      setError(message);
      return null;
    } finally {
      setLoadingList(false);
    }
  }, []);

  const loadDetalle = useCallback(async (id: string) => {
    if (!id) {
      setDetalle(null);
      return;
    }

    setLoadingDetail(true);
    try {
      const next = await fetchInvestigacionRecursoDetalle(id);
      setDetalle(next);
    } catch (err: unknown) {
      console.error("[investigacion] detalle:", err);
      setDetalle(null);
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    if (skipInitialListFetch.current && reloadNonce === 0 && isDefaultListQuery(listQuery)) {
      if (!appliedInitialRecurso.current) {
        if (recursoFromUrl) {
          setSelectedId(recursoFromUrl);
        } else {
          setSelectedId(initialData?.recursosCualitativos[0]?.id ?? "");
        }
        appliedInitialRecurso.current = true;
      }
      return;
    }

    skipInitialListFetch.current = false;

    void loadList(listQuery).then((next) => {
      if (cancelled || !next) return;

      if (!appliedInitialRecurso.current && recursoFromUrl) {
        setSelectedId(recursoFromUrl);
        appliedInitialRecurso.current = true;
        return;
      }

      setSelectedId((current) => {
        if (current && next.recursosCualitativos.some((r) => r.id === current)) {
          return current;
        }
        return next.recursosCualitativos[0]?.id ?? "";
      });
    });

    return () => {
      cancelled = true;
    };
  }, [listQuery, loadList, reloadNonce, recursoFromUrl, isDefaultListQuery, initialData]);

  useEffect(() => {
    if (!selectedId) {
      setDetalle(null);
      return;
    }
    void loadDetalle(selectedId);
  }, [loadDetalle, selectedId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const trimmed = busquedaInput.trim();
      setListQuery((prev) => {
        if (prev.q === trimmed && prev.page === 1) return prev;
        return { ...prev, q: trimmed, page: 1 };
      });
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [busquedaInput]);

  useEffect(() => {
    function tryRefreshFromAdmin() {
      if (consumeInvestigacionRefreshFlag()) {
        setReloadNonce((n) => n + 1);
      }
    }

    tryRefreshFromAdmin();

    function onVisible() {
      if (document.visibilityState === "visible") {
        tryRefreshFromAdmin();
      }
    }

    window.addEventListener("focus", tryRefreshFromAdmin);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("focus", tryRefreshFromAdmin);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  const handleFiltroTipoChange = useCallback((tipo: InvestigacionListQuery["tipo"]) => {
    setListQuery((prev) => ({ ...prev, tipo, page: 1 }));
  }, []);

  const handleFiltroAlcaldiaChange = useCallback((alcaldia: string) => {
    setListQuery((prev) => ({ ...prev, alcaldia, page: 1 }));
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setListQuery((prev) => ({ ...prev, page }));
  }, []);

  const handleSelectRecurso = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  const handleLimpiarFiltros = useCallback(() => {
    setBusquedaInput("");
    setListQuery(createInitialQuery());
  }, []);

  if (error != null && data == null) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 bg-geo-surface px-4 text-center">
        <p className="text-sm font-medium text-geo-navy">Error al cargar investigación</p>
        <p className="max-w-md text-sm text-geo-muted">{error}</p>
      </div>
    );
  }

  if (data == null) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 bg-geo-surface px-4">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-geo-pink border-t-transparent" />
        <p className="text-sm text-geo-muted">Cargando repositorio cualitativo…</p>
      </div>
    );
  }

  return (
    <InvestigacionView
      data={data}
      detalle={detalle}
      loadingList={loadingList}
      loadingDetail={loadingDetail}
      selectedId={selectedId}
      busqueda={busquedaInput}
      filtroTipo={listQuery.tipo}
      filtroAlcaldia={listQuery.alcaldia}
      onBusquedaChange={setBusquedaInput}
      onFiltroTipoChange={handleFiltroTipoChange}
      onFiltroAlcaldiaChange={handleFiltroAlcaldiaChange}
      onPageChange={handlePageChange}
      onSelectRecurso={handleSelectRecurso}
      onLimpiarFiltros={handleLimpiarFiltros}
    />
  );
}
