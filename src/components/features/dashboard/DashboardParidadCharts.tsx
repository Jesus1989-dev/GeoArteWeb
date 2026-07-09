"use client";

import { useEffect, useRef, type ReactNode } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Building2, ChevronLeft, ChevronRight, TrendingUp } from "lucide-react";
import { ClientChart } from "@/components/shared/ClientChart";
import { useChartTheme } from "@/hooks/use-chart-theme";
import { useMediaQuery } from "@/hooks/use-media-query";
import { computeNiceYAxis } from "@/lib/utils/chart-scale";
import type {
  MetricasNegocioResumen,
  MovilidadModoRow,
  ParticipacionGeneroAgregado,
  ParticipacionNseChart,
  TendenciaAsistenciaRow,
  TendenciaInventarioView,
} from "@/lib/domain/dashboard";
import { cn } from "@/lib/utils";

const NSE_COLORS = ["#00897B", "#FB8C00", "#5E35B1"];
const GENERO_COLORS = ["#e10599", "#1f3a5f", "#7c3aed"];
const CATEGORICAL_BAR_HEIGHT = 260;
/** Barras más estrechas sin reducir el ancho del contenedor del gráfico. */
const CATEGORICAL_BAR_MAX_SIZE = 64;
const CATEGORICAL_BAR_CATEGORY_GAP = "24%";
const TENDENCIA_PLOT_HEIGHT = 260;
const TENDENCIA_SCROLL_GUTTER = 18;
const TENDENCIA_CONTAINER_HEIGHT = TENDENCIA_PLOT_HEIGHT + TENDENCIA_SCROLL_GUTTER;
const TENDENCIA_VISIBLE_YEARS = 10;

function tendenciaYearWidth(containerWidth: number, isMobile: boolean): number {
  const min = isMobile ? 30 : 34;
  const max = isMobile ? 40 : 44;
  if (containerWidth <= 0) return max;
  const byViewport = Math.floor(containerWidth / TENDENCIA_VISIBLE_YEARS);
  return Math.min(max, Math.max(min, byViewport));
}

function tendenciaScrollWidth(
  dataLength: number,
  containerWidth: number,
  isMobile: boolean,
): number {
  if (dataLength <= 0) return containerWidth;
  const yearWidth = tendenciaYearWidth(containerWidth, isMobile);
  return Math.max(dataLength * yearWidth, containerWidth);
}

type MetricasNegocioCardProps = {
  data: MetricasNegocioResumen | null;
};

export function MetricasNegocioCard({ data }: MetricasNegocioCardProps) {
  return (
    <div className="rounded-xl border border-geo-border bg-geo-card p-4 shadow-sm sm:p-5">
      <div className="flex items-start gap-2">
        <Building2 className="mt-0.5 h-5 w-5 shrink-0 text-geo-pink" aria-hidden />
        <div className="min-w-0">
          <h3 className="font-semibold text-geo-navy">
            Métricas de negocio (metricas_alcaldia)
          </h3>
          <p className="mt-1 text-xs text-geo-muted">
            Cobertura, brecha y recintos culturales por alcaldía · fórmula SECTEI (paridad móvil)
          </p>
        </div>
      </div>

      {!data ? (
        <p className="mt-6 text-center text-sm text-geo-muted">
          Sin fila en metricas_alcaldia para el territorio y año seleccionados.
        </p>
      ) : (
        <div className="mt-5 grid grid-cols-3 gap-3">
          <KpiMini label="Cobertura" value={data.cobertura != null ? `${data.cobertura}%` : "—"} />
          <KpiMini label="Brecha" value={data.brecha != null ? `${data.brecha}%` : "—"} />
          <KpiMini label="Recintos" value={data.recintos.toLocaleString("es-MX")} />
        </div>
      )}

      {data && (
        <p className="mt-3 text-xs text-geo-muted">
          {data.esAgregadoCdmx ? "Agregado CDMX" : `Territorio: ${data.alcaldia}`}
        </p>
      )}
    </div>
  );
}

function KpiMini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-geo-border/70 bg-geo-surface/60 px-3 py-3 text-center">
      <p className="text-[11px] font-medium uppercase tracking-wide text-geo-muted">{label}</p>
      <p className="mt-1 text-xl font-bold tabular-nums text-geo-navy sm:text-2xl">{value}</p>
    </div>
  );
}

export type TendenciaInventarioModo = "acumulado" | "por_anio";

type TendenciaInventarioPanelProps = {
  tendencia: TendenciaInventarioView;
  modo: TendenciaInventarioModo;
  onModoChange: (modo: TendenciaInventarioModo) => void;
};

function TendenciaInventarioLineChart({
  data,
  containerWidth,
  modo,
  yAxisMax,
  yAxisTicks,
}: {
  data: TendenciaAsistenciaRow[];
  containerWidth: number;
  modo: TendenciaInventarioModo;
  yAxisMax: number;
  yAxisTicks: number[];
}) {
  const chart = useChartTheme();
  const isMobile = useMediaQuery("(max-width: 639px)");
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollWidth = tendenciaScrollWidth(data.length, containerWidth, isMobile);
  const scrollable = containerWidth > 0 && scrollWidth > containerWidth + 1;

  useEffect(() => {
    if (!scrollable || scrollRef.current == null) return;
    const node = scrollRef.current;
    const scrollToEnd = () => {
      node.scrollLeft = Math.max(0, node.scrollWidth - node.clientWidth);
    };
    scrollToEnd();
    requestAnimationFrame(scrollToEnd);
  }, [scrollable, data.length, containerWidth, modo]);

  const lineName = modo === "acumulado" ? "Total acumulado" : "Altas del año";
  const margin = isMobile
    ? { top: 8, right: 8, left: 0, bottom: 8 }
    : { top: 8, right: 12, left: 4, bottom: 8 };

  const lineChartBody = (
    <>
      <CartesianGrid strokeDasharray="3 3" stroke={chart.gridStroke} />
      <XAxis
        dataKey="mes"
        tick={{ fontSize: isMobile ? 9 : 10, fill: chart.tickFill }}
        interval={0}
        minTickGap={isMobile ? 12 : 8}
      />
      <YAxis
        tick={{ fontSize: 10, fill: chart.tickFill }}
        domain={[0, yAxisMax]}
        ticks={yAxisTicks}
        width={isMobile ? 36 : 40}
      />
      <Tooltip contentStyle={chart.tooltipStyle} />
      <Line
        type="monotone"
        dataKey="visitas"
        name={lineName}
        stroke={chart.seriesPrimary}
        strokeWidth={isMobile ? 2.5 : 2}
        dot={{ r: isMobile ? 2 : 3 }}
        activeDot={{ r: isMobile ? 4 : 5 }}
        isAnimationActive={!isMobile}
      />
    </>
  );

  if (containerWidth <= 0) return null;

  if (!scrollable) {
    return (
      <ResponsiveContainer width="100%" height={TENDENCIA_PLOT_HEIGHT} minWidth={containerWidth}>
        <LineChart data={data} margin={margin}>
          {lineChartBody}
        </LineChart>
      </ResponsiveContainer>
    );
  }

  return (
    <div
      ref={scrollRef}
      className="chart-h-scroll w-full"
      style={{ height: TENDENCIA_CONTAINER_HEIGHT }}
      tabIndex={0}
      role="region"
      aria-label="Gráfico de tendencia del inventario, desplázate horizontalmente"
    >
      <div style={{ width: scrollWidth }}>
        <LineChart
          width={scrollWidth}
          height={TENDENCIA_PLOT_HEIGHT}
          data={data}
          margin={margin}
        >
          {lineChartBody}
        </LineChart>
      </div>
    </div>
  );
}

export function TendenciaInventarioPanel({
  tendencia,
  modo,
  onModoChange,
}: TendenciaInventarioPanelProps) {
  const data = modo === "acumulado" ? tendencia.acumulado : tendencia.porAnio;
  const maxValue = Math.max(...data.map((row) => row.visitas), 1);
  const { max: yAxisMax, ticks: yAxisTicks } = computeNiceYAxis(maxValue);

  const descripcion =
    modo === "acumulado"
      ? `Territorio: ${tendencia.territorioLabel} · Vista acumulada: total de espacios al cierre de cada año.`
      : `Territorio: ${tendencia.territorioLabel} · Vista por año: altas o incorporaciones de ese año sin sumar anteriores.`;

  const scrollableHint =
    data.length > TENDENCIA_VISIBLE_YEARS + 2;

  return (
    <div className="min-w-0 rounded-xl border border-geo-border bg-geo-card p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-start gap-2">
          <TrendingUp className="mt-0.5 h-5 w-5 shrink-0 text-geo-pink" aria-hidden />
          <div className="min-w-0">
            <h3 className="font-semibold text-geo-navy">Tendencia del inventario cultural</h3>
            <p className="mt-1 text-xs text-geo-muted">Filtro activo: Territorio</p>
          </div>
        </div>
        {scrollableHint && tendencia.tieneDatos && (
          <p className="flex shrink-0 items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-geo-muted">
            <ChevronLeft className="h-3 w-3" aria-hidden />
            Desliza
            <ChevronRight className="h-3 w-3" aria-hidden />
          </p>
        )}
      </div>

      <div className="mt-4 inline-flex rounded-full border border-geo-border bg-geo-surface p-1">
        {(
          [
            ["acumulado", "Acumulado"],
            ["por_anio", "Por año"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => onModoChange(value)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-semibold transition",
              modo === value
                ? "bg-geo-pink text-white shadow-sm"
                : "text-geo-muted hover:text-geo-navy",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <p className="mt-3 text-xs leading-relaxed text-geo-muted">{descripcion}</p>

      {!tendencia.tieneDatos ? (
        <div
          className="flex items-center justify-center text-sm text-geo-muted"
          style={{ height: TENDENCIA_CONTAINER_HEIGHT }}
        >
          Sin datos de tendencia para este territorio.
        </div>
      ) : (
        <ClientChart height={TENDENCIA_CONTAINER_HEIGHT} className="mt-4 w-full min-w-0">
          {(width) => (
            <TendenciaInventarioLineChart
              data={data}
              containerWidth={width}
              modo={modo}
              yAxisMax={yAxisMax}
              yAxisTicks={yAxisTicks}
            />
          )}
        </ClientChart>
      )}
    </div>
  );
}

type ParticipacionNseChartPanelProps = {
  data: ParticipacionNseChart;
};

export function ParticipacionNseChartPanel({ data }: ParticipacionNseChartPanelProps) {
  const chart = useChartTheme();
  const chartData = data.etiquetas.map((etiqueta, index) => ({
    etiqueta,
    valor: data.valores[index] ?? 0,
  }));

  return (
    <div className="min-w-0 rounded-xl border border-geo-border bg-geo-card p-4 shadow-sm sm:p-5">
      <h3 className="font-semibold text-geo-navy">Indicadores por nivel socioeconómico</h3>
      <p className="mt-1 text-xs text-geo-muted">
        Porcentaje de participación cultural según nivel socioeconómico (tabla estadisticas).
      </p>

      {data.avisoFallbackGlobal && (
        <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950">
          No hay indicadores NSE segmentados por demarcación; se muestran valores globales de la
          base.
        </p>
      )}

      {!data.tieneDatos ? (
        <div className="flex h-[260px] items-center justify-center text-sm text-geo-muted">
          Sin datos NSE para los filtros actuales.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={CATEGORICAL_BAR_HEIGHT} minWidth={0} className="mt-4">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 8, left: -8, bottom: 0 }}
            barCategoryGap={CATEGORICAL_BAR_CATEGORY_GAP}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={chart.gridStroke} vertical={false} />
            <XAxis dataKey="etiqueta" tick={{ fontSize: 11, fill: chart.tickFill }} />
            <YAxis
              tick={{ fontSize: 10, fill: chart.tickFill }}
              domain={[0, data.maxY]}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip
              contentStyle={chart.tooltipStyle}
              formatter={(value) => [`${Number(value).toFixed(1)}%`, "Participación"]}
            />
            <Bar dataKey="valor" radius={[6, 6, 0, 0]} maxBarSize={CATEGORICAL_BAR_MAX_SIZE}>
              {chartData.map((_, index) => (
                <Cell key={chartData[index].etiqueta} fill={NSE_COLORS[index] ?? chart.seriesPrimary} />
              ))}
              <LabelList
                dataKey="valor"
                position="top"
                formatter={(value) => `${Number(value).toFixed(1)}%`}
                style={{ fontSize: 11, fill: chart.tickFill, fontWeight: 600 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

type MovilidadModoChartPanelProps = {
  data: MovilidadModoRow[];
};

export function MovilidadModoChartPanel({ data }: MovilidadModoChartPanelProps) {
  const chart = useChartTheme();
  const maxY = Math.max(...data.map((row) => row.minutosPromedio), 1) * 1.12;

  return (
    <div className="min-w-0 rounded-xl border border-geo-border bg-geo-card p-4 shadow-sm sm:p-5">
      <h3 className="font-semibold text-geo-navy">Movilidad: tiempo promedio por modo</h3>
      <p className="mt-1 text-xs text-geo-muted">
        Promedio de minutos por modo de transporte según el territorio seleccionado (RPC
        listar_movilidad_acceso).
      </p>

      {data.length === 0 ? (
        <div className="flex h-[260px] items-center justify-center text-sm text-geo-muted">
          Sin datos de movilidad para este filtro.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={260} minWidth={0} className="mt-4">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 8, right: 24, left: 8, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={chart.gridStroke} horizontal={false} />
            <XAxis
              type="number"
              domain={[0, maxY]}
              tick={{ fontSize: 10, fill: chart.tickFill }}
              tickFormatter={(value) => `${value} min`}
            />
            <YAxis
              type="category"
              dataKey="modoEtiqueta"
              width={108}
              tick={{ fontSize: 11, fill: chart.tickFill }}
            />
            <Tooltip
              contentStyle={chart.tooltipStyle}
              formatter={(value) => [`${Number(value).toFixed(1)} min`, "Promedio"]}
            />
            <Bar dataKey="minutosPromedio" fill={chart.seriesPrimary} radius={[0, 6, 6, 0]} maxBarSize={28}>
              <LabelList
                dataKey="minutosPromedio"
                position="right"
                formatter={(value) => `${Number(value).toFixed(1)} min`}
                style={{ fontSize: 11, fill: chart.tickFill, fontWeight: 600 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export type ParticipacionGeneroModo = "agregado" | "tipologia";

type ParticipacionGeneroAgregadoPanelProps = {
  data: ParticipacionGeneroAgregado;
  modo: ParticipacionGeneroModo;
  onModoChange: (modo: ParticipacionGeneroModo) => void;
  tipologiaSlot: ReactNode;
};

export function ParticipacionGeneroAgregadoPanel({
  data,
  modo,
  onModoChange,
  tipologiaSlot,
}: ParticipacionGeneroAgregadoPanelProps) {
  const chart = useChartTheme();
  const chartData = data.etiquetas.map((etiqueta, index) => ({
    etiqueta,
    valor: data.valores[index] ?? 0,
  }));

  return (
    <div className="min-w-0 rounded-xl border border-geo-border bg-geo-card p-4 shadow-sm sm:p-5">
      <h3 className="font-semibold text-geo-navy">Participación por Género</h3>
      <p className="mt-1 text-xs text-geo-muted">
        Datos de la tabla estadisticas · paridad app móvil
      </p>

      <div className="mt-4 inline-flex rounded-full border border-geo-border bg-geo-surface p-1">
        {(
          [
            ["agregado", "Agregado"],
            ["tipologia", "Por tipología"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => onModoChange(value)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-semibold transition",
              modo === value
                ? "bg-geo-pink text-white shadow-sm"
                : "text-geo-muted hover:text-geo-navy",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {modo === "agregado" ? (
        <>
          <p className="mt-3 text-xs text-geo-muted">
            Vista agregada: Mujeres, Hombres y Otros (incluye no binario y LGBTIQ+).
          </p>
          {!data.tieneDatos ? (
            <div className="flex h-[260px] items-center justify-center text-sm text-geo-muted">
              Sin datos de participación para los filtros actuales.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={CATEGORICAL_BAR_HEIGHT} minWidth={0} className="mt-4">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 8, left: -8, bottom: 0 }}
                barCategoryGap={CATEGORICAL_BAR_CATEGORY_GAP}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={chart.gridStroke} vertical={false} />
                <XAxis dataKey="etiqueta" tick={{ fontSize: 11, fill: chart.tickFill }} />
                <YAxis
                  tick={{ fontSize: 10, fill: chart.tickFill }}
                  domain={[0, data.maxY]}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip
                  contentStyle={chart.tooltipStyle}
                  formatter={(value) => [`${Number(value).toFixed(1)}%`, "Participación"]}
                />
                <Bar dataKey="valor" radius={[6, 6, 0, 0]} maxBarSize={CATEGORICAL_BAR_MAX_SIZE}>
                  {chartData.map((_, index) => (
                    <Cell
                      key={chartData[index].etiqueta}
                      fill={GENERO_COLORS[index] ?? chart.seriesPrimary}
                    />
                  ))}
                  <LabelList
                    dataKey="valor"
                    position="top"
                    formatter={(value) => `${Number(value).toFixed(1)}%`}
                    style={{ fontSize: 11, fill: chart.tickFill, fontWeight: 600 }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </>
      ) : (
        <div className="mt-4">{tipologiaSlot}</div>
      )}
    </div>
  );
}

export type { TendenciaAsistenciaRow };
