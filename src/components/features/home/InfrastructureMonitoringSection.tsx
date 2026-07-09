"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Map,
  TrendingUp,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ClientChart } from "@/components/shared/ClientChart";
import { PriorityBadge } from "@/components/shared/PriorityBadge";
import { useMediaQuery } from "@/hooks/use-media-query";
import type {
  BrechaAlcaldia,
  GrowthDataPoint,
  Prioridad,
} from "@/lib/domain/home";
import { useChartTheme } from "@/hooks/use-chart-theme";
import { abbreviateAlcaldia, computeNiceYAxis } from "@/lib/utils/chart-scale";
import { cn } from "@/lib/utils";

const BRECHA_BAR_BG: Record<Prioridad, string> = {
  Crítico: "bg-geo-pink",
  Atención: "bg-orange-500",
  Estable: "bg-geo-navy",
};

/** Escala continua para diferenciar valores aunque todos sean “Crítico”. */
function brechaBarFill(brecha: number): string {
  if (brecha >= 95) return "#be185d";
  if (brecha >= 90) return "#db2777";
  if (brecha >= 85) return "#e10599";
  if (brecha >= 75) return "#f97316";
  if (brecha >= 40) return "#fb923c";
  return "#1f3a5f";
}

type BrechaTooltipProps = {
  active?: boolean;
  payload?: Array<{ payload: BrechaAlcaldia }>;
};

function BrechaTerritorialTooltip({ active, payload }: BrechaTooltipProps) {
  if (!active || !payload?.[0]) return null;
  const row = payload[0].payload;
  return (
    <div className="rounded-lg border border-geo-border bg-geo-card px-3 py-2.5 shadow-lg">
      <p className="text-sm font-semibold text-geo-navy">{row.alcaldia}</p>
      <p className="mt-1 text-xs text-geo-muted">
        Brecha: <span className="font-semibold text-foreground">{row.brecha}%</span>
        {" · "}
        {row.espacios.toLocaleString("es-MX")} espacios
      </p>
      <div className="mt-2">
        <PriorityBadge prioridad={row.prioridad} />
      </div>
    </div>
  );
}

function brechaChartHeight(rowCount: number): number {
  return Math.max(260, rowCount * 30 + 56);
}

type BrechaPreviewListProps = {
  rows: BrechaAlcaldia[];
};

function BrechaPreviewList({ rows }: BrechaPreviewListProps) {
  const isMobile = useMediaQuery("(max-width: 639px)");

  if (isMobile) {
    return (
      <ul className="space-y-3">
        {rows.map((row) => (
          <li
            key={row.alcaldia}
            className="rounded-xl border border-geo-border/80 bg-geo-surface/40 p-3.5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium leading-snug text-geo-navy">{row.alcaldia}</p>
                <p className="mt-1 text-xs text-geo-muted">
                  {row.espacios.toLocaleString("es-MX")} espacios
                </p>
              </div>
              <PriorityBadge prioridad={row.prioridad} />
            </div>
            <div className="mt-3 flex items-center gap-3">
              <div className="h-2.5 min-w-0 flex-1 overflow-hidden rounded-full bg-geo-surface">
                <div
                  className={cn("h-2.5 rounded-full transition-all duration-500", BRECHA_BAR_BG[row.prioridad])}
                  style={{ width: `${row.brecha}%` }}
                />
              </div>
              <span className="w-11 shrink-0 text-right text-sm font-semibold tabular-nums text-foreground">
                {row.brecha}%
              </span>
            </div>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <table className="w-full min-w-[420px] text-sm">
      <thead>
        <tr className="border-b border-geo-border text-left text-xs font-medium text-geo-muted">
          <th className="pb-3 pr-4">Alcaldía</th>
          <th className="pb-3 pr-4">Espacios</th>
          <th className="pb-3 pr-4">Brecha Est.</th>
          <th className="pb-3">Prioridad</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr
            key={row.alcaldia}
            className="border-b border-geo-border/60 last:border-0"
          >
            <td className="py-3.5 pr-4 font-medium text-geo-navy">{row.alcaldia}</td>
            <td className="py-3.5 pr-4 tabular-nums text-foreground/80">{row.espacios}</td>
            <td className="py-3.5 pr-4">
              <div className="flex items-center gap-2">
                <div className="h-2 min-w-[5rem] flex-1 overflow-hidden rounded-full bg-geo-surface">
                  <div
                    className={cn("h-2 rounded-full", BRECHA_BAR_BG[row.prioridad])}
                    style={{ width: `${row.brecha}%` }}
                  />
                </div>
                <span className="w-10 shrink-0 text-right text-xs font-semibold tabular-nums text-foreground">
                  {row.brecha}%
                </span>
              </div>
            </td>
            <td className="py-3.5">
              <PriorityBadge prioridad={row.prioridad} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function formatGrowthAxisTick(value: number): string {
  return Number(value).toLocaleString("es-MX");
}

const GROWTH_CHART_HEIGHT = 280;
const GROWTH_CHART_HEIGHT_MOBILE = 240;
/** Años visibles por defecto cuando la serie es larga. */
const GROWTH_RECENT_YEARS_MOBILE = 8;
const GROWTH_RECENT_YEARS_DESKTOP = 12;
const GROWTH_YEAR_SLOT_MOBILE = 40;
const GROWTH_YEAR_SLOT_DESKTOP = 48;

type GrowthHistoricoChartProps = {
  data: GrowthDataPoint[];
};

function GrowthHistoricoChart({ data }: GrowthHistoricoChartProps) {
  const chart = useChartTheme();
  const isMobile = useMediaQuery("(max-width: 639px)");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showFullHistory, setShowFullHistory] = useState(false);

  const chartHeight = isMobile ? GROWTH_CHART_HEIGHT_MOBILE : GROWTH_CHART_HEIGHT;
  const yearSlot = isMobile ? GROWTH_YEAR_SLOT_MOBILE : GROWTH_YEAR_SLOT_DESKTOP;
  const recentYears = isMobile ? GROWTH_RECENT_YEARS_MOBILE : GROWTH_RECENT_YEARS_DESKTOP;
  const canToggleHistory = data.length > recentYears;
  const isFullHistoryView = canToggleHistory && showFullHistory;

  const displayData = isFullHistoryView
    ? data
    : data.length > recentYears
      ? data.slice(-recentYears)
      : data;

  const fullSeriesMax = Math.max(...data.map((point) => point.value), 1);
  const compactScaleMax = Math.max(...displayData.map((point) => point.value), 1);
  const scaleMaxValue = isFullHistoryView ? fullSeriesMax : compactScaleMax;
  const { max: yAxisMax, ticks: yAxisTicks } = computeNiceYAxis(scaleMaxValue);

  const scrollWidth = data.length * yearSlot + (isMobile ? 36 : 48);

  useEffect(() => {
    if (!isFullHistoryView || scrollRef.current == null) return;
    scrollRef.current.scrollLeft = 0;
  }, [isFullHistoryView]);

  const barChartProps = {
    data: displayData,
    margin: { top: 8, right: 8, left: 0, bottom: 0 } as const,
  };

  return (
    <div className="mt-6 min-w-0">
      {canToggleHistory ? (
        <div className="mb-3 flex items-center justify-between gap-2">
          <p className="text-xs text-geo-muted">
            {isFullHistoryView
              ? `${data[0]?.year ?? "—"} → ${data[data.length - 1]?.year ?? "—"} · desliza →`
              : `Últimos ${displayData.length} años`}
          </p>
          <button
            type="button"
            onClick={() => setShowFullHistory((value) => !value)}
            aria-expanded={isFullHistoryView}
            aria-controls="growth-historico-chart-panel"
            className="shrink-0 rounded-full border border-geo-border bg-geo-surface px-3 py-1 text-xs font-medium text-geo-navy transition hover:border-geo-pink/40 hover:text-geo-pink"
          >
            {isFullHistoryView ? "Ver reciente" : "Ver histórico"}
          </button>
        </div>
      ) : null}

      {isFullHistoryView ? (
        <p className="mb-2 text-[10px] leading-relaxed text-geo-muted">
          <span className="flex items-center gap-1 font-medium uppercase tracking-wide">
            <ChevronLeft className="h-3 w-3 shrink-0" aria-hidden />
            Recorre la línea de tiempo de izquierda a derecha
            <ChevronRight className="h-3 w-3 shrink-0" aria-hidden />
          </span>
          <span className="mt-1 block normal-case">
            Total acumulado al cierre de{" "}
            {data[data.length - 1]?.year ?? "—"}:{" "}
            <span className="font-medium text-foreground">
              {fullSeriesMax.toLocaleString("es-MX")} recintos
            </span>
          </span>
        </p>
      ) : null}

      <div
        id="growth-historico-chart-panel"
        className={cn(
          "min-w-0 max-w-full",
          isFullHistoryView && "overflow-hidden rounded-lg border border-geo-border/60 bg-geo-surface/20",
        )}
        style={{ height: chartHeight }}
      >
        {isFullHistoryView ? (
          <div
            ref={scrollRef}
            className="h-full w-full max-w-full overflow-x-auto overflow-y-hidden overscroll-x-contain [-webkit-overflow-scrolling:touch]"
            tabIndex={0}
            role="region"
            aria-label="Crecimiento histórico: desplázate de izquierda a derecha por año"
          >
            <div className="h-full" style={{ width: scrollWidth }}>
              <ClientChart height={chartHeight} className="h-full w-full">
                {(width) => (
                  <BarChart
                    width={Math.max(width, scrollWidth)}
                    height={chartHeight}
                    {...barChartProps}
                  >
                    <CartesianGrid
                      strokeDasharray="4 4"
                      stroke={chart.gridStroke}
                      vertical={false}
                    />
                    <XAxis
                      dataKey="year"
                      axisLine={false}
                      tickLine={false}
                      interval={0}
                      tick={{ fontSize: isMobile ? 9 : 10, fill: chart.tickFill }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: chart.tickFill }}
                      domain={[0, yAxisMax]}
                      ticks={yAxisTicks}
                      width={isMobile ? 36 : 44}
                      tickFormatter={formatGrowthAxisTick}
                    />
                    <Tooltip
                      cursor={{ fill: "rgba(31, 58, 95, 0.06)" }}
                      contentStyle={chart.tooltipStyle}
                      wrapperStyle={{ zIndex: 30, pointerEvents: "none" }}
                      formatter={(value) => [
                        typeof value === "number"
                          ? value.toLocaleString("es-MX")
                          : String(value ?? ""),
                        "Total acumulado",
                      ]}
                    />
                    <Bar
                      dataKey="value"
                      fill={chart.seriesPrimary}
                      radius={[3, 3, 0, 0]}
                      maxBarSize={isMobile ? 28 : 32}
                      isAnimationActive
                      animationDuration={400}
                    />
                  </BarChart>
                )}
              </ClientChart>
            </div>
          </div>
        ) : (
          <ClientChart height={chartHeight} className="h-full w-full min-w-0 max-w-full">
            {(width) =>
              width > 0 ? (
                <ResponsiveContainer width="100%" height={chartHeight} minWidth={width}>
                  <BarChart height={chartHeight} {...barChartProps}>
                    <CartesianGrid
                      strokeDasharray="4 4"
                      stroke={chart.gridStroke}
                      vertical={false}
                    />
                    <XAxis
                      dataKey="year"
                      axisLine={false}
                      tickLine={false}
                      interval={0}
                      tick={{ fontSize: isMobile ? 10 : 11, fill: chart.tickFill }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: chart.tickFill }}
                      domain={[0, yAxisMax]}
                      ticks={yAxisTicks}
                      width={isMobile ? 36 : 44}
                      tickFormatter={formatGrowthAxisTick}
                    />
                    <Tooltip
                      cursor={{ fill: "rgba(31, 58, 95, 0.06)" }}
                      contentStyle={chart.tooltipStyle}
                      wrapperStyle={{ zIndex: 30, pointerEvents: "none" }}
                      formatter={(value) => [
                        typeof value === "number"
                          ? value.toLocaleString("es-MX")
                          : String(value ?? ""),
                        "Total acumulado",
                      ]}
                    />
                    <Bar
                      dataKey="value"
                      fill={chart.seriesPrimary}
                      radius={[4, 4, 0, 0]}
                      maxBarSize={isMobile ? 32 : 40}
                      isAnimationActive
                      animationDuration={400}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : null
            }
          </ClientChart>
        )}
      </div>
    </div>
  );
}

type BrechaTerritorialChartPanelProps = {
  title: string;
  description: string;
  data: BrechaAlcaldia[];
  brechaXMin: number;
  brechaXTicks: number[];
  showReferenceLine?: boolean;
};

function BrechaTerritorialChartPanel({
  title,
  description,
  data,
  brechaXMin,
  brechaXTicks,
  showReferenceLine = false,
}: BrechaTerritorialChartPanelProps) {
  const chart = useChartTheme();
  const isMobile = useMediaQuery("(max-width: 639px)");
  const yAxisWidth = isMobile ? 108 : 148;
  const height = brechaChartHeight(data.length);
  const chartMargin = isMobile
    ? { top: 8, right: 28, left: 0, bottom: 8 }
    : { top: 8, right: 48, left: 4, bottom: 8 };

  return (
    <div className="rounded-lg border border-geo-border/80 bg-geo-surface/30 p-4 sm:p-5">
      <h4 className="text-sm font-semibold text-geo-navy">{title}</h4>
      <p className="mt-0.5 text-xs text-geo-muted">{description}</p>
      <ClientChart height={height} className="mt-4 w-full min-w-0">
        {(width) => (
          <ResponsiveContainer width="100%" height={height} minWidth={Math.max(width, 280)}>
            <BarChart
              data={data}
              layout="vertical"
              margin={chartMargin}
              barCategoryGap={isMobile ? "12%" : "18%"}
            >
              <CartesianGrid
                strokeDasharray="3 6"
                stroke={chart.gridStroke}
                horizontal={false}
                vertical
              />
              <XAxis
                type="number"
                domain={[brechaXMin, 100]}
                ticks={brechaXTicks}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: chart.tickFill }}
                tickFormatter={(v) => `${v}%`}
              />
              <YAxis
                type="category"
                dataKey="alcaldia"
                width={yAxisWidth}
                axisLine={false}
                tickLine={false}
                tick={{
                  fontSize: isMobile ? 9 : 11,
                  fill: chart.seriesPrimary,
                  fontWeight: 500,
                }}
                tickFormatter={(value) =>
                  isMobile ? abbreviateAlcaldia(String(value)) : String(value)
                }
              />
              {showReferenceLine && (
                <ReferenceLine
                  x={40}
                  stroke="#94a3b8"
                  strokeDasharray="5 5"
                  strokeWidth={1.5}
                  label={{
                    value: "Umbral 40%",
                    position: "insideTopRight",
                    fill: chart.tickFill,
                    fontSize: 9,
                  }}
                />
              )}
              <Tooltip
                cursor={{ fill: "rgba(31, 58, 95, 0.04)" }}
                content={<BrechaTerritorialTooltip />}
                wrapperStyle={{ zIndex: 30, pointerEvents: "none" }}
              />
              <Bar
                dataKey="brecha"
                radius={[0, 5, 5, 0]}
                maxBarSize={isMobile ? 18 : 14}
                isAnimationActive
                animationDuration={500}
                background={{ fill: chart.gridStroke, radius: 5 }}
              >
                {data.map((row) => (
                  <Cell key={row.alcaldia} fill={brechaBarFill(row.brecha)} />
                ))}
                {!isMobile && (
                  <LabelList
                    dataKey="brecha"
                    position="right"
                    formatter={(value) =>
                      typeof value === "number" ? `${value}%` : ""
                    }
                    fill={chart.labelFill}
                    fontSize={10}
                    fontWeight={600}
                  />
                )}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </ClientChart>
    </div>
  );
}

type InfrastructureMonitoringSectionProps = {
  growthData: GrowthDataPoint[];
  brechaAlcaldias: BrechaAlcaldia[];
  actualizadoEl?: string | null;
};

export function InfrastructureMonitoringSection({
  growthData,
  brechaAlcaldias,
  actualizadoEl,
}: InfrastructureMonitoringSectionProps) {
  const growthYears =
    growthData.length > 0
      ? `${growthData[0]?.year ?? "—"} - ${growthData[growthData.length - 1]?.year ?? "—"}`
      : "Sin datos";

  const brechaMin = brechaAlcaldias.length
    ? Math.min(...brechaAlcaldias.map((row) => row.brecha))
    : 0;
  const brechaMax = brechaAlcaldias.length
    ? Math.max(...brechaAlcaldias.map((row) => row.brecha))
    : 100;
  const brechaXMin = Math.max(0, Math.floor(brechaMin / 5) * 5 - 8);
  const brechaXTicks = Array.from({ length: 5 }, (_, i) =>
    Math.round(brechaXMin + ((100 - brechaXMin) * i) / 4),
  );
  const brechaMitad = Math.ceil(brechaAlcaldias.length / 2);
  const brechaMayorDeficit = brechaAlcaldias.slice(0, brechaMitad);
  const brechaMenorDeficit = brechaAlcaldias.slice(brechaMitad);

  return (
    <section className="bg-geo-surface py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <span className="inline-flex items-center rounded-full bg-geo-navy px-3 py-1 text-xs font-medium text-white">
              Análisis Estratégico
            </span>
            <h2 className="mt-3 text-xl font-bold tracking-tight text-geo-navy sm:text-2xl md:text-3xl">
              Monitoreo de Infraestructura
            </h2>
            <p className="mt-1 max-w-xl text-sm text-geo-muted">
              Indicadores clave de crecimiento y déficit por zona territorial
            </p>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex w-full shrink-0 items-center justify-center rounded-lg border border-geo-border bg-geo-card px-4 py-2.5 text-sm font-medium text-geo-navy transition-colors hover:border-geo-navy/30 hover:bg-geo-hover sm:w-auto sm:py-2"
          >
            Ver Dashboard Completo
          </Link>
        </div>

        <div className="mt-6 grid min-w-0 gap-4 sm:mt-8 sm:gap-6 lg:grid-cols-2">
          {/* Crecimiento histórico */}
          <div className="isolate min-w-0 overflow-hidden rounded-xl border border-geo-border bg-geo-card p-4 shadow-sm sm:p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-geo-surface text-geo-navy">
                <TrendingUp className="h-5 w-5" strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-geo-navy">
                  Crecimiento Histórico
                </h3>
                <p className="mt-0.5 text-xs text-geo-muted sm:text-sm">
                  Total acumulado de recintos al cierre de cada año ({growthYears}) · padrón
                  SECTEI
                </p>
              </div>
            </div>
            {growthData.length === 0 ? (
              <p className="mt-6 flex h-[220px] items-center justify-center text-sm text-geo-muted sm:h-[280px]">
                Sin datos de crecimiento para el periodo consultado.
              </p>
            ) : (
              <GrowthHistoricoChart data={growthData} />
            )}
          </div>

          {/* Zonas de mayor brecha — resumen */}
          <div className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-geo-border bg-geo-card p-4 shadow-sm sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-geo-pink/10 text-geo-pink">
                  <AlertCircle className="h-5 w-5" strokeWidth={2} />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-geo-navy">
                    Zonas de Mayor Brecha
                  </h3>
                  <p className="mt-0.5 text-xs text-geo-muted sm:text-sm">
                    {brechaAlcaldias.length > 0
                      ? `${brechaAlcaldias.length} alcaldías · `
                      : ""}
                    fuente{" "}
                    <span className="font-medium text-geo-navy">padrón SECTEI</span>
                    {" "}(fórmula móvil)
                  </p>
                </div>
              </div>
              <span
                className="shrink-0 rounded-full bg-geo-surface px-2.5 py-1 text-xs font-medium text-geo-muted"
                title={actualizadoEl ?? undefined}
              >
                {actualizadoEl ? `Actualizado ${actualizadoEl}` : "Sin fecha de corte"}
              </span>
            </div>

            <div className="mt-4 flex-1 sm:mt-6">
              {brechaAlcaldias.length === 0 ? (
                <p className="py-8 text-center text-sm text-geo-muted">
                  Sin datos de brecha territorial para el periodo actual.
                </p>
              ) : (
                <BrechaPreviewList rows={brechaAlcaldias.slice(0, 5)} />
              )}
            </div>

            {brechaAlcaldias.length > 5 && (
              <p className="mt-2 text-xs text-geo-muted">
                Vista previa: top 5. Los gráficos inferiores reparten las{" "}
                {brechaAlcaldias.length} alcaldías en dos paneles.
              </p>
            )}

            <div className="mt-4 flex flex-wrap justify-end gap-4 border-t border-geo-border/60 pt-4">
              <Link
                href="/mapa"
                className="inline-flex items-center gap-1 text-sm font-medium text-geo-navy transition-colors hover:text-geo-pink"
              >
                <Map className="h-4 w-4" strokeWidth={2} aria-hidden />
                Mapa de brechas
                <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </Link>
              <Link
                href="/politicas"
                className="inline-flex items-center gap-1 text-sm font-medium text-geo-navy transition-colors hover:text-geo-pink"
              >
                Recomendaciones de política
                <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </Link>
            </div>
          </div>
        </div>

        {/* Gráfico completo de brecha — 16 alcaldías */}
        {brechaAlcaldias.length > 0 && (
          <div className="mt-6 overflow-hidden rounded-xl border border-geo-border bg-geo-card shadow-sm">
            <div className="border-b border-geo-border bg-gradient-to-r from-geo-surface/80 to-geo-card px-4 py-4 sm:px-6 sm:py-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="min-w-0">
                  <h3 className="text-base font-semibold text-geo-navy sm:text-lg">
                    Brecha territorial por alcaldía
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm text-geo-muted">
                    Porcentaje de brecha SECTEI en las {brechaAlcaldias.length} alcaldías,
                    en dos paneles (mayor y menor déficit). Escala entre {brechaXMin}% y 100%
                    para resaltar diferencias.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border border-geo-border bg-geo-card px-3 py-1 text-xs font-medium text-foreground">
                    Máx. {brechaMax}%
                  </span>
                  <span className="rounded-full border border-geo-border bg-geo-card px-3 py-1 text-xs font-medium text-foreground/80">
                    Mín. {brechaMin}%
                  </span>
                </div>
              </div>
            </div>

            <div className="px-4 py-6 sm:px-6">
              <div className="grid gap-5 lg:grid-cols-2">
                {brechaMayorDeficit.length > 0 && (
                  <BrechaTerritorialChartPanel
                    title={`Mayor déficit (${brechaMayorDeficit.length})`}
                    description="Alcaldías con la brecha más alta del padrón."
                    data={brechaMayorDeficit}
                    brechaXMin={brechaXMin}
                    brechaXTicks={brechaXTicks}
                    showReferenceLine
                  />
                )}
                {brechaMenorDeficit.length > 0 && (
                  <BrechaTerritorialChartPanel
                    title={`Menor déficit (${brechaMenorDeficit.length})`}
                    description="Alcaldías con la brecha más baja, aun por encima del umbral crítico."
                    data={brechaMenorDeficit}
                    brechaXMin={brechaXMin}
                    brechaXTicks={brechaXTicks}
                  />
                )}
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-geo-border/60 pt-4">
                <div className="flex flex-wrap gap-4 text-xs text-geo-muted">
                  <span className="inline-flex items-center gap-2">
                    <span
                      className="h-2.5 w-8 rounded-full bg-gradient-to-r from-[#be185d] to-[#e10599]"
                      aria-hidden
                    />
                    Mayor brecha
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <span className="h-2.5 w-8 rounded-full bg-[#f97316]" aria-hidden />
                    Brecha media-alta
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <span className="h-2.5 w-8 rounded-full bg-[#1f3a5f]" aria-hidden />
                    Menor brecha
                  </span>
                </div>
                <p className="text-xs text-geo-muted">
                  Fuente: padrón georreferenciado · brecha SECTEI (paridad móvil)
                </p>
              </div>
            </div>

            <details className="group border-t border-geo-border px-4 py-4 sm:px-6">
              <summary className="cursor-pointer text-sm font-medium text-geo-navy hover:text-geo-pink">
                Ver tabla detallada ({brechaAlcaldias.length} filas)
              </summary>
              <div className="mt-4 max-h-80 overflow-x-auto overflow-y-auto rounded-lg border border-geo-border">
                <table className="w-full min-w-[520px] text-sm">
                  <thead className="sticky top-0 bg-geo-surface">
                    <tr className="border-b border-geo-border text-left text-xs font-medium text-geo-muted">
                      <th className="px-4 py-3">#</th>
                      <th className="px-4 py-3">Alcaldía</th>
                      <th className="px-4 py-3">Espacios</th>
                      <th className="px-4 py-3">Brecha</th>
                      <th className="px-4 py-3">Prioridad</th>
                    </tr>
                  </thead>
                  <tbody>
                    {brechaAlcaldias.map((row, index) => (
                      <tr
                        key={row.alcaldia}
                        className="border-b border-geo-border/60 last:border-0 hover:bg-geo-hover/60"
                      >
                        <td className="px-4 py-3 tabular-nums text-geo-muted">{index + 1}</td>
                        <td className="px-4 py-3 font-medium text-geo-navy">{row.alcaldia}</td>
                        <td className="px-4 py-3 tabular-nums text-foreground/80">{row.espacios}</td>
                        <td className="px-4 py-3 tabular-nums font-semibold text-foreground">{row.brecha}%</td>
                        <td className="px-4 py-3">
                          <PriorityBadge prioridad={row.prioridad} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          </div>
        )}
      </div>
    </section>
  );
}
