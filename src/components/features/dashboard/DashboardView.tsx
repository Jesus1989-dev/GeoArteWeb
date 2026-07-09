"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ClientChart } from "@/components/shared/ClientChart";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeftRight,
  ArrowUpDown,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Info,
  LineChart as LineChartIcon,
  Loader2,
  ClipboardList,
  SlidersHorizontal,
} from "lucide-react";
import { DashboardKpiCard } from "@/components/features/dashboard/DashboardKpiCard";
import {
  MetricasNegocioCard,
  MovilidadModoChartPanel,
  ParticipacionGeneroAgregadoPanel,
  ParticipacionNseChartPanel,
  TendenciaInventarioPanel,
  type ParticipacionGeneroModo,
} from "@/components/features/dashboard/DashboardParidadCharts";
import { Button } from "@/components/shared/Button";
import { MobileDataCard, MobileDataRow } from "@/components/shared/MobileDataCard";
import { ResponsiveTable } from "@/components/shared/ResponsiveTable";
import type { EstadoEspacio } from "@/lib/domain/admin";
import type {
  ParticipacionGeneroRow,
  DistribucionTipologiaRow,
  TendenciaAsistenciaRow,
} from "@/lib/domain/dashboard";
import type { DashboardControllerState } from "@/hooks/use-dashboard-controller";
import { useChartTheme } from "@/hooks/use-chart-theme";
import { useMediaQuery } from "@/hooks/use-media-query";
import { abbreviateTipologia } from "@/lib/utils/chart-scale";
import { cn } from "@/lib/utils";

type DashboardViewProps = DashboardControllerState;

const PARTICIPACION_CHART_HEIGHT = 320;
const PARTICIPACION_CHART_HEIGHT_MOBILE = 288;
const TENDENCIA_CHART_HEIGHT = 260;
const TENDENCIA_CHART_HEIGHT_MOBILE = 240;

const chartTooltipProps = {
  cursor: { fill: "rgba(31, 58, 95, 0.06)" },
  wrapperStyle: { zIndex: 30, pointerEvents: "none" as const },
};

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

function EstadoTabla({ estado }: { estado: EstadoEspacio }) {
  const styles: Record<EstadoEspacio, string> = {
    Publicado: "bg-emerald-100 text-emerald-800",
    Revisión: "bg-amber-100 text-amber-800",
    Borrador: "bg-slate-100 text-slate-700",
  };
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
        styles[estado],
      )}
    >
      {estado}
    </span>
  );
}

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-geo-border bg-geo-card p-4 shadow-sm sm:p-5">
      <h3 className="font-semibold text-geo-navy">{title}</h3>
      {subtitle && (
        <p className="mt-1 text-xs text-geo-muted">{subtitle}</p>
      )}
      <ClientChart height={260} className="mt-4">
        {children}
      </ClientChart>
    </div>
  );
}

function TendenciaExistenciaChart({
  data,
  leyendaPrincipal,
  leyendaSecundaria,
  containerWidth,
}: {
  data: TendenciaAsistenciaRow[];
  leyendaPrincipal: string;
  leyendaSecundaria: string | null;
  containerWidth: number;
}) {
  const chart = useChartTheme();
  const isMobile = useMediaQuery("(max-width: 639px)");
  const scrollRef = useRef<HTMLDivElement>(null);
  const chartHeight = isMobile ? TENDENCIA_CHART_HEIGHT_MOBILE : TENDENCIA_CHART_HEIGHT;
  const yearWidth = isMobile ? 34 : 42;
  const scrollWidth = Math.max(data.length * yearWidth, 280);
  const scrollable = containerWidth > 0 && scrollWidth > containerWidth;

  const maxValue = useMemo(
    () => Math.max(...data.flatMap((row) => [row.visitas, row.eventos]), 1),
    [data],
  );
  const yAxisMax = Math.ceil(maxValue / 85) * 85;
  const yAxisTicks = [0, 0.25, 0.5, 0.75, 1].map((fraction) =>
    Math.round(yAxisMax * fraction),
  );

  useEffect(() => {
    if (!scrollable || scrollRef.current == null) return;
    const node = scrollRef.current;
    const scrollToEnd = () => {
      node.scrollLeft = Math.max(0, node.scrollWidth - node.clientWidth);
    };
    scrollToEnd();
    requestAnimationFrame(scrollToEnd);
  }, [scrollable, data.length, containerWidth]);

  const lineChartProps = {
    data,
    margin: isMobile
      ? { top: 8, right: 8, left: 0, bottom: 4 }
      : { top: 8, right: 12, left: 4, bottom: 4 },
  };

  const lineChartBody = (
    <>
      <CartesianGrid strokeDasharray="3 3" stroke={chart.gridStroke} />
      <XAxis
        dataKey="mes"
        tick={{ fontSize: isMobile ? 9 : 10, fill: chart.tickFill }}
        interval={isMobile ? "preserveStartEnd" : 0}
        minTickGap={isMobile ? 8 : 4}
      />
      <YAxis
        tick={{ fontSize: 10, fill: chart.tickFill }}
        domain={[0, yAxisMax]}
        ticks={yAxisTicks}
        width={isMobile ? 36 : 40}
      />
      <Tooltip
        {...chartTooltipProps}
        contentStyle={chart.tooltipStyle}
      />
      <Legend
        wrapperStyle={{
          fontSize: isMobile ? "11px" : "12px",
          color: chart.tickFill,
          paddingTop: "4px",
        }}
      />
      <Line
        type="monotone"
        dataKey="visitas"
        name={leyendaPrincipal}
        stroke={chart.seriesPrimary}
        strokeWidth={isMobile ? 2.5 : 2}
        dot={{ r: isMobile ? 2 : 3 }}
        activeDot={{ r: isMobile ? 4 : 5 }}
        isAnimationActive={!isMobile}
      />
      {leyendaSecundaria != null && (
        <Line
          type="monotone"
          dataKey="eventos"
          name={leyendaSecundaria}
          stroke={chart.seriesSecondary}
          strokeWidth={isMobile ? 2.5 : 2}
          dot={{ r: isMobile ? 2 : 3 }}
          activeDot={{ r: isMobile ? 4 : 5 }}
          isAnimationActive={!isMobile}
        />
      )}
    </>
  );

  if (containerWidth <= 0) return null;

  if (!scrollable) {
    return (
      <ResponsiveContainer width="100%" height={chartHeight} minWidth={containerWidth}>
        <LineChart {...lineChartProps}>{lineChartBody}</LineChart>
      </ResponsiveContainer>
    );
  }

  return (
    <div
      ref={scrollRef}
      className="overflow-x-auto overscroll-x-contain pb-2 [-webkit-overflow-scrolling:touch]"
      tabIndex={0}
      role="region"
      aria-label="Gráfico de existencia anual del padrón, desplázate horizontalmente"
    >
      <div style={{ width: scrollWidth, minWidth: "100%" }}>
        <LineChart
          width={Math.max(containerWidth, scrollWidth)}
          height={chartHeight}
          {...lineChartProps}
        >
          {lineChartBody}
        </LineChart>
      </div>
    </div>
  );
}

function ParticipacionGeneroChart({
  data,
  maxY,
  containerWidth,
}: {
  data: ParticipacionGeneroRow[];
  maxY: number;
  containerWidth: number;
}) {
  const chart = useChartTheme();
  const isMobile = useMediaQuery("(max-width: 639px)");
  const chartHeight = isMobile ? PARTICIPACION_CHART_HEIGHT_MOBILE : PARTICIPACION_CHART_HEIGHT;
  const categoryWidth = isMobile ? 68 : 92;
  const scrollWidth = Math.max(data.length * categoryWidth, 280);
  const scrollable = containerWidth > 0 && scrollWidth > containerWidth;

  const barChartProps = {
    data,
    margin: isMobile
      ? { top: 8, right: 8, left: 0, bottom: 0 }
      : { top: 8, right: 12, left: 4, bottom: 4 },
    barCategoryGap: isMobile ? "18%" : "16%",
    barGap: 2,
  };

  const barChartBody = (
    <>
      <CartesianGrid strokeDasharray="3 3" stroke={chart.gridStroke} />
      <XAxis
        dataKey="disciplina"
        tick={{ fontSize: isMobile ? 8 : 9, fill: chart.tickFill }}
        interval={0}
        angle={isMobile ? -40 : -28}
        textAnchor="end"
        height={isMobile ? 72 : 96}
        tickFormatter={(value) =>
          isMobile ? abbreviateTipologia(String(value), 10) : String(value)
        }
      />
      <YAxis
        tick={{ fontSize: 10, fill: chart.tickFill }}
        domain={[0, maxY]}
        width={isMobile ? 32 : 36}
      />
      <Tooltip
        {...chartTooltipProps}
        contentStyle={chart.tooltipStyle}
        labelFormatter={(label) => String(label)}
      />
      <Legend
        wrapperStyle={{
          fontSize: isMobile ? "11px" : "12px",
          color: chart.tickFill,
          paddingTop: "4px",
        }}
      />
      <Bar
        dataKey="hombres"
        name="Masculino"
        fill={chart.seriesPrimary}
        radius={[4, 4, 0, 0]}
        maxBarSize={isMobile ? 12 : 18}
      />
      <Bar
        dataKey="mujeres"
        name="Femenino"
        fill={chart.seriesSecondary}
        radius={[4, 4, 0, 0]}
        maxBarSize={isMobile ? 12 : 18}
      />
      <Bar
        dataKey="otros"
        name="Otros"
        fill={chart.seriesMuted}
        radius={[4, 4, 0, 0]}
        maxBarSize={isMobile ? 12 : 18}
      />
    </>
  );

  if (containerWidth <= 0) return null;

  if (!scrollable) {
    return (
      <ResponsiveContainer width="100%" height={chartHeight} minWidth={containerWidth}>
        <BarChart {...barChartProps}>{barChartBody}</BarChart>
      </ResponsiveContainer>
    );
  }

  return (
    <div
      className="chart-h-scroll w-full"
      tabIndex={0}
      role="region"
      aria-label="Gráfico de participación por género — desplazamiento horizontal"
    >
      <div style={{ width: scrollWidth, minWidth: "100%" }}>
        <BarChart
          width={Math.max(containerWidth, scrollWidth)}
          height={chartHeight}
          {...barChartProps}
        >
          {barChartBody}
        </BarChart>
      </div>
    </div>
  );
}

function DistribucionTipologiaChart({ data }: { data: DistribucionTipologiaRow[] }) {
  const chart = useChartTheme();
  return (
    <div className="flex flex-col gap-3">
      <ResponsiveContainer width="100%" height={210} minWidth={0}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={52}
            outerRadius={78}
            paddingAngle={1}
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, _name, item) => [
              typeof value === "number"
                ? value.toLocaleString("es-MX")
                : String(value ?? ""),
              String(item.payload?.name ?? ""),
            ]}
            contentStyle={chart.tooltipStyle}
          />
        </PieChart>
      </ResponsiveContainer>
      <div
        className="max-h-28 overflow-y-auto overscroll-y-contain pr-1 [-webkit-overflow-scrolling:touch]"
        role="list"
        aria-label="Leyenda de tipologías"
      >
        <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
          {data.map((entry) => (
            <li key={entry.name} className="flex min-w-0 items-center gap-2 text-[10px] text-geo-muted">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: entry.color }}
                aria-hidden
              />
              <span className="min-w-0 flex-1 truncate" title={entry.name}>
                {entry.name}
              </span>
              <span className="shrink-0 tabular-nums text-geo-navy">
                {entry.value.toLocaleString("es-MX")}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function DashboardView({
  dashboardData,
  alcaldia,
  setAlcaldia,
  disciplina,
  setDisciplina,
  periodo,
  setPeriodo,
  nse,
  setNse,
  edad,
  setEdad,
  genero,
  setGenero,
  borA,
  setBorA,
  borB,
  setBorB,
  exportHint,
  exporting,
  exportDashboard,
  swapAlcaldias,
  comparadorMetricas,
  hallazgoTerritorial,
  filtered,
  densidadLoading,
  periodoLoading,
  espaciosLoading,
  filterSummary,
  filterNotice,
  tendenciaModo,
  setTendenciaModo,
  participacionGeneroModo,
  setParticipacionGeneroModo,
  espaciosTabla,
  espaciosTablaTotal,
  tablaPage,
  setTablaPage,
  tablaTotalPaginas,
}: DashboardViewProps) {
  const chart = useChartTheme();
  const {
    filtroOpciones,
    alcaldiasComparador,
    dataSource,
    dataSourceNote,
    anioCorte,
  } = dashboardData;

  const {
    dashboardKpis,
    participacionGenero,
    participacionGeneroAgregado,
    participacionMaxY,
    tendenciaAsistencia,
    tendenciaTitulo,
    tendenciaLeyendaPrincipal,
    tendenciaLeyendaSecundaria,
    tendenciaInventario,
    participacionNse,
    movilidadPorModo,
    metricasNegocio,
    densidadInfra,
    distribucionTipologia,
    hasParticipacionDatos,
  } = filtered;

  const [filtersOpen, setFiltersOpen] = useState(false);

  const filterFields = (
    <>
      <FilterSelect
        label="Alcaldía"
        options={filtroOpciones.alcaldia}
        value={alcaldia}
        onChange={setAlcaldia}
      />
      <FilterSelect
        label="Disciplina"
        options={filtroOpciones.disciplina}
        value={disciplina}
        onChange={setDisciplina}
      />
      <FilterSelect
        label="Periodo"
        options={filtroOpciones.periodo}
        value={periodo}
        onChange={setPeriodo}
      />
      <FilterSelect
        label="Nivel socioeconómico"
        options={filtroOpciones.nivelSocioeconomico}
        value={nse}
        onChange={setNse}
      />
      <FilterSelect
        label="Rango de edad"
        options={filtroOpciones.rangoEdad}
        value={edad}
        onChange={setEdad}
      />
      <FilterSelect
        label="Género"
        options={filtroOpciones.genero}
        value={genero}
        onChange={setGenero}
      />
    </>
  );

  return (
    <div className="min-h-[calc(100dvh-6rem)] bg-geo-surface pb-12">
      {/* Barra de filtros superior */}
      <div className="border-b border-geo-border bg-geo-card">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end">
            <div className="flex w-full items-center justify-between gap-2 xl:w-auto xl:shrink-0">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-geo-pink" />
                <span className="text-sm font-semibold text-geo-navy">
                  Filtros Avanzados
                </span>
              </div>
              <button
                type="button"
                onClick={() => setFiltersOpen((v) => !v)}
                className="inline-flex min-h-11 items-center gap-1 rounded-lg border border-geo-border px-3 text-sm font-medium text-geo-navy lg:hidden"
                aria-expanded={filtersOpen}
              >
                {filtersOpen ? "Ocultar" : "Mostrar"}
                <ChevronDown
                  className={cn("h-4 w-4 transition", filtersOpen && "rotate-180")}
                  aria-hidden
                />
              </button>
            </div>
            <div className="hidden flex-1 grid-cols-2 gap-3 sm:grid-cols-3 lg:grid xl:grid-cols-6">
              {filterFields}
            </div>
            {filtersOpen && (
              <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2 lg:hidden">
                {filterFields}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start">
          <div className="order-2 min-w-0 flex-1 space-y-6 xl:order-1">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-geo-navy sm:text-3xl">
                  Dashboard Estadístico
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-geo-muted">
                  Análisis comparativo y tendencias de infraestructura cultural · corte{" "}
                  {anioCorte}
                </p>
                <span
                  className={cn(
                    "mt-3 inline-flex rounded-full px-3 py-1 text-xs font-medium",
                    dataSource === "supabase"
                      ? "bg-emerald-50 text-emerald-800"
                      : "bg-amber-50 text-amber-900",
                  )}
                >
                  {dataSource === "supabase" ? "Métricas Supabase" : "Modo demo"}
                </span>
                {dataSourceNote && (
                  <p className="mt-1 text-xs text-geo-muted">{dataSourceNote}</p>
                )}
                <p className="mt-2 text-xs font-medium text-geo-navy">{filterSummary}</p>
                {periodoLoading && (
                  <p className="mt-2 flex items-center gap-2 text-xs text-geo-muted">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                    Cargando métricas del periodo seleccionado…
                  </p>
                )}
                {!periodoLoading && densidadLoading && (
                  <p className="mt-2 text-xs text-geo-muted">
                    Actualizando densidad por zona…
                  </p>
                )}
                {!periodoLoading && filterNotice && (
                  <div
                    className="mt-3 flex gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950"
                    role="status"
                  >
                    <AlertTriangle
                      className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-700"
                      aria-hidden
                    />
                    <p>{filterNotice}</p>
                  </div>
                )}
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="border-geo-border bg-geo-card text-geo-navy hover:bg-geo-surface"
                  disabled={exporting}
                  onClick={() => void exportDashboard("pdf")}
                >
                  <Download className="h-4 w-4" />
                  {exporting ? "Exportando…" : "Exportar Datos"}
                </Button>
                <Button href="/reportes" variant="primary">
                  <LineChartIcon className="h-4 w-4" />
                  Generar Reporte
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {dashboardKpis.map((k) => (
                <DashboardKpiCard key={k.label} {...k} />
              ))}
            </div>

            <MetricasNegocioCard data={metricasNegocio} />

            {dashboardData.cuestionarioPeriodo && (
              <div className="rounded-xl border border-geo-border bg-geo-card p-4 shadow-sm sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-geo-pink">
                      <ClipboardList className="h-4 w-4" />
                      <span className="text-xs font-semibold uppercase tracking-wide">
                        Cuestionario SECTEI
                      </span>
                    </div>
                    <h3 className="mt-1 font-semibold text-geo-navy">
                      Captura móvil · {dashboardData.cuestionarioPeriodo}
                    </h3>
                    <p className="mt-1 text-xs text-geo-muted">
                      {dashboardData.cuestionarioTotalRespuestas} respuesta(s) agregadas en el periodo semestral actual.
                    </p>
                  </div>
                  <Button href="/cuestionario" variant="outline" size="sm">
                    Ver detalle
                  </Button>
                </div>
                {dashboardData.cuestionarioResumen.length > 0 && (
                  <ResponsiveTable
                    mobile={
                      <div className="mt-4 divide-y divide-geo-border">
                        {dashboardData.cuestionarioResumen.slice(0, 6).map((r) => (
                          <MobileDataCard
                            key={r.alcaldiaNombre}
                            title={r.alcaldiaNombre}
                          >
                            <MobileDataRow label="Respuestas" value={r.respuestasCapturadas} />
                            <MobileDataRow label="Usuarios" value={r.totalUsuariosInscritos} />
                            <MobileDataRow label="Empleo" value={r.empleoRemuneradoTotal} />
                          </MobileDataCard>
                        ))}
                      </div>
                    }
                  >
                    <table className="mt-4 min-w-full text-left text-xs">
                      <thead className="text-geo-muted">
                        <tr>
                          <th className="py-2 pr-4">Alcaldía</th>
                          <th className="py-2 pr-4">Resp.</th>
                          <th className="py-2 pr-4">Usuarios</th>
                          <th className="py-2">Empleo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dashboardData.cuestionarioResumen.slice(0, 6).map((r) => (
                          <tr key={r.alcaldiaNombre} className="border-t border-geo-border/60">
                            <td className="py-2 pr-4 font-medium text-geo-navy">{r.alcaldiaNombre}</td>
                            <td className="py-2 pr-4">{r.respuestasCapturadas}</td>
                            <td className="py-2 pr-4">{r.totalUsuariosInscritos}</td>
                            <td className="py-2">{r.empleoRemuneradoTotal}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </ResponsiveTable>
                )}
              </div>
            )}

            {exportHint && (
              <p
                className={cn(
                  "rounded-lg border px-4 py-2 text-center text-sm",
                  exportHint.startsWith("Error:")
                    ? "border-red-200 bg-red-50 text-red-900"
                    : "border-sky-200 bg-sky-50 text-sky-900",
                )}
              >
                {exportHint}
              </p>
            )}

            <div className="space-y-6">
            <div className="grid min-w-0 gap-6 lg:grid-cols-2">
              <TendenciaInventarioPanel
                tendencia={tendenciaInventario}
                modo={tendenciaModo}
                onModoChange={setTendenciaModo}
              />

              <ParticipacionGeneroAgregadoPanel
                data={participacionGeneroAgregado}
                modo={participacionGeneroModo}
                onModoChange={setParticipacionGeneroModo}
                tipologiaSlot={
                  !hasParticipacionDatos ? (
                    <div className="flex h-[288px] items-center justify-center px-4 text-center text-sm text-geo-muted sm:h-[320px]">
                      Sin datos de participación para los filtros actuales.
                    </div>
                  ) : (
                    <ClientChart
                      height={PARTICIPACION_CHART_HEIGHT}
                      className="w-full min-w-0"
                    >
                      {(width) =>
                        width > 0 ? (
                          <ParticipacionGeneroChart
                            data={[...participacionGenero]}
                            maxY={participacionMaxY}
                            containerWidth={width}
                          />
                        ) : null
                      }
                    </ClientChart>
                  )
                }
              />
            </div>

            <div className="grid min-w-0 gap-6 lg:grid-cols-2">
              <ParticipacionNseChartPanel data={participacionNse} />
              <MovilidadModoChartPanel data={movilidadPorModo} />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <ChartCard
                title="Densidad de infraestructura"
                subtitle="Índice relativo por zona metropolitana"
              >
                <ResponsiveContainer width="100%" height={260} minWidth={0}>
                  <AreaChart
                    data={[...densidadInfra]}
                    margin={{ top: 8, right: 8, left: -8, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="fillDens" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={chart.areaFill} stopOpacity={0.35} />
                        <stop offset="100%" stopColor={chart.areaFill} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={chart.gridStroke} />
                    <XAxis dataKey="zona" tick={{ fontSize: 11, fill: chart.tickFill }} />
                    <YAxis tick={{ fontSize: 10, fill: chart.tickFill }} domain={[0, 100]} />
                    <Tooltip contentStyle={chart.tooltipStyle} />
                    <Area
                      type="monotone"
                      dataKey="valor"
                      name="Densidad"
                      stroke={chart.seriesPrimary}
                      fill="url(#fillDens)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>

              <div className="rounded-xl border border-geo-border bg-geo-card p-4 shadow-sm sm:p-5">
                <h3 className="font-semibold text-geo-navy">Distribución por tipología</h3>
                <p className="mt-1 text-xs text-geo-muted">
                  Clasificación oficial de espacios · 12 tipologías SIC
                </p>
                <ClientChart height={320} className="mt-4">
                  <DistribucionTipologiaChart data={[...distribucionTipologia]} />
                </ClientChart>
              </div>
            </div>

            {/* Tabla */}
            <div className="rounded-xl border border-geo-border bg-geo-card p-4 shadow-sm sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-semibold text-geo-navy">
                    Detalle de espacios culturales
                  </h3>
                  <p className="text-xs text-geo-muted">
                    Padrón filtrado ·{" "}
                    {espaciosLoading
                      ? "cargando padrón…"
                      : `${espaciosTablaTotal.toLocaleString("es-MX")} espacios`}
                    {dataSource === "supabase" ? " (Supabase)" : ""}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={exporting}
                    onClick={() => void exportDashboard("csv-espacios")}
                  >
                    <Download className="h-4 w-4" />
                    CSV
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={exporting}
                    onClick={() => void exportDashboard("json-espacios")}
                  >
                    <Download className="h-4 w-4" />
                    JSON
                  </Button>
                </div>
              </div>
              {espaciosLoading ? (
                <div className="mt-6 flex items-center justify-center gap-2 py-12 text-sm text-geo-muted">
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Cargando padrón de espacios…
                </div>
              ) : (
              <>
              <ResponsiveTable
                mobile={
                  <div className="mt-4 divide-y divide-geo-border">
                    {espaciosTabla.map((row) => (
                      <MobileDataCard
                        key={row.id}
                        title={row.nombre}
                        subtitle={row.id}
                        badge={<EstadoTabla estado={row.estado} />}
                      >
                        <MobileDataRow label="Alcaldía" value={row.alcaldia} />
                        <MobileDataRow
                          label="Completitud"
                          value={
                            <span className="tabular-nums font-semibold">
                              {row.completitud}%
                            </span>
                          }
                        />
                      </MobileDataCard>
                    ))}
                  </div>
                }
              >
                <table className="mt-4 w-full min-w-[560px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-geo-border text-geo-muted">
                      <th className="pb-3 pr-3 font-medium">ID</th>
                      <th className="pb-3 pr-3 font-medium">Nombre</th>
                      <th className="pb-3 pr-3 font-medium">Alcaldía</th>
                      <th className="pb-3 pr-3 font-medium">Completitud</th>
                      <th className="pb-3 font-medium">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {espaciosTabla.map((row) => (
                      <tr
                        key={row.id}
                        className="border-b border-geo-border/70 last:border-0"
                      >
                        <td className="py-3 pr-3 font-mono text-xs text-geo-muted">
                          {row.id}
                        </td>
                        <td className="py-3 pr-3 font-medium text-geo-navy">
                          {row.nombre}
                        </td>
                        <td className="py-3 pr-3 text-geo-muted">{row.alcaldia}</td>
                        <td className="py-3 pr-3 text-foreground/80">
                          <span className="tabular-nums font-semibold">{row.completitud}%</span>
                        </td>
                        <td className="py-3">
                          <EstadoTabla estado={row.estado} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ResponsiveTable>
              {espaciosTablaTotal > 0 && (
                <div className="mt-4 flex flex-col gap-3 border-t border-geo-border pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-geo-muted">
                    Página {tablaPage} de {tablaTotalPaginas} ·{" "}
                    {espaciosTabla.length.toLocaleString("es-MX")} de{" "}
                    {espaciosTablaTotal.toLocaleString("es-MX")} registros
                  </p>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={tablaPage <= 1}
                      onClick={() => setTablaPage((p) => Math.max(1, p - 1))}
                    >
                      Anterior
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={tablaPage >= tablaTotalPaginas}
                      onClick={() =>
                        setTablaPage((p) => Math.min(tablaTotalPaginas, p + 1))
                      }
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>
              )}
              </>
              )}
            </div>
            </div>
          </div>

          {/* Comparador territorial — arriba en móvil, lateral en xl */}
          <aside className="order-1 w-full shrink-0 space-y-6 xl:order-2 xl:w-80 xl:sticky xl:top-6">
            <div className="overflow-hidden rounded-xl border border-geo-border bg-geo-card shadow-lg">
              <div className="bg-geo-navy px-5 py-4">
                <div className="flex items-start gap-2.5">
                  <ArrowLeftRight
                    className="mt-0.5 h-4 w-4 shrink-0 text-white"
                    strokeWidth={2}
                    aria-hidden
                  />
                  <div>
                    <h3 className="text-xs font-bold tracking-[0.12em] text-white">
                      COMPARADOR TERRITORIAL
                    </h3>
                    <p className="mt-1 text-xs text-sky-200/90">
                      Analiza brechas entre alcaldías seleccionadas
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-b border-geo-border px-5 py-4">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-geo-muted">
                  Alcaldía A
                </label>
                <div className="relative mt-1.5">
                  <span
                    className="pointer-events-none absolute left-3 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-geo-navy"
                    aria-hidden
                  />
                  <select
                    value={borA}
                    onChange={(e) => setBorA(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-geo-border bg-geo-input py-2.5 pl-8 pr-9 text-sm font-semibold text-geo-navy outline-none focus:border-geo-navy focus:ring-2 focus:ring-geo-navy/15"
                  >
                    {alcaldiasComparador.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-geo-muted"
                    aria-hidden
                  />
                </div>

                <div className="my-3 flex justify-center">
                  <button
                    type="button"
                    onClick={swapAlcaldias}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-geo-border bg-geo-surface text-geo-muted transition-colors hover:border-geo-pink hover:text-geo-pink"
                    aria-label="Intercambiar alcaldías"
                  >
                    <ArrowUpDown className="h-4 w-4" strokeWidth={2} />
                  </button>
                </div>

                <label className="text-[10px] font-semibold uppercase tracking-wider text-geo-muted">
                  Alcaldía B
                </label>
                <div className="relative mt-1.5">
                  <span
                    className="pointer-events-none absolute left-3 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-geo-pink"
                    aria-hidden
                  />
                  <select
                    value={borB}
                    onChange={(e) => setBorB(e.target.value)}
                    className="w-full appearance-none rounded-lg border-2 border-geo-pink bg-geo-input py-2.5 pl-8 pr-9 text-sm font-semibold text-geo-navy outline-none focus:border-geo-pink focus:ring-2 focus:ring-geo-pink/20"
                  >
                    {alcaldiasComparador.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-geo-muted"
                    aria-hidden
                  />
                </div>
              </div>

              <div className="space-y-4 px-5 py-4">
                {comparadorMetricas.map((m) => {
                  const max = Math.max(m.a, m.b, 1);
                  const pctA = Math.round((m.a / max) * 100);
                  const pctB = Math.round((m.b / max) * 100);
                  const fmt = (n: number) =>
                    Number.isInteger(n) ? String(n) : n.toFixed(1);
                  return (
                    <div key={m.label}>
                      <div className="flex items-center justify-between gap-2 text-[11px]">
                        <span className="font-medium text-geo-navy">
                          {m.label}
                        </span>
                        <span className="shrink-0 tabular-nums">
                          <span className="font-bold text-geo-navy">
                            {fmt(m.a)}
                          </span>
                          <span className="mx-1 text-geo-muted">vs</span>
                          <span className="font-bold text-geo-pink">
                            {fmt(m.b)}
                          </span>
                        </span>
                      </div>
                      <div className="mt-1.5 flex h-2 gap-0.5 overflow-hidden rounded-full bg-geo-surface">
                        <div
                          className="bg-geo-navy"
                          style={{ width: `${pctA}%` }}
                          title={`${borA}: ${fmt(m.a)}`}
                        />
                        <div
                          className="bg-geo-pink"
                          style={{ width: `${pctB}%` }}
                          title={`${borB}: ${fmt(m.b)}`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-3 px-5 pb-5">
                <div className="rounded-lg border border-geo-pink/40 bg-geo-pink/10 p-3.5">
                  <div className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-geo-pink text-white">
                      <Info
                        className="h-3.5 w-3.5"
                        strokeWidth={2.5}
                        aria-hidden
                      />
                    </span>
                    <p className="text-sm leading-relaxed text-geo-navy">
                      <span className="font-bold">Hallazgo:</span> {borA} y {borB} difieren{" "}
                      <span className="font-bold text-geo-pink">
                        {hallazgoTerritorial.brechaAccesibilidad} pp
                      </span>{" "}
                      en brecha territorial (porcentaje de brecha en el padrón).
                    </p>
                  </div>
                </div>

                <Link
                  href="/politicas"
                  className="flex w-full items-center justify-center rounded-lg border-2 border-geo-navy bg-geo-input py-2.5 text-sm font-semibold text-geo-navy transition-colors hover:bg-geo-surface"
                >
                  Ver Recomendaciones
                </Link>
              </div>
            </div>

            <div className="rounded-xl bg-geo-navy p-5 text-white shadow-lg">
              <div className="flex items-center gap-2.5">
                <FileText
                  className="h-5 w-5 shrink-0 text-geo-pink"
                  strokeWidth={2}
                  aria-hidden
                />
                <h3 className="font-semibold">Exportación Rápida</h3>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-sky-100/85">
                Obtén los datasets segmentados por tu selección actual de
                filtros.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={exporting}
                  onClick={() => void exportDashboard("geojson")}
                  className="rounded-lg bg-white/15 px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/25 disabled:opacity-50 dark:bg-geo-hover dark:text-foreground dark:hover:bg-geo-border"
                >
                  GeoJSON
                </button>
                <button
                  type="button"
                  disabled={exporting}
                  onClick={() => void exportDashboard("xlsx")}
                  className="rounded-lg bg-white/15 px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/25 disabled:opacity-50 dark:bg-geo-hover dark:text-foreground dark:hover:bg-geo-border"
                >
                  XLSX
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
