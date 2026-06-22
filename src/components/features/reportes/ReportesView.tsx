import Link from "next/link";
import {
  AlertTriangle,
  Clock,
  Database,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  Info,
  Loader2,
  SlidersHorizontal,
  type LucideIcon,
} from "lucide-react";
import { HistorialExportMenu } from "@/components/features/reportes/HistorialExportMenu";
import { Button } from "@/components/shared/Button";
import type { EstadoReporte, ReporteFormato } from "@/lib/domain/reportes";
import type { ReportesPageData } from "@/lib/services/reportes.service";
import type { ReportesControllerState } from "@/hooks/use-reportes-controller";
import { cn } from "@/lib/utils";

const reporteKpiIcons = {
  fileText: FileText,
  download: Download,
  database: Database,
  clock: Clock,
} satisfies Record<string, LucideIcon>;

function BadgeEstadoReporte({ estado }: { estado: EstadoReporte }) {
  const styles: Record<EstadoReporte, string> = {
    Publicado: "bg-emerald-100 text-emerald-800",
    Generado: "bg-sky-100 text-sky-800",
    Borrador: "bg-amber-100 text-amber-900",
  };
  return (
    <span
      className={cn(
        "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium",
        styles[estado],
      )}
    >
      {estado}
    </span>
  );
}

function FilterSelect({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="min-w-0">
      <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-geo-muted">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-geo-border bg-geo-input px-3 py-2 text-sm text-geo-navy outline-none focus:border-geo-pink focus:ring-2 focus:ring-geo-pink/20"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

const FORMATO_LABELS: Record<ReporteFormato, string> = {
  PDF: "PDF",
  CSV: "CSV",
  XLSX: "Excel",
};

type ReportesViewProps = {
  data: ReportesPageData;
} & ReportesControllerState;

export function ReportesView({
  data,
  plantillaId,
  plantilla,
  selectPlantilla,
  filters,
  setAlcaldia,
  setDisciplina,
  setPeriodo,
  setNse,
  setEdad,
  setGenero,
  generatingFormat,
  statusMessage,
  filterPreview,
  historialReportes,
  generarReporte,
  descargarHistorial,
  eliminarHistorial,
  eliminandoHistorialId,
}: ReportesViewProps) {
  const {
    plantillasReporte,
    reportesKpis,
    reportesAyuda,
    dataSource,
    dataSourceNote,
    filtroOpciones,
    anioCorte,
    canGenerateRemote,
  } = data;

  const esSupabase = dataSource === "supabase";

  return (
    <div className="min-h-[calc(100dvh-6rem)] bg-geo-surface pb-12">
      <div className="border-b border-geo-border bg-geo-card">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:flex-row sm:items-end sm:justify-between sm:px-6 lg:px-8">
          <div>
            <h1 className="text-2xl font-bold text-geo-navy sm:text-3xl">
              Centro de reportes
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-geo-muted">
              Genera documentos técnicos con filtros propios y consulta tu
              historial de exportaciones.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
                  esSupabase
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-900",
                )}
              >
                {esSupabase ? "Generador web activo" : "Modo demo"}
              </span>
              {dataSourceNote && (
                <p className="text-xs text-geo-muted">{dataSourceNote}</p>
              )}
            </div>
          </div>
          <Button href="/dashboard" variant="outline" className="shrink-0 gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            Explorar métricas
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {reportesKpis.map((k) => {
            const Icon = reporteKpiIcons[k.icon];
            const isNavy = k.accent === "navy";
            return (
              <div
                key={k.label}
                className="rounded-xl border border-geo-border bg-geo-card p-5 shadow-sm"
              >
                <div
                  className={cn(
                    "mb-3 flex h-10 w-10 items-center justify-center rounded-lg",
                    isNavy
                      ? "bg-geo-navy/10 text-geo-navy"
                      : "bg-geo-pink/10 text-geo-pink",
                  )}
                >
                  <Icon className="h-5 w-5" strokeWidth={2} aria-hidden />
                </div>
                <p className="text-sm text-geo-muted">{k.label}</p>
                <p className="mt-1 text-2xl font-bold text-geo-navy">{k.value}</p>
                <p
                  className={cn(
                    "mt-2 text-xs font-medium",
                    k.positive ? "text-emerald-600" : "text-geo-muted",
                  )}
                >
                  {k.delta}
                </p>
              </div>
            );
          })}
        </div>

        {/* Generador */}
        <section className="mt-10 rounded-xl border border-geo-border bg-geo-card p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="text-lg font-bold text-geo-navy">Generar reporte</h2>
              <p className="mt-1 text-sm text-geo-muted">
                Plantilla:{" "}
                <span className="font-semibold text-geo-navy">{plantilla.titulo}</span>{" "}
                · corte {anioCorte}
              </p>
              <p className="mt-1 text-xs text-geo-muted">
                Incluye dashboard y cuestionario SECTEI del periodo semestral (captura móvil), si hay datos.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {plantilla.formatos.map((formato) => {
                const isGenerating = generatingFormat === formato;
                const isBusy = generatingFormat != null;
                return (
                <Button
                  key={formato}
                  type="button"
                  variant={formato === "PDF" ? "primary" : "outline"}
                  size="sm"
                  disabled={isBusy}
                  onClick={() => void generarReporte(formato)}
                  className="gap-1.5"
                >
                  {isGenerating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : formato === "XLSX" ? (
                    <FileSpreadsheet className="h-4 w-4" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  {FORMATO_LABELS[formato]}
                </Button>
                );
              })}
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <FilterSelect
              label="Alcaldía"
              options={filtroOpciones.alcaldia}
              value={filters.alcaldia}
              onChange={setAlcaldia}
            />
            <FilterSelect
              label="Disciplina"
              options={filtroOpciones.disciplina}
              value={filters.disciplina}
              onChange={setDisciplina}
            />
            <FilterSelect
              label="Periodo"
              options={filtroOpciones.periodo}
              value={filters.periodo}
              onChange={setPeriodo}
            />
            <FilterSelect
              label="NSE"
              options={filtroOpciones.nivelSocioeconomico}
              value={filters.nse}
              onChange={setNse}
            />
            <FilterSelect
              label="Edad"
              options={filtroOpciones.rangoEdad}
              value={filters.edad}
              onChange={setEdad}
            />
            <FilterSelect
              label="Género"
              options={filtroOpciones.genero}
              value={filters.genero}
              onChange={setGenero}
            />
          </div>

          <div className="mt-4 rounded-lg border border-geo-border bg-geo-surface/60 px-4 py-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-geo-muted">
                  Vista previa de filtros
                </p>
                {filterPreview.loading ? (
                  <p className="mt-1 flex items-center gap-2 text-sm text-geo-muted">
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    Calculando vista previa…
                  </p>
                ) : filterPreview.filterSummary ? (
                  <p className="mt-1 text-sm text-geo-navy">{filterPreview.filterSummary}</p>
                ) : (
                  <p className="mt-1 text-sm text-geo-muted">
                    Ajusta los filtros para ver el resumen del informe.
                  </p>
                )}
                {!filterPreview.loading && filterPreview.totalEspacios > 0 && (
                  <p className="mt-1 text-xs text-geo-muted">
                    {filterPreview.totalEspacios.toLocaleString("es-MX")} espacios en el
                    padrón filtrado · corte {filterPreview.anioCorte}
                  </p>
                )}
              </div>
            </div>
            {!filterPreview.loading && filterPreview.filterNotice && (
              <div
                className="mt-3 flex gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950"
                role="status"
              >
                <AlertTriangle
                  className="mt-0.5 h-4 w-4 shrink-0 text-amber-700"
                  aria-hidden
                />
                <p>{filterPreview.filterNotice}</p>
              </div>
            )}
          </div>

          {statusMessage && (
            <p
              className={cn(
                "mt-4 rounded-lg border px-4 py-2 text-sm",
                statusMessage.startsWith("Error:")
                  ? "border-red-200 bg-red-50 text-red-900"
                  : "border-sky-200 bg-sky-50 text-sky-900",
              )}
            >
              {statusMessage}
            </p>
          )}
        </section>

        <div className="mt-10 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="mb-5 flex flex-col gap-3 border-b border-geo-border pb-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-bold text-geo-navy">
                Historial Reciente
              </h2>
              <div className="flex flex-wrap items-center gap-3 text-sm sm:gap-4">
                <Link
                  href="/perfil"
                  className="font-medium text-geo-muted transition-colors hover:text-geo-pink"
                >
                  Ver en perfil
                </Link>
                <span className="inline-flex items-center gap-1.5 font-medium text-geo-muted">
                  <Filter className="h-4 w-4" strokeWidth={2} />
                  {historialReportes.length} registros
                </span>
              </div>
            </div>

            {historialReportes.length === 0 ? (
              <p className="rounded-xl border border-dashed border-geo-border bg-geo-card p-10 text-center text-sm text-geo-muted">
                Aún no hay exportaciones. Usa el generador de arriba para crear tu
                primer informe PDF o Excel.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                {historialReportes.map((r) => (
                  <article
                    key={r.id}
                    className="flex min-w-0 flex-col rounded-xl border border-geo-border bg-geo-card p-4 shadow-sm"
                  >
                    <div className="flex gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-geo-surface text-geo-muted sm:h-11 sm:w-11">
                        <FileText className="h-5 w-5" strokeWidth={1.75} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3
                          className="line-clamp-2 font-semibold leading-snug text-geo-navy"
                          title={r.nombreArchivo ?? r.titulo}
                        >
                          {r.titulo}
                        </h3>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <BadgeEstadoReporte estado={r.estado} />
                          {r.formato !== "—" && (
                            <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-700">
                              {r.formato}
                            </span>
                          )}
                        </div>
                        <p className="mt-2 text-xs text-geo-muted">
                          {r.categoria} · {r.fecha}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-col gap-2 border-t border-geo-border/60 pt-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className="min-w-0 truncate text-[10px] font-semibold uppercase tracking-wider text-geo-muted">
                        Autor: {r.autor}
                      </p>
                      <div className="flex shrink-0 items-center justify-end gap-1">
                        {r.mobileOnly && !r.canDownload && (
                          <span
                            className="mr-1 max-w-[9rem] text-right text-[10px] leading-tight text-geo-muted"
                            title={r.downloadUnavailableReason}
                          >
                            Solo app móvil
                          </span>
                        )}
                        <button
                          type="button"
                          disabled={!r.canDownload}
                          title={
                            r.canDownload
                              ? `Descargar ${r.nombreArchivo ?? r.titulo}`
                              : r.downloadUnavailableReason ??
                                (r.mobileOnly
                                  ? "Archivo solo en la app móvil"
                                  : "Sin archivo descargable")
                          }
                          onClick={() => void descargarHistorial(r)}
                          className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg text-geo-muted transition-colors hover:bg-geo-surface hover:text-geo-navy disabled:cursor-not-allowed disabled:opacity-40"
                          aria-label={`Descargar ${r.titulo}`}
                        >
                          <Download className="h-4 w-4" strokeWidth={2} />
                        </button>
                        <HistorialExportMenu
                          titulo={r.nombreArchivo ?? r.titulo}
                          canDownload={r.canDownload}
                          downloadUrl={r.downloadUrl}
                          mobileOnly={r.mobileOnly}
                          downloadUnavailableReason={r.downloadUnavailableReason}
                          canDelete={canGenerateRemote || r.id.startsWith("local-")}
                          deleting={eliminandoHistorialId === r.id}
                          onDownload={() => descargarHistorial(r)}
                          onDelete={() => eliminarHistorial(r)}
                        />
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          <aside className="space-y-6">
            <div className="rounded-xl border border-geo-border bg-geo-card p-5 shadow-sm">
              <h2 className="font-bold text-geo-navy">Plantillas</h2>
              <p className="mt-1 text-xs text-geo-muted">
                Incluye datos del dashboard y, si hay capturas en el periodo semestral,
                el cuestionario SECTEI desde la app móvil (hojas Cuestionario en Excel).
              </p>
              <ul className="mt-4 space-y-2">
                {plantillasReporte.map((p) => {
                  const active = p.id === plantillaId;
                  return (
                    <li key={p.id}>
                      <button
                        type="button"
                        onClick={() => selectPlantilla(p.id)}
                        className={cn(
                          "flex w-full gap-3 rounded-lg border p-3 text-left transition-colors",
                          active
                            ? "border-geo-pink bg-geo-pink/5"
                            : "border-transparent hover:border-geo-border hover:bg-geo-surface/80",
                        )}
                      >
                        <div
                          className={cn(
                            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                            active
                              ? "bg-geo-pink/15 text-geo-pink"
                              : "bg-geo-surface text-geo-muted",
                          )}
                        >
                          <FileText className="h-5 w-5" strokeWidth={1.75} />
                        </div>
                        <div className="min-w-0">
                          <span className="font-semibold text-geo-navy">
                            {p.titulo}
                          </span>
                          <p className="mt-0.5 text-xs text-geo-muted">{p.desc}</p>
                          <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-geo-muted">
                            {p.formatos.join(" · ")}
                          </p>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="rounded-xl border border-geo-border bg-geo-card p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-geo-pink text-white">
                  <Info className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
                </span>
                <h2 className="font-bold text-geo-pink">Ayuda</h2>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-geo-muted">
                {reportesAyuda.texto}
              </p>
              <Link
                href={reportesAyuda.enlaceHref}
                className="mt-3 inline-block text-sm font-semibold text-geo-pink hover:underline"
              >
                {reportesAyuda.enlaceApi}
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
