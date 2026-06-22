"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ChevronDown,
  Crosshair,
  Layers,
  MapPin,
  Maximize2,
  Minimize2,
  SlidersHorizontal,
} from "lucide-react";
import { CulturalSearchField } from "@/components/features/search/CulturalSearchField";
import { MapCapasPanel } from "@/components/mapa/MapCapasPanel";
import { MapCanvas, type MapCanvasHandle } from "@/components/mapa/MapCanvas";
import { MapFiltrosPanel } from "@/components/mapa/MapFiltrosPanel";
import { MapaEspacioPanel } from "@/components/mapa/MapaEspacioPanel";
import { MapaRecursoCualitativoPanel } from "@/components/mapa/MapaRecursoCualitativoPanel";
import { useAuth } from "@/contexts/AuthProvider";
import { useFullscreen } from "@/hooks/use-fullscreen";
import type { CapaMapaState, EspacioTipo } from "@/lib/domain/mapa";
import { createEmptyCapaMapaState, ESPEACIO_TIPOS } from "@/lib/domain/mapa";
import { fetchMapaTerritorialData } from "@/lib/data/supabase/mapa.repository";
import { CDMX_ALCALDIAS } from "@/lib/data/supabase/search.repository";
import type { Espacio } from "@/lib/domain/mapa";
import type { RecursoCualitativo } from "@/lib/domain/investigacion";
import {
  DEFAULT_MAPA_FILTROS,
  formatTerritorialFuenteLabel,
  createDefaultCapasToggle,
  pickOverlayCapas,
  type MapaCapasToggleId,
  type MapaFiltrosAvanzados,
} from "@/lib/domain/mapa-territorial";
import {
  filterEspacios,
  filterEspaciosByAlcaldia,
  filterEspaciosByMetricas,
  filterRecursosByAlcaldia,
} from "@/lib/mapa/filter-espacios";
import { applyMapaPreset, type MapaPresetId } from "@/lib/mapa/map-presets";
import {
  normalizeSearchText,
  resolveAlcaldiaFromQuery,
  resolveAlcaldiaActiva,
} from "@/lib/mapa/search-utils";
import { fetchSavedEspacioIdsForUser } from "@/lib/data/supabase/saved-espacios.repository";
import {
  addSavedEspacio,
  removeSavedEspacio,
} from "@/lib/services/perfil.service";
import type { MapaPageData } from "@/lib/services/mapa.service";
import { cn } from "@/lib/utils";

type MapaInteractivoProps = {
  data: MapaPageData;
};

type CapaMapaStateLocal = CapaMapaState;

function buildCapaMapaInitial(
  secciones: MapaPageData["mapaCapasSecciones"],
): CapaMapaStateLocal {
  const state = createEmptyCapaMapaState();
  for (const seccion of secciones) {
    for (const capa of seccion.capas) {
      if (capa.mapKey != null) {
        state[capa.mapKey] = {
          visible: capa.defaultChecked,
          opacity: capa.defaultOpacity,
        };
      }
    }
  }
  return state;
}

function tiposFromCapaMapa(capaMapa: CapaMapaStateLocal): MapaFiltrosAvanzados["tipos"] {
  const tipos = {} as MapaFiltrosAvanzados["tipos"];
  for (const tipo of ESPEACIO_TIPOS) {
    tipos[tipo] = capaMapa[tipo].visible;
  }
  return tipos;
}

function applyTiposToCapaMapa(
  capaMapa: CapaMapaStateLocal,
  tipos: MapaFiltrosAvanzados["tipos"],
): CapaMapaStateLocal {
  const next = { ...capaMapa };
  for (const tipo of ESPEACIO_TIPOS) {
    next[tipo] = { ...capaMapa[tipo], visible: tipos[tipo] };
  }
  return next;
}

function busquedaEsSoloAlcaldia(busqueda: string, alcaldias: readonly string[]): boolean {
  const matched = resolveAlcaldiaFromQuery(busqueda, alcaldias);
  if (!matched) return false;
  return normalizeSearchText(busqueda) === normalizeSearchText(matched);
}

function buildCapasExtraInitial(
  secciones: MapaPageData["mapaCapasSecciones"],
): Record<MapaCapasToggleId, boolean> {
  const extra = createDefaultCapasToggle();
  for (const seccion of secciones) {
    for (const capa of seccion.capas) {
      if (capa.mapKey == null && capa.id in extra) {
        extra[capa.id as MapaCapasToggleId] = capa.defaultChecked;
      }
    }
  }
  return extra;
}

export default function MapaInteractivo({ data }: MapaInteractivoProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const focusFromUrl = searchParams.get("espacio");
  const recursoFromUrl = searchParams.get("recurso");
  const latFromUrl = Number.parseFloat(searchParams.get("lat") ?? "");
  const lngFromUrl = Number.parseFloat(searchParams.get("lng") ?? "");
  const queryFromUrl = searchParams.get("q") ?? "";
  const alcaldiaFromUrl = searchParams.get("alcaldia") ?? "";

  const { session, ready, usesSupabase } = useAuth();
  const {
    espacios,
    recursosCualitativos,
    territorial: territorialInitial,
    tipoColors,
    mapaCapasPresets,
    mapaCapasPanelMeta,
    mapaCapasSecciones,
    dataSource,
    dataSourceNote,
  } = data;

  const [capaMapa, setCapaMapa] = useState(() =>
    buildCapaMapaInitial(mapaCapasSecciones),
  );
  const [capasExtra, setCapasExtra] = useState(() =>
    buildCapasExtraInitial(mapaCapasSecciones),
  );
  const [capaPreset, setCapaPreset] = useState<MapaPresetId>("infra");
  const [territorial, setTerritorial] = useState(territorialInitial);
  const [filtrosOpen, setFiltrosOpen] = useState(false);
  const [filtrosDraft, setFiltrosDraft] = useState<MapaFiltrosAvanzados>(DEFAULT_MAPA_FILTROS);
  const [filtrosAplicados, setFiltrosAplicados] = useState<MapaFiltrosAvanzados>(
    DEFAULT_MAPA_FILTROS,
  );
  const [alcaldiaFiltroDraft, setAlcaldiaFiltroDraft] = useState(alcaldiaFromUrl);
  const [resetNonce, setResetNonce] = useState(0);
  const [cdmxViewNonce, setCdmxViewNonce] = useState(0);
  const [selectedEspacio, setSelectedEspacio] = useState<Espacio | null>(null);
  const [selectedRecurso, setSelectedRecurso] = useState<RecursoCualitativo | null>(
    null,
  );
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [guardando, setGuardando] = useState(false);
  const [deepLinkHandled, setDeepLinkHandled] = useState(false);
  const [busqueda, setBusqueda] = useState(queryFromUrl || alcaldiaFromUrl);
  const mapShellRef = useRef<HTMLDivElement>(null);
  const mapCanvasRef = useRef<MapCanvasHandle>(null);
  const { isFullscreen: isMapFullscreen, toggle: toggleMapFullscreen } =
    useFullscreen(mapShellRef);

  const alcaldiasBusqueda = useMemo(() => {
    const nombres = new Set(CDMX_ALCALDIAS);
    for (const espacio of espacios) {
      if (espacio.alcaldia) nombres.add(espacio.alcaldia);
    }
    return [...nombres].sort((a, b) => a.localeCompare(b, "es"));
  }, [espacios]);

  const alcaldiaActiva = useMemo(
    () => resolveAlcaldiaActiva(alcaldiaFromUrl, busqueda, alcaldiasBusqueda),
    [alcaldiaFromUrl, busqueda, alcaldiasBusqueda],
  );

  useEffect(() => {
    setBusqueda(queryFromUrl || alcaldiaFromUrl);
  }, [queryFromUrl, alcaldiaFromUrl]);

  useEffect(() => {
    if (!filtrosOpen) {
      setAlcaldiaFiltroDraft(alcaldiaActiva ?? "");
    }
  }, [alcaldiaActiva, filtrosOpen]);

  useEffect(() => {
    setTerritorial(territorialInitial);
  }, [territorialInitial]);

  useEffect(() => {
    let cancelled = false;

    void fetchMapaTerritorialData(espacios, alcaldiaActiva || undefined).then((next) => {
      if (!cancelled) setTerritorial(next);
    });

    return () => {
      cancelled = true;
    };
  }, [espacios, alcaldiaActiva]);

  const espaciosFiltrados = useMemo(() => {
    let base = espacios;

    if (alcaldiaActiva) {
      base = filterEspaciosByAlcaldia(base, alcaldiaActiva, territorial.geometrias);
    } else if (busqueda.trim()) {
      base = filterEspacios(base, busqueda, alcaldiasBusqueda);
    }

    base = filterEspaciosByMetricas(
      base,
      territorial.metricas,
      filtrosAplicados.brechaMinima,
      filtrosAplicados.soloVacios,
    );

    return base.filter((espacio) => capaMapa[espacio.tipo].visible);
  }, [
    alcaldiaActiva,
    alcaldiasBusqueda,
    busqueda,
    capaMapa,
    espacios,
    filtrosAplicados.brechaMinima,
    filtrosAplicados.soloVacios,
    territorial.geometrias,
    territorial.metricas,
  ]);

  const recursosFiltrados = useMemo(() => {
    if (!alcaldiaActiva) return recursosCualitativos;
    return filterRecursosByAlcaldia(
      recursosCualitativos,
      alcaldiaActiva,
      territorial.geometrias,
    );
  }, [alcaldiaActiva, recursosCualitativos, territorial.geometrias]);

  const syncQueryToUrl = useCallback(
    (nextQuery: string, espacioId?: string, alcaldia?: string) => {
      const params = new URLSearchParams(searchParams.toString());
      const trimmed = nextQuery.trim();
      const resolvedAlcaldia =
        alcaldia ?? resolveAlcaldiaFromQuery(trimmed, alcaldiasBusqueda) ?? undefined;

      if (trimmed) params.set("q", trimmed);
      else params.delete("q");

      if (resolvedAlcaldia) params.set("alcaldia", resolvedAlcaldia);
      else params.delete("alcaldia");

      if (espacioId) params.set("espacio", espacioId);
      else params.delete("espacio");

      const qs = params.toString();
      router.replace(qs ? `/mapa?${qs}` : "/mapa", { scroll: false });
    },
    [alcaldiasBusqueda, router, searchParams],
  );

  const handleSearchNavigate = useCallback(
    (input: { q: string; alcaldia?: string; espacioId?: string }) => {
      syncQueryToUrl(input.q, input.espacioId, input.alcaldia);
      if (input.espacioId) {
        const target = espacios.find((espacio) => espacio.id === input.espacioId);
        if (target) setSelectedEspacio(target);
      } else {
        setSelectedEspacio(null);
      }
    },
    [espacios, syncQueryToUrl],
  );

  const puedeGuardar =
    usesSupabase && ready && session != null && session.userId != null;

  const reloadSavedIds = useCallback(async () => {
    if (!session?.userId || !usesSupabase) {
      setSavedIds(new Set());
      return;
    }
    const ids = await fetchSavedEspacioIdsForUser(session.userId);
    setSavedIds(new Set(ids));
  }, [session?.userId, usesSupabase]);

  useEffect(() => {
    reloadSavedIds();
  }, [reloadSavedIds]);

  useEffect(() => {
    if (deepLinkHandled || !focusFromUrl || espacios.length === 0 || recursoFromUrl) {
      return;
    }
    const target = espacios.find((e) => e.id === focusFromUrl);
    if (target != null) {
      setSelectedEspacio(target);
      setSelectedRecurso(null);
      setDeepLinkHandled(true);
    }
  }, [deepLinkHandled, focusFromUrl, espacios, recursoFromUrl]);

  useEffect(() => {
    if (!recursoFromUrl || recursosCualitativos.length === 0) return;
    const target = recursosCualitativos.find((r) => r.id === recursoFromUrl);
    if (target != null) {
      setSelectedRecurso(target);
      setSelectedEspacio(null);
    }
  }, [recursoFromUrl, recursosCualitativos]);

  useEffect(() => {
    if (!queryFromUrl || focusFromUrl || recursoFromUrl || espacios.length === 0) return;
    const filtered = filterEspacios(espacios, queryFromUrl, alcaldiasBusqueda);
    if (filtered.length === 1) {
      setSelectedEspacio(filtered[0]);
    }
  }, [queryFromUrl, focusFromUrl, espacios, alcaldiasBusqueda]);

  const onCapaMapaChange = useCallback(
    (tipo: EspacioTipo, patch: Partial<{ visible: boolean; opacity: number }>) => {
      setCapaMapa((prev) => {
        const nextCapa = { ...prev, [tipo]: { ...prev[tipo], ...patch } };
        if (patch.visible !== undefined) {
          const tipos = tiposFromCapaMapa(nextCapa);
          setFiltrosAplicados((prevFiltros) => ({ ...prevFiltros, tipos }));
          if (!filtrosOpen) {
            setFiltrosDraft((prevDraft) => ({ ...prevDraft, tipos }));
          }
        }
        return nextCapa;
      });
    },
    [filtrosOpen],
  );

  const onCapaExtraChange = useCallback((id: string, visible: boolean) => {
    setCapasExtra((prev) => ({ ...prev, [id as MapaCapasToggleId]: visible }));
  }, []);

  const handlePresetChange = useCallback((preset: MapaPresetId) => {
    setCapaPreset(preset);
    const next = applyMapaPreset(preset);
    setCapaMapa(next.capaMapa);
    setCapasExtra(next.capasExtra);
    const tipos = tiposFromCapaMapa(next.capaMapa);
    setFiltrosAplicados((prev) => ({ ...prev, tipos }));
    setFiltrosDraft((prev) => ({ ...prev, tipos }));
  }, []);

  const handleCentrarCdmx = useCallback(() => {
    setSelectedEspacio(null);
    setSelectedRecurso(null);
    setBusqueda("");
    setAlcaldiaFiltroDraft("");

    const params = new URLSearchParams(searchParams.toString());
    params.delete("alcaldia");
    params.delete("q");
    params.delete("espacio");
    params.delete("recurso");
    params.delete("lat");
    params.delete("lng");
    const qs = params.toString();
    router.replace(qs ? `/mapa?${qs}` : "/mapa", { scroll: false });

    setCdmxViewNonce((n) => n + 1);
  }, [router, searchParams]);

  const handleReset = useCallback(() => {
    setCapaPreset("infra");
    const initialCapa = buildCapaMapaInitial(mapaCapasSecciones);
    setCapaMapa(initialCapa);
    setCapasExtra(buildCapasExtraInitial(mapaCapasSecciones));
    const tipos = tiposFromCapaMapa(initialCapa);
    setFiltrosDraft({ ...DEFAULT_MAPA_FILTROS, tipos });
    setFiltrosAplicados({ ...DEFAULT_MAPA_FILTROS, tipos });
    setResetNonce((n) => n + 1);
  }, [mapaCapasSecciones]);

  const handleAplicarFiltros = useCallback(() => {
    setFiltrosAplicados(filtrosDraft);
    setCapaMapa((prev) => applyTiposToCapaMapa(prev, filtrosDraft.tipos));

    const nextBusqueda = alcaldiaFiltroDraft
      ? alcaldiaFiltroDraft
      : busquedaEsSoloAlcaldia(busqueda, alcaldiasBusqueda)
        ? ""
        : busqueda;

    if (alcaldiaFiltroDraft) {
      setBusqueda(alcaldiaFiltroDraft);
    } else if (nextBusqueda !== busqueda) {
      setBusqueda("");
    }

    syncQueryToUrl(nextBusqueda, undefined, alcaldiaFiltroDraft || undefined);
    setFiltrosOpen(false);
  }, [alcaldiaFiltroDraft, alcaldiasBusqueda, busqueda, filtrosDraft, syncQueryToUrl]);

  const handleLimpiarFiltros = useCallback(() => {
    const tiposReset = DEFAULT_MAPA_FILTROS.tipos;
    setFiltrosDraft(DEFAULT_MAPA_FILTROS);
    setFiltrosAplicados(DEFAULT_MAPA_FILTROS);
    setAlcaldiaFiltroDraft("");
    setCapaMapa((prev) => applyTiposToCapaMapa(prev, tiposReset));

    const limpiarBusqueda =
      Boolean(alcaldiaFromUrl) || busquedaEsSoloAlcaldia(busqueda, alcaldiasBusqueda);
    const nextBusqueda = limpiarBusqueda ? "" : busqueda;
    if (limpiarBusqueda) setBusqueda("");
    syncQueryToUrl(nextBusqueda, undefined, undefined);
  }, [alcaldiaFromUrl, alcaldiasBusqueda, busqueda, syncQueryToUrl]);

  const handleEspacioSelect = useCallback((espacio: Espacio) => {
    setSelectedEspacio(espacio);
    setSelectedRecurso(null);
  }, []);

  const handleRecursoSelect = useCallback((recurso: RecursoCualitativo) => {
    setSelectedRecurso(recurso);
    setSelectedEspacio(null);
    const params = new URLSearchParams(searchParams.toString());
    params.set("recurso", recurso.id);
    if (
      recurso.lat != null &&
      recurso.lng != null &&
      Number.isFinite(recurso.lat) &&
      Number.isFinite(recurso.lng)
    ) {
      params.set("lat", String(recurso.lat));
      params.set("lng", String(recurso.lng));
    } else {
      params.delete("lat");
      params.delete("lng");
    }
    params.delete("espacio");
    router.replace(`/mapa?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  async function handleToggleGuardado() {
    if (!selectedEspacio || !session?.userId || guardando) return;

    setGuardando(true);
    try {
      const id = selectedEspacio.id;
      const yaGuardado = savedIds.has(id);
      if (yaGuardado) {
        await removeSavedEspacio({ userId: session.userId, espacioId: id });
        setSavedIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      } else {
        await addSavedEspacio({ userId: session.userId, espacioId: id });
        setSavedIds((prev) => new Set(prev).add(id));
      }
    } catch (err) {
      console.error("[mapa] guardar espacio:", err);
    } finally {
      setGuardando(false);
    }
  }

  const resultadoCount = espaciosFiltrados.length;

  const destacados = useMemo(() => {
    return espaciosFiltrados.slice(0, 4);
  }, [espaciosFiltrados]);

  const focusRecursoCoords = useMemo(() => {
    if (Number.isFinite(latFromUrl) && Number.isFinite(lngFromUrl)) {
      return { lat: latFromUrl, lng: lngFromUrl };
    }

    const recurso =
      selectedRecurso ??
      (recursoFromUrl
        ? recursosCualitativos.find((r) => r.id === recursoFromUrl)
        : undefined);

    if (
      recurso?.lat != null &&
      recurso.lng != null &&
      Number.isFinite(recurso.lat) &&
      Number.isFinite(recurso.lng)
    ) {
      return { lat: recurso.lat, lng: recurso.lng };
    }

    return null;
  }, [latFromUrl, lngFromUrl, recursoFromUrl, recursosCualitativos, selectedRecurso]);

  const focusEspacioId = recursoFromUrl ? null : selectedEspacio?.id ?? focusFromUrl;
  const focusRecursoId = recursoFromUrl ?? selectedRecurso?.id ?? null;
  const hasSearchFilter = Boolean(
    !recursoFromUrl && (alcaldiaActiva || busqueda.trim()),
  );
  const territorialFuente = formatTerritorialFuenteLabel(territorial.sources);

  return (
    <div className="flex min-h-[calc(100dvh-8rem)] flex-col bg-geo-surface">
      <div className="border-b border-geo-border bg-geo-card px-4 py-3 sm:px-6 lg:px-8 overflow-visible">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-3 overflow-visible sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <div className="relative w-full min-w-0 sm:min-w-[240px] sm:max-w-xs lg:max-w-sm">
              <select
                className="w-full appearance-none rounded-lg border border-geo-border bg-geo-surface py-2.5 pl-10 pr-9 text-sm font-medium text-geo-navy outline-none focus:border-geo-pink focus:ring-2 focus:ring-geo-pink/20"
                value={capaPreset}
                onChange={(event) =>
                  handlePresetChange(event.target.value as MapaPresetId)
                }
                aria-label="Vista del mapa"
              >
                {mapaCapasPresets.map((preset) => (
                  <option key={preset.value} value={preset.value}>
                    {preset.label}
                  </option>
                ))}
              </select>
              <Layers
                size={16}
                color="var(--geo-navy)"
                strokeWidth={2}
                className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2"
                aria-hidden
              />
              <ChevronDown
                size={16}
                color="var(--geo-muted)"
                strokeWidth={2}
                className="pointer-events-none absolute right-2.5 top-1/2 z-10 -translate-y-1/2"
                aria-hidden
              />
            </div>
            <CulturalSearchField
              variant="map"
              query={busqueda}
              onQueryChange={setBusqueda}
              onSubmit={() => syncQueryToUrl(busqueda)}
              onNavigate={handleSearchNavigate}
              autoNavigate={false}
              alcaldias={alcaldiasBusqueda}
              placeholder="Buscar alcaldía o espacio cultural…"
              className="min-w-0 w-full flex-1 sm:min-w-[240px] md:max-w-md"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              {dataSource === "supabase" ? "Padrón Supabase" : "Modo demo"}
            </span>
            {puedeGuardar && savedIds.size > 0 && (
              <Link
                href="/perfil"
                className="rounded-full bg-geo-pink/10 px-3 py-1 text-xs font-semibold text-geo-pink hover:bg-geo-pink/15"
              >
                {savedIds.size} guardados
              </Link>
            )}
            <button
              type="button"
              onClick={() => {
                setFiltrosDraft(filtrosAplicados);
                setAlcaldiaFiltroDraft(alcaldiaActiva ?? "");
                setFiltrosOpen(true);
              }}
              aria-label="Filtros avanzados"
              className="inline-flex items-center gap-2 rounded-lg border border-geo-border bg-geo-card px-3 py-2 text-sm font-medium text-geo-navy hover:bg-geo-surface"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden sm:inline">Filtros avanzados</span>
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col gap-3 p-3 sm:gap-4 sm:p-4 lg:flex-row lg:gap-6 lg:p-6">
        <MapCapasPanel
          titulo={mapaCapasPanelMeta.titulo}
          capaBaseActiva={mapaCapasPanelMeta.capaBaseActiva}
          resetLabel={mapaCapasPanelMeta.resetLabel}
          territorialFuente={territorialFuente}
          secciones={mapaCapasSecciones}
          capaMapa={capaMapa}
          onCapaMapaChange={onCapaMapaChange}
          capasExtra={capasExtra}
          onCapaExtraChange={onCapaExtraChange}
          onReset={handleReset}
        />

        <div className="order-1 flex min-h-0 flex-1 flex-col gap-4 lg:order-2">
          <div
            ref={mapShellRef}
            className={cn(
              "relative flex min-h-[min(52vh,420px)] flex-1 flex-col overflow-hidden rounded-xl border border-geo-border bg-geo-card shadow-sm sm:min-h-[min(60vh,560px)] lg:min-h-[min(70vh,640px)]",
              isMapFullscreen && "min-h-screen h-screen rounded-none border-0 bg-geo-surface",
            )}
          >
            <MapCanvas
              ref={mapCanvasRef}
              espacios={espaciosFiltrados}
              tipoColors={tipoColors}
              capaMapa={capaMapa}
              capasExtra={pickOverlayCapas(capasExtra)}
              territorial={territorial}
              brechaMinima={filtrosAplicados.brechaMinima}
              soloVacios={filtrosAplicados.soloVacios}
              resetNonce={resetNonce}
              cdmxViewNonce={cdmxViewNonce}
              focusEspacioId={focusEspacioId}
              recursosCualitativos={
                capasExtra.recursosCualitativos ? recursosFiltrados : []
              }
              focusRecursoId={focusRecursoId}
              focusRecursoCoords={focusRecursoCoords}
              shouldFitBounds={hasSearchFilter}
              onEspacioSelect={handleEspacioSelect}
              onRecursoSelect={handleRecursoSelect}
            />
            <div className="pointer-events-none absolute right-3 top-3 z-[1000] flex flex-col items-end gap-2">
              <div className="pointer-events-auto flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={handleCentrarCdmx}
                  title="Centrar mapa en las 16 alcaldías de CDMX"
                  aria-label="Centrar mapa en las 16 alcaldías de CDMX"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-geo-border bg-geo-card/95 px-2.5 py-2 text-xs font-medium text-geo-navy shadow-md backdrop-blur-sm hover:bg-white"
                >
                  <Crosshair className="h-4 w-4 shrink-0 text-geo-pink" aria-hidden />
                  <span className="hidden sm:inline">16 alcaldías</span>
                </button>
                <button
                  type="button"
                  onClick={() => void toggleMapFullscreen()}
                  title={isMapFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
                  aria-pressed={isMapFullscreen}
                  className="rounded-lg border border-geo-border bg-geo-card/95 p-2 text-geo-muted shadow-md backdrop-blur-sm hover:text-geo-navy"
                >
                  {isMapFullscreen ? (
                    <Minimize2 className="h-4 w-4" />
                  ) : (
                    <Maximize2 className="h-4 w-4" />
                  )}
                </button>
              </div>
              <div className="leaflet-bar leaflet-control pointer-events-auto">
                <a
                  href="#"
                  role="button"
                  title="Acercar"
                  aria-label="Acercar"
                  className="leaflet-control-zoom-in"
                  onClick={(event) => {
                    event.preventDefault();
                    mapCanvasRef.current?.zoomIn();
                  }}
                >
                  +
                </a>
                <a
                  href="#"
                  role="button"
                  title="Alejar"
                  aria-label="Alejar"
                  className="leaflet-control-zoom-out"
                  onClick={(event) => {
                    event.preventDefault();
                    mapCanvasRef.current?.zoomOut();
                  }}
                >
                  −
                </a>
              </div>
            </div>
            {selectedRecurso != null && (
              <MapaRecursoCualitativoPanel
                recurso={selectedRecurso}
                onCerrar={() => {
                  setSelectedRecurso(null);
                  const params = new URLSearchParams(searchParams.toString());
                  params.delete("recurso");
                  params.delete("lat");
                  params.delete("lng");
                  const qs = params.toString();
                  router.replace(qs ? `/mapa?${qs}` : "/mapa", { scroll: false });
                }}
              />
            )}
            {selectedEspacio != null && selectedRecurso == null && (
              <MapaEspacioPanel
                espacio={selectedEspacio}
                tipoColors={tipoColors}
                guardado={savedIds.has(selectedEspacio.id)}
                puedeGuardar={puedeGuardar}
                guardando={guardando}
                onToggleGuardado={handleToggleGuardado}
                onCerrar={() => setSelectedEspacio(null)}
              />
            )}
          </div>

          <div className="rounded-xl border border-geo-border bg-geo-card p-3 shadow-sm sm:p-4">
            <div className="flex flex-col gap-3 border-b border-geo-border pb-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-geo-navy">
                  {resultadoCount} resultados
                  {(alcaldiaActiva || busqueda.trim()) &&
                    ` para «${alcaldiaActiva || busqueda.trim()}»`}
                </p>
                <p className="text-xs text-geo-muted">{dataSourceNote}</p>
              </div>
              <div className="flex max-h-20 flex-wrap gap-x-2 gap-y-1 overflow-y-auto text-[11px] sm:max-h-24 sm:gap-x-3 sm:text-xs">
                {ESPEACIO_TIPOS.map((tipo) => (
                  <span key={tipo} className="flex items-center gap-1.5">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: tipoColors[tipo].fill }}
                    />
                    {tipoColors[tipo].label}
                  </span>
                ))}
                {capasExtra.recursosCualitativos &&
                  recursosCualitativos.some(
                    (r) =>
                      r.lat != null &&
                      r.lng != null &&
                      Number.isFinite(r.lat) &&
                      Number.isFinite(r.lng),
                  ) && (
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-pink-500" />
                    Recursos cualitativos
                  </span>
                )}
              </div>
            </div>
            <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
              {destacados.map((e) => (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => setSelectedEspacio(e)}
                  className={cn(
                    "min-w-[160px] shrink-0 rounded-lg border p-3 text-left transition hover:border-geo-pink/40 hover:shadow-sm sm:min-w-[200px]",
                    selectedEspacio?.id === e.id
                      ? "border-geo-pink bg-geo-pink/5"
                      : "border-geo-border bg-geo-surface/50",
                  )}
                >
                  <span
                    className="text-[10px] font-semibold uppercase tracking-wide"
                    style={{ color: tipoColors[e.tipo].stroke }}
                  >
                    {tipoColors[e.tipo].label}
                  </span>
                  <p className="mt-1 text-sm font-medium text-geo-navy">{e.nombre}</p>
                  <p className="mt-1 flex items-start gap-1 text-xs text-geo-muted">
                    <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
                    {e.direccion}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <MapFiltrosPanel
        open={filtrosOpen}
        onClose={() => setFiltrosOpen(false)}
        filtros={filtrosDraft}
        onChange={setFiltrosDraft}
        alcaldiaSeleccionada={alcaldiaFiltroDraft}
        onAlcaldiaChange={setAlcaldiaFiltroDraft}
        onAplicar={handleAplicarFiltros}
        onLimpiar={handleLimpiarFiltros}
      />
    </div>
  );
}
