"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  ESPEACIO_TIPOS,
  type CapaMapaState,
  type Espacio,
  type EspacioTipo,
} from "@/lib/domain/mapa";
import type { MapaCapasExtraId } from "@/lib/domain/mapa-territorial";
import type { MapaTerritorialData } from "@/lib/domain/mapa-territorial";
import type { MapaPageData } from "@/lib/services/mapa.service";
import type { RecursoCualitativo } from "@/lib/domain/investigacion";
import { buildEspacioDirectionsUrl } from "@/lib/espacios/espacio-direcciones";
import {
  createEmptyOverlayBundle,
  OVERLAY_LEGEND,
  rebuildOverlayLayers,
  syncOverlayVisibility,
  type OverlayBundle,
} from "@/components/mapa/map-overlays";
import {
  CDMX_MAP_CENTER,
  CDMX_MAP_ZOOM,
  fitMapToCdmxAlcaldias,
} from "@/lib/mapa/cdmx-map-view";

export type MapCanvasHandle = {
  zoomIn: () => void;
  zoomOut: () => void;
};

export type MapCanvasProps = {
  espacios: MapaPageData["espacios"];
  tipoColors: MapaPageData["tipoColors"];
  capaMapa: CapaMapaState;
  capasExtra: Record<MapaCapasExtraId, boolean>;
  territorial: MapaTerritorialData;
  brechaMinima?: number;
  soloVacios?: boolean;
  /** Incrementar para centrar de nuevo el mapa (CDMX). */
  resetNonce: number;
  /** Incrementar para encuadrar las 16 alcaldías de CDMX. */
  cdmxViewNonce?: number;
  /** UUID del espacio a centrar y abrir popup. */
  focusEspacioId?: string | null;
  recursosCualitativos?: RecursoCualitativo[];
  /** ID del recurso cualitativo a centrar y abrir popup. */
  focusRecursoId?: string | null;
  /** Coordenadas de respaldo si el marcador aún no está renderizado. */
  focusRecursoCoords?: { lat: number; lng: number } | null;
  onRecursoSelect?: (recurso: RecursoCualitativo) => void;
  /** Ajusta la vista a los espacios visibles (p. ej. búsqueda por alcaldía). */
  shouldFitBounds?: boolean;
  onEspacioSelect?: (espacio: Espacio) => void;
};

type GroupsBundle = {
  map: L.Map;
  grupos: Record<EspacioTipo, L.LayerGroup>;
  recursosCualitativos: L.LayerGroup;
  overlays: OverlayBundle;
  markersById: Map<string, L.CircleMarker>;
  recursoMarkersById: Map<string, L.CircleMarker>;
};

function buildRecursoPopupHtml(recurso: RecursoCualitativo): string {
  return `
    <div style="min-width:200px;font-family:system-ui,sans-serif;font-size:13px;">
      <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#db2777;">${recurso.tipo}</div>
      <div style="font-weight:600;color:#1f3a5f;margin-top:6px;margin-bottom:4px;">${recurso.titulo}</div>
      <div style="font-size:12px;color:#64748b;">${recurso.alcaldia}</div>
    </div>
  `;
}

function buildPopupHtml(
  e: Espacio,
  tipoColors: MapaPageData["tipoColors"],
) {
  const c = tipoColors[e.tipo];
  const directionsUrl = buildEspacioDirectionsUrl(e);
  const imagen = e.imagenUrl
    ? `<img src="${e.imagenUrl.replace(/"/g, "&quot;")}" alt="" loading="lazy" style="display:block;width:100%;max-height:120px;object-fit:cover;border-radius:8px;margin-bottom:8px;" />`
    : "";
  return `
    <div style="min-width:200px;max-width:240px;font-family:system-ui,sans-serif;font-size:13px;">
      ${imagen}
      <div style="font-weight:600;color:#1f3a5f;margin-bottom:4px;">${e.nombre}</div>
      <div style="font-size:11px;color:#64748b;text-transform:uppercase;">${c.label}</div>
      <div style="margin-top:6px;font-size:12px;color:#334155;">${e.direccion}</div>
      <a href="${directionsUrl.replace(/"/g, "&quot;")}" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:6px;margin-top:10px;font-size:12px;font-weight:600;color:#db2777;text-decoration:none;">
        Cómo llegar →
      </a>
    </div>
  `;
}

function applyOpacity(group: L.LayerGroup, opacity01: number) {
  group.eachLayer((layer) => {
    if (layer instanceof L.CircleMarker) {
      layer.setStyle({
        opacity: opacity01,
        fillOpacity: Math.min(0.95, opacity01 * 0.9),
      });
    }
  });
}

const CDMX_CENTER = CDMX_MAP_CENTER;
const CDMX_ZOOM = CDMX_MAP_ZOOM;

function isMapAlive(map: L.Map): boolean {
  const container = map.getContainer();
  return container != null && container.isConnected;
}

function destroyMap(map: L.Map): void {
  try {
    map.stop();
    map.remove();
  } catch {
    // El contenedor puede haber sido retirado del DOM durante una transición de zoom.
  }
}

function setViewSafe(
  map: L.Map,
  center: L.LatLngExpression,
  zoom?: number,
  options?: L.ZoomPanOptions,
): void {
  if (!isMapAlive(map)) return;
  map.stop();
  map.setView(center, zoom ?? map.getZoom(), options);
}

function fitBoundsSafe(
  map: L.Map,
  bounds: L.LatLngBoundsExpression,
  options?: L.FitBoundsOptions,
): void {
  if (!isMapAlive(map)) return;
  map.stop();
  map.fitBounds(bounds, options);
}

function fitMapToEspacios(map: L.Map, espacios: Espacio[]) {
  if (espacios.length === 0) {
    setViewSafe(map, CDMX_CENTER, CDMX_ZOOM, { animate: true });
    return;
  }

  if (espacios.length === 1) {
    const espacio = espacios[0];
    setViewSafe(map, [espacio.lat, espacio.lng], 14, { animate: true });
    return;
  }

  const bounds = L.latLngBounds(
    espacios.map((espacio) => [espacio.lat, espacio.lng] as [number, number]),
  );
  fitBoundsSafe(map, bounds, { padding: [52, 52], maxZoom: 14, animate: true });
}

function createEmptyGrupos(): Record<EspacioTipo, L.LayerGroup> {
  return Object.fromEntries(
    ESPEACIO_TIPOS.map((tipo) => [tipo, L.layerGroup()]),
  ) as Record<EspacioTipo, L.LayerGroup>;
}

function syncEspacioMarkers(
  bundle: GroupsBundle,
  espacios: Espacio[],
  tipoColors: MapaPageData["tipoColors"],
  onSelect: () => ((espacio: Espacio) => void) | undefined,
): void {
  for (const tipo of ESPEACIO_TIPOS) {
    bundle.grupos[tipo].clearLayers();
  }
  bundle.markersById.clear();

  for (const espacio of espacios) {
    const colors = tipoColors[espacio.tipo];
    const group = bundle.grupos[espacio.tipo];
    const marker = L.circleMarker([espacio.lat, espacio.lng], {
      radius: 8,
      color: colors.stroke,
      fillColor: colors.fill,
      weight: 2,
      opacity: 1,
      fillOpacity: 0.85,
    })
      .bindPopup(buildPopupHtml(espacio, tipoColors))
      .addTo(group);

    marker.on("click", () => {
      onSelect()?.(espacio);
    });

    if (espacio.id) bundle.markersById.set(espacio.id, marker);
  }
}

export const MapCanvas = forwardRef<MapCanvasHandle, MapCanvasProps>(function MapCanvas(
  {
    capaMapa,
    espacios,
    tipoColors,
    capasExtra,
    territorial,
    brechaMinima = 0,
    soloVacios = false,
    resetNonce,
    cdmxViewNonce = 0,
    focusEspacioId,
    recursosCualitativos = [],
    focusRecursoId,
    focusRecursoCoords = null,
    onRecursoSelect,
    shouldFitBounds = false,
    onEspacioSelect,
  },
  ref,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bundleRef = useRef<GroupsBundle | null>(null);
  const onSelectRef = useRef(onEspacioSelect);
  const onRecursoSelectRef = useRef(onRecursoSelect);
  const prevShouldFitBoundsRef = useRef(shouldFitBounds);
  const popupTimeoutRef = useRef<number | null>(null);

  useImperativeHandle(ref, () => ({
    zoomIn: () => {
      const map = bundleRef.current?.map;
      if (map && isMapAlive(map)) map.zoomIn();
    },
    zoomOut: () => {
      const map = bundleRef.current?.map;
      if (map && isMapAlive(map)) map.zoomOut();
    },
  }));

  useEffect(() => {
    onSelectRef.current = onEspacioSelect;
  }, [onEspacioSelect]);

  useEffect(() => {
    onRecursoSelectRef.current = onRecursoSelect;
  }, [onRecursoSelect]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || bundleRef.current) return;

    const map = L.map(el, {
      zoomControl: false,
      scrollWheelZoom: true,
    }).setView(CDMX_CENTER, CDMX_ZOOM);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    const overlays = createEmptyOverlayBundle();
    for (const layer of Object.values(overlays)) {
      layer.addTo(map);
    }

    const markersById = new Map<string, L.CircleMarker>();
    const recursoMarkersById = new Map<string, L.CircleMarker>();
    const recursosCualitativosGroup = L.layerGroup();
    const grupos = createEmptyGrupos();

    for (const group of Object.values(grupos)) {
      group.addTo(map);
    }
    recursosCualitativosGroup.addTo(map);

    bundleRef.current = {
      map,
      grupos,
      recursosCualitativos: recursosCualitativosGroup,
      overlays,
      markersById,
      recursoMarkersById,
    };

    const resize = () => {
      if (!isMapAlive(map)) return;
      map.stop();
      map.invalidateSize();
    };
    resize();
    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => resize())
        : null;
    ro?.observe(el);
    window.addEventListener("resize", resize);

    return () => {
      if (popupTimeoutRef.current != null) {
        window.clearTimeout(popupTimeoutRef.current);
        popupTimeoutRef.current = null;
      }
      ro?.disconnect();
      window.removeEventListener("resize", resize);
      destroyMap(map);
      bundleRef.current = null;
    };
  }, []);

  useEffect(() => {
    const b = bundleRef.current;
    if (!b) return;
    syncEspacioMarkers(b, espacios, tipoColors, () => onSelectRef.current);
  }, [espacios, tipoColors]);

  useEffect(() => {
    const b = bundleRef.current;
    if (!b) return;

    b.recursosCualitativos.clearLayers();
    b.recursoMarkersById.clear();

    for (const recurso of recursosCualitativos) {
      if (
        recurso.lat == null ||
        recurso.lng == null ||
        !Number.isFinite(recurso.lat) ||
        !Number.isFinite(recurso.lng)
      ) {
        continue;
      }

      const marker = L.circleMarker([recurso.lat, recurso.lng], {
        radius: 9,
        color: "#be185d",
        fillColor: "#ec4899",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.9,
      })
        .bindPopup(buildRecursoPopupHtml(recurso))
        .addTo(b.recursosCualitativos);

      marker.on("click", () => {
        onRecursoSelectRef.current?.(recurso);
      });

      b.recursoMarkersById.set(recurso.id, marker);
    }

    b.recursosCualitativos.addTo(b.map);
  }, [recursosCualitativos]);

  useEffect(() => {
    const b = bundleRef.current;
    if (!b) return;

    const { map, grupos } = b;

    for (const tipo of ESPEACIO_TIPOS) {
      const group = grupos[tipo];
      const estado = capaMapa[tipo];
      if (estado.visible) {
        group.addTo(map);
        applyOpacity(group, estado.opacity / 100);
      } else {
        group.remove();
      }
    }
  }, [capaMapa]);

  useEffect(() => {
    const b = bundleRef.current;
    if (!b) return;

    for (const layer of Object.values(b.overlays)) {
      layer.clearLayers();
      layer.remove();
    }

    const nextOverlays = rebuildOverlayLayers(territorial, brechaMinima, soloVacios);
    b.overlays = nextOverlays;
    syncOverlayVisibility(b.map, nextOverlays, capasExtra);
  }, [territorial, brechaMinima, soloVacios, capasExtra]);

  useEffect(() => {
    const b = bundleRef.current;
    if (!b) return;
    syncOverlayVisibility(b.map, b.overlays, capasExtra);
  }, [capasExtra]);

  useEffect(() => {
    const b = bundleRef.current;
    if (!b || resetNonce === 0) return;
    fitMapToCdmxAlcaldias(b.map, territorial.geometrias);
  }, [resetNonce, territorial.geometrias]);

  useEffect(() => {
    const b = bundleRef.current;
    if (!b || cdmxViewNonce === 0) return;
    fitMapToCdmxAlcaldias(b.map, territorial.geometrias);
  }, [cdmxViewNonce, territorial.geometrias]);

  useEffect(() => {
    const b = bundleRef.current;
    if (!b || focusEspacioId || focusRecursoId) return;

    if (shouldFitBounds) {
      fitMapToEspacios(b.map, espacios);
    } else if (prevShouldFitBoundsRef.current && !shouldFitBounds) {
      fitMapToCdmxAlcaldias(b.map, territorial.geometrias);
    }

    prevShouldFitBoundsRef.current = shouldFitBounds;
  }, [espacios, shouldFitBounds, focusEspacioId, focusRecursoId, territorial.geometrias]);

  useEffect(() => {
    const b = bundleRef.current;
    if (!b || !focusEspacioId || focusRecursoId) return;

    const marker = b.markersById.get(focusEspacioId);
    if (marker == null) return;

    const latLng = marker.getLatLng();
    setViewSafe(b.map, latLng, Math.max(b.map.getZoom(), 14), { animate: true });
    if (popupTimeoutRef.current != null) {
      window.clearTimeout(popupTimeoutRef.current);
    }
    popupTimeoutRef.current = window.setTimeout(() => {
      popupTimeoutRef.current = null;
      if (bundleRef.current && isMapAlive(b.map)) marker.openPopup();
    }, 300);
  }, [focusEspacioId, focusRecursoId]);

  useEffect(() => {
    const b = bundleRef.current;
    if (!b || !focusRecursoId) return;

    const marker = b.recursoMarkersById.get(focusRecursoId);
    if (marker != null) {
      const latLng = marker.getLatLng();
      setViewSafe(b.map, latLng, Math.max(b.map.getZoom(), 15), { animate: true });
      if (popupTimeoutRef.current != null) {
        window.clearTimeout(popupTimeoutRef.current);
      }
      popupTimeoutRef.current = window.setTimeout(() => {
        popupTimeoutRef.current = null;
        if (bundleRef.current && isMapAlive(b.map)) marker.openPopup();
      }, 300);
      return;
    }

    if (focusRecursoCoords != null) {
      setViewSafe(
        b.map,
        [focusRecursoCoords.lat, focusRecursoCoords.lng],
        Math.max(b.map.getZoom(), 15),
        { animate: true },
      );
    }
  }, [focusRecursoCoords, focusRecursoId]);

  const activeOverlays = (Object.keys(capasExtra) as MapaCapasExtraId[]).filter(
    (id) => capasExtra[id],
  );

  return (
    <div className="relative h-full min-h-[420px] w-full">
      <div
        ref={containerRef}
        className="h-full min-h-[420px] w-full rounded-xl [&_.leaflet-control-attribution]:text-[10px]"
      />
      {activeOverlays.length > 0 && (
        <div className="pointer-events-none absolute bottom-3 left-3 z-[400] max-w-[220px] rounded-lg border border-geo-border bg-geo-card/95 px-3 py-2 text-[10px] shadow-sm">
          <p className="font-semibold text-geo-navy">Capas activas</p>
          <ul className="mt-1 space-y-0.5 text-geo-muted">
            {activeOverlays.map((id) => (
              <li key={id}>• {OVERLAY_LEGEND[id]}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
});
