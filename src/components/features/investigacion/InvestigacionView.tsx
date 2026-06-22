"use client";

import { useCallback, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Database,
  Download,
  FileJson,
  Filter,
  Loader2,
  MapPin,
  Plus,
  Quote,
  Search,
  X,
} from "lucide-react";
import { Button } from "@/components/shared/Button";
import { useAuth } from "@/contexts/AuthProvider";
import type {
  InvestigacionListQuery,
  InvestigacionPageData,
  RecursoCualitativo,
  TipoRecurso,
} from "@/lib/domain/investigacion";
import { buildMapaUrlForRecurso } from "@/lib/investigacion/assemble-investigacion-page";
import {
  downloadRecursoCsv,
  downloadRecursoInformeFromApi,
  downloadRecursoJson,
} from "@/lib/investigacion/export-investigacion";
import { cn } from "@/lib/utils";

const TODOS_TIPOS = "todos" as const;
const TODAS_ALCALDIAS = "todas" as const;

function TipoBadge({ tipo }: { tipo: TipoRecurso }) {
  const isEntrevista = tipo === "Entrevista";
  return (
    <span
      className={cn(
        "rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
        isEntrevista
          ? "bg-geo-navy text-white"
          : "bg-geo-border text-geo-muted",
      )}
    >
      {tipo}
    </span>
  );
}

type InvestigacionViewProps = {
  data: InvestigacionPageData;
  detalle: RecursoCualitativo | null;
  loadingList: boolean;
  loadingDetail: boolean;
  selectedId: string;
  busqueda: string;
  filtroTipo: InvestigacionListQuery["tipo"];
  filtroAlcaldia: string;
  onBusquedaChange: (value: string) => void;
  onFiltroTipoChange: (tipo: InvestigacionListQuery["tipo"]) => void;
  onFiltroAlcaldiaChange: (alcaldia: string) => void;
  onPageChange: (page: number) => void;
  onSelectRecurso: (id: string) => void;
  onLimpiarFiltros: () => void;
};

export function InvestigacionView({
  data,
  detalle,
  loadingList,
  loadingDetail,
  selectedId,
  busqueda,
  filtroTipo,
  filtroAlcaldia,
  onBusquedaChange,
  onFiltroTipoChange,
  onFiltroAlcaldiaChange,
  onPageChange,
  onSelectRecurso,
  onLimpiarFiltros,
}: InvestigacionViewProps) {
  const {
    investigacionKpis,
    recursosCualitativos,
    alcaldiasOpciones,
    pagination,
    dataSourceNote,
  } = data;

  const [tab, setTab] = useState<"ficha" | "herramientas">("ficha");
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);
  const [exportando, setExportando] = useState(false);
  const { session, ready } = useAuth();
  const puedeGestionarRecursos = ready && session?.rol === "autoridad";

  const handleGenerarReporte = useCallback(async () => {
    if (!detalle) return;
    setExportando(true);
    try {
      await downloadRecursoInformeFromApi(detalle.id);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudo generar el informe";
      window.alert(message);
    } finally {
      setExportando(false);
    }
  }, [detalle]);

  const mapaHref = detalle ? buildMapaUrlForRecurso(detalle) : "/mapa";
  const detalleSinCoords =
    detalle != null &&
    (detalle.lat == null ||
      detalle.lng == null ||
      !Number.isFinite(detalle.lat) ||
      !Number.isFinite(detalle.lng));

  if (pagination.totalCatalogo === 0) {
    return (
      <div className="min-h-[calc(100dvh-6rem)] bg-geo-surface pb-12">
        <div className="border-b border-geo-border bg-geo-surface">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold text-geo-navy sm:text-3xl">
              Investigación y Repositorio
            </h1>
            <p className="mt-3 text-sm text-geo-muted">{dataSourceNote}</p>
          </div>
        </div>
        <div className="mx-auto max-w-lg px-4 py-16 text-center">
          <p className="text-sm font-medium text-geo-navy">
            No hay recursos cualitativos publicados
          </p>
          <p className="mt-2 text-sm text-geo-muted">
            {puedeGestionarRecursos
              ? "Crea recursos activos desde el panel de administración para publicarlos aquí."
              : "Aún no hay recursos publicados en el repositorio."}
          </p>
          {puedeGestionarRecursos && (
            <Button href="/admin?seccion=investigacion" className="mt-6">
              Ir al panel de administración
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100dvh-6rem)] bg-geo-surface pb-12">
      <div className="border-b border-geo-border bg-geo-surface">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2">
                <Database
                  className="h-4 w-4 text-geo-navy"
                  strokeWidth={2}
                  aria-hidden
                />
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-geo-navy">
                  Centro de Datos Cualitativos
                </span>
              </div>
              <h1 className="mt-3 text-2xl font-bold text-geo-navy sm:text-3xl lg:text-4xl">
                Investigación y Repositorio
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-geo-muted sm:text-base">
                Consulte entrevistas, encuestas y grupos focales geolocalizados
                para profundizar en la realidad cultural de la Ciudad de México.
              </p>
              <p className="mt-2 text-xs text-geo-muted">{dataSourceNote}</p>
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-0 sm:gap-0">
              {investigacionKpis.map((k, i) => (
                <div
                  key={k.label}
                  className={cn(
                    "flex flex-col items-center px-6 py-1 text-center sm:px-8",
                    i > 0 && "border-l border-geo-border",
                  )}
                >
                  <p
                    className={cn(
                      "text-3xl font-bold tracking-tight sm:text-4xl",
                      k.accent === "pink" ? "text-geo-pink" : "text-geo-navy",
                    )}
                  >
                    {k.value}
                  </p>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-geo-muted">
                    {k.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[minmax(0,340px)_1fr] lg:px-8">
        <div className="flex flex-col rounded-xl border border-geo-border bg-geo-card p-4 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-geo-muted" />
              <input
                type="search"
                value={busqueda}
                onChange={(e) => onBusquedaChange(e.target.value)}
                placeholder="Buscar recurso…"
                className="w-full rounded-lg border border-geo-border py-2 pl-8 pr-3 text-sm outline-none focus:border-geo-pink focus:ring-2 focus:ring-geo-pink/20"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0 gap-1"
              onClick={() => setFiltrosAbiertos((v) => !v)}
            >
              <Filter className="h-4 w-4" />
              Filtrar
            </Button>
            {puedeGestionarRecursos && (
              <Button
                href="/admin?seccion=investigacion"
                variant="primary"
                size="sm"
                className="shrink-0 gap-1"
              >
                <Plus className="h-4 w-4" />
                Nuevo recurso
              </Button>
            )}
          </div>

          {filtrosAbiertos && (
            <div className="mt-3 grid gap-2 rounded-lg border border-geo-border bg-geo-surface/60 p-3 sm:grid-cols-2">
              <label className="text-xs font-medium text-geo-navy">
                Tipo
                <select
                  value={filtroTipo}
                  onChange={(e) =>
                    onFiltroTipoChange(
                      e.target.value as InvestigacionListQuery["tipo"],
                    )
                  }
                  className="mt-1 w-full rounded-md border border-geo-border bg-geo-input px-2 py-1.5 text-sm text-geo-navy"
                >
                  <option value={TODOS_TIPOS}>Todos</option>
                  <option value="Entrevista">Entrevista</option>
                  <option value="Encuesta">Encuesta</option>
                  <option value="Grupo focal">Grupo focal</option>
                </select>
              </label>
              <label className="text-xs font-medium text-geo-navy">
                Alcaldía
                <select
                  value={filtroAlcaldia}
                  onChange={(e) => onFiltroAlcaldiaChange(e.target.value)}
                  className="mt-1 w-full rounded-md border border-geo-border bg-geo-input px-2 py-1.5 text-sm text-geo-navy"
                >
                  <option value={TODAS_ALCALDIAS}>Todas</option>
                  {alcaldiasOpciones.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </label>
              {(filtroTipo !== TODOS_TIPOS ||
                filtroAlcaldia !== TODAS_ALCALDIAS ||
                busqueda.trim()) && (
                <button
                  type="button"
                  onClick={onLimpiarFiltros}
                  className="flex items-center gap-1 text-xs text-geo-pink hover:underline sm:col-span-2"
                >
                  <X className="h-3 w-3" />
                  Limpiar filtros
                </button>
              )}
            </div>
          )}

          <div className="relative mt-4">
            {loadingList && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-background/70 backdrop-blur-[1px]">
                <Loader2 className="h-5 w-5 animate-spin text-geo-pink" />
              </div>
            )}
            <ul className="max-h-[520px] space-y-2 overflow-y-auto pr-1">
              {recursosCualitativos.length === 0 ? (
                <li className="rounded-lg border border-dashed border-geo-border p-6 text-center text-sm text-geo-muted">
                  No hay recursos que coincidan con la búsqueda.
                </li>
              ) : (
                recursosCualitativos.map((r) => (
                  <li key={r.id}>
                    <button
                      type="button"
                      onClick={() => onSelectRecurso(r.id)}
                      className={cn(
                        "w-full rounded-lg border p-3 text-left transition",
                        selectedId === r.id
                          ? "border-geo-pink bg-geo-pink/5 ring-1 ring-geo-pink/30"
                          : "border-transparent hover:border-geo-border hover:bg-geo-surface/80",
                      )}
                    >
                      <TipoBadge tipo={r.tipo} />
                      <p className="mt-2 text-[11px] text-geo-muted">{r.fecha}</p>
                      <p className="mt-1 font-medium leading-snug text-geo-navy">
                        {r.titulo}
                      </p>
                      <p className="mt-1 flex items-center gap-1 text-xs text-geo-muted">
                        <MapPin className="h-3 w-3 shrink-0" />
                        {r.alcaldia}
                      </p>
                      <p className="mt-2 line-clamp-2 text-xs text-geo-muted">
                        {r.snippet}
                      </p>
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>

          <div className="mt-3 space-y-2">
            <p className="text-center text-xs text-geo-muted">
              Mostrando {recursosCualitativos.length} de {pagination.total} resultados
              {pagination.total !== pagination.totalCatalogo &&
                ` (${pagination.totalCatalogo} en catálogo)`}
            </p>
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={loadingList || pagination.page <= 1}
                  onClick={() => onPageChange(pagination.page - 1)}
                  className="gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
                <span className="text-xs text-geo-muted">
                  Página {pagination.page} de {pagination.totalPages}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={loadingList || pagination.page >= pagination.totalPages}
                  onClick={() => onPageChange(pagination.page + 1)}
                  className="gap-1"
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-geo-border bg-geo-card shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-geo-border px-4 py-3 sm:px-5">
            <div className="flex gap-1 rounded-lg bg-geo-surface p-1">
              {(
                [
                  ["ficha", "Ficha del recurso"],
                  ["herramientas", "Herramientas analíticas"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm font-medium transition",
                    tab === id
                      ? "bg-background text-geo-navy shadow-sm ring-1 ring-geo-border"
                      : "text-geo-muted hover:text-geo-navy",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!detalle || exportando || loadingDetail}
                onClick={() => void handleGenerarReporte()}
              >
                {exportando ? "Generando…" : "Generar reporte"}
              </Button>
              <Button
                href={mapaHref}
                size="sm"
                disabled={!detalle || loadingDetail}
              >
                Ver en mapa
              </Button>
              {detalleSinCoords && (
                <p className="w-full text-xs text-geo-muted">
                  Sin coordenadas: el mapa abrirá búsqueda por alcaldía.
                </p>
              )}
            </div>
          </div>

          {loadingDetail ? (
            <div className="flex min-h-[320px] items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-geo-pink" />
            </div>
          ) : !detalle ? (
            <div className="p-8 text-center text-sm text-geo-muted">
              Seleccione un recurso de la lista.
            </div>
          ) : tab === "ficha" ? (
            <div className="p-4 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-geo-navy">
                    {detalle.titulo}
                  </h2>
                  {detalle.verificado && (
                    <span className="mt-2 inline-block rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
                      Verificado
                    </span>
                  )}
                  {!detalle.digitalizado && (
                    <span className="mt-2 ml-2 inline-block rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-900">
                      Pendiente de digitalización
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-right text-sm">
                  <div>
                    <p className="font-medium text-geo-navy">{detalle.investigador}</p>
                    <p className="text-xs text-geo-muted">{detalle.fechaDetalle}</p>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-geo-navy text-sm font-bold text-white">
                    {detalle.investigador
                      .split(" ")
                      .map((w) => w[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                </div>
              </div>

              <div className="mt-8 rounded-xl border border-geo-border bg-geo-surface/50 p-4">
                <div className="flex items-center gap-2 text-geo-pink">
                  <Quote className="h-5 w-5" />
                  <h3 className="text-sm font-semibold text-geo-navy">
                    Resumen ejecutivo
                  </h3>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-geo-muted">
                  {detalle.resumen}
                </p>
              </div>

              <div className="mt-8">
                <h3 className="text-sm font-semibold text-geo-navy">
                  Transcripción destacada
                </h3>
                <div className="mt-4 space-y-4">
                  {detalle.transcripcion.map((bloque, i) => (
                    <div
                      key={i}
                      className={cn(
                        "rounded-lg border p-4",
                        bloque.rol === "Investigador"
                          ? "border-sky-200 bg-sky-50/80"
                          : "border-geo-border bg-geo-card",
                      )}
                    >
                      <p className="text-[10px] font-bold uppercase tracking-wider text-geo-pink">
                        {bloque.rol}
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-geo-navy">
                        {bloque.texto}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 sm:p-8">
              <p className="text-sm text-geo-muted">
                Exporte metadatos y transcripción del recurso seleccionado para
                análisis externo (Atlas.ti, NVivo, Excel).
              </p>
              <p className="mt-2 text-xs font-medium text-geo-navy">
                {detalle.titulo}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => void handleGenerarReporte()}
                  disabled={exportando}
                >
                  <Download className="h-4 w-4" />
                  Informe PDF
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => downloadRecursoJson(detalle)}
                >
                  <FileJson className="h-4 w-4" />
                  JSON completo
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => downloadRecursoCsv(detalle)}
                >
                  <Download className="h-4 w-4" />
                  CSV transcripción
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
