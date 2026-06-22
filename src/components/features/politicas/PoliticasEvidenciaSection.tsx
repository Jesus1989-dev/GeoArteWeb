"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ClientChart } from "@/components/shared/ClientChart";
import { CheckCircle2, ChevronLeft, ChevronRight, Clock, Filter, LineChart } from "lucide-react";
import type { BrechaInversionAlcaldiaRow, FiltroObjetivoId } from "@/lib/domain/politicas";
import type { PoliticasPageData } from "@/lib/services/politicas.service";
import { useChartTheme } from "@/hooks/use-chart-theme";
import { cn } from "@/lib/utils";

const CHART_HEIGHT = 300;
/** Ancho mínimo por alcaldía para permitir scroll horizontal. */
const SLOT_WIDTH_PX = 76;

type PoliticasEvidenciaSectionProps = {
  contenido: PoliticasPageData["evidenciaDiagnosticoContenido"];
  brechaInversionAlcaldias: PoliticasPageData["brechaInversionAlcaldias"];
  filtrosObjetivo: PoliticasPageData["filtrosObjetivo"];
  filtroObjetivo: FiltroObjetivoId;
  onFiltroObjetivoChange: (id: FiltroObjetivoId) => void;
  recomendacionesVisibles: number;
};

type TooltipPayload = {
  payload?: BrechaInversionAlcaldiaRow;
};

function BrechaChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
}) {
  if (!active || !payload?.[0]?.payload) return null;
  const row = payload[0].payload;

  return (
    <div className="rounded-lg border border-geo-border bg-white px-3 py-2 text-xs shadow-md">
      <p className="font-semibold text-geo-navy">
        {row.alcaldiaCompleta ?? row.alcaldia}
      </p>
      <p className="mt-1 text-geo-muted">
        Déficit: <span className="font-medium text-geo-pink">{row.deficit}%</span>
      </p>
      <p className="text-geo-muted">
        Cobertura cultural:{" "}
        <span className="font-medium text-geo-navy">{row.presupuesto}%</span>
      </p>
    </div>
  );
}

export function PoliticasEvidenciaSection({
  contenido,
  brechaInversionAlcaldias,
  filtrosObjetivo,
  filtroObjetivo,
  onFiltroObjetivoChange,
  recomendacionesVisibles,
}: PoliticasEvidenciaSectionProps) {
  const chart = useChartTheme();
  const chartData = useMemo(
    () => [...brechaInversionAlcaldias],
    [brechaInversionAlcaldias],
  );
  const parrafoParts = contenido.parrafo.split(contenido.highlight);

  const chartInnerWidth = useMemo(
    () => Math.max(chartData.length * SLOT_WIDTH_PX, 320),
    [chartData.length],
  );

  const scrollable = chartData.length > 6;

  return (
    <section className="space-y-6">
      <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
        <div>
          <h2 className="text-xl font-bold text-geo-navy sm:text-2xl">
            {contenido.titulo}
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-geo-muted sm:text-base">
            {parrafoParts[0]}
            <span className="font-semibold text-geo-pink">
              {contenido.highlight}
            </span>
            {parrafoParts[1]}
          </p>

          <ul className="mt-6 space-y-4">
            <li className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="h-4 w-4" strokeWidth={2.5} aria-hidden />
              </span>
              <p className="text-sm leading-relaxed text-geo-muted">
                <span className="font-semibold text-geo-navy">Meta 2025:</span>{" "}
                {contenido.meta2025}
              </p>
            </li>
            <li className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-geo-pink/15 text-geo-pink">
                <Clock className="h-4 w-4" strokeWidth={2.5} aria-hidden />
              </span>
              <p className="text-sm leading-relaxed text-geo-muted">
                <span className="font-semibold text-geo-navy">Urgencia:</span>{" "}
                {contenido.urgencia}
              </p>
            </li>
          </ul>
        </div>

        <div className="min-w-0 rounded-xl border border-geo-border bg-geo-card p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <LineChart className="h-4 w-4 shrink-0 text-geo-pink" strokeWidth={2} />
              <div>
                <h3 className="text-sm font-semibold text-geo-navy">
                  Brecha de Infraestructura vs. Cobertura Cultural por Alcaldía
                </h3>
                <p className="mt-0.5 text-xs text-geo-muted">
                  {chartData.length} alcaldías · ordenadas por brecha
                </p>
              </div>
            </div>
            {scrollable && (
              <p className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-geo-muted">
                <ChevronLeft className="h-3 w-3" aria-hidden />
                Desliza
                <ChevronRight className="h-3 w-3" aria-hidden />
              </p>
            )}
          </div>

          <div
            className={cn(
              "mt-4",
              scrollable && "overflow-x-auto overscroll-x-contain pb-2",
            )}
            tabIndex={scrollable ? 0 : undefined}
            role={scrollable ? "region" : undefined}
            aria-label={
              scrollable
                ? "Gráfico de brecha por alcaldía, desplázate horizontalmente"
                : undefined
            }
          >
            <div
              className="shrink-0"
              style={{ width: chartInnerWidth, minWidth: "100%" }}
            >
              <ClientChart height={CHART_HEIGHT} className="w-full min-w-0">
                <BarChart
                  width={chartInnerWidth}
                  height={CHART_HEIGHT}
                  data={chartData}
                  margin={{ top: 8, right: 12, left: -4, bottom: 4 }}
                >
                  <CartesianGrid
                    strokeDasharray="4 4"
                    stroke={chart.gridStroke}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="alcaldia"
                    tick={{ fontSize: 10, fill: chart.tickFill }}
                    interval={0}
                    angle={-32}
                    textAnchor="end"
                    height={56}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    ticks={[0, 25, 50, 75, 100]}
                    tick={{ fontSize: 10, fill: chart.tickFill }}
                    axisLine={false}
                    tickLine={false}
                    width={32}
                  />
                  <Tooltip content={<BrechaChartTooltip />} />
                  <Legend
                    wrapperStyle={{ fontSize: "12px", paddingTop: "4px", color: chart.tickFill }}
                    formatter={(value) => (
                      <span className="text-geo-muted">{value}</span>
                    )}
                  />
                  <Bar
                    dataKey="deficit"
                    name="Déficit de Infraestructura"
                    fill={chart.seriesSecondary}
                    radius={[4, 4, 0, 0]}
                    maxBarSize={24}
                  />
                  <Bar
                    dataKey="presupuesto"
                    name="Cobertura cultural"
                    fill={chart.seriesPrimary}
                    radius={[4, 4, 0, 0]}
                    maxBarSize={24}
                  />
                </BarChart>
              </ClientChart>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 border-t border-geo-border pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex shrink-0 items-center gap-2 text-sm font-medium text-geo-navy">
            <Filter className="h-4 w-4 text-geo-pink" strokeWidth={2} />
            Filtrar por Objetivo:
          </div>
          <div className="flex flex-wrap gap-2">
            {filtrosObjetivo.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => onFiltroObjetivoChange(f.id)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  filtroObjetivo === f.id
                    ? "border-geo-navy bg-geo-navy text-white"
                    : "border-geo-border bg-white text-geo-navy hover:border-geo-pink/40",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
        <p className="shrink-0 text-sm text-geo-muted">
          Mostrando{" "}
          <span className="font-semibold text-geo-navy">
            {recomendacionesVisibles}
          </span>{" "}
          recomendaciones estratégicas
        </p>
      </div>
    </section>
  );
}
