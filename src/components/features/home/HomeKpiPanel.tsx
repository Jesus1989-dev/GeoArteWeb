"use client";

import { useMemo, useState } from "react";
import { ChevronDown, MapPin, RefreshCw } from "lucide-react";
import { StatCard } from "@/components/shared/StatCard";
import { homeStatIcons } from "@/lib/data/mock/home";
import type { HomeKpiPorAlcaldia } from "@/lib/home/home-kpi-stats";
import type { HomeStatItem } from "@/lib/domain/home";
import { cn } from "@/lib/utils";

const TODA_CDMX = "";

type HomeKpiPanelProps = {
  globalStats: HomeStatItem[];
  kpiPorAlcaldia: HomeKpiPorAlcaldia[];
  dataSource?: "supabase" | "mock";
  refreshing?: boolean;
  onRefresh?: () => void;
};

export function HomeKpiPanel({
  globalStats,
  kpiPorAlcaldia,
  dataSource,
  refreshing = false,
  onRefresh,
}: HomeKpiPanelProps) {
  const [alcaldia, setAlcaldia] = useState(TODA_CDMX);

  const opciones = useMemo(
    () => kpiPorAlcaldia.map((row) => row.alcaldia).sort((a, b) => a.localeCompare(b, "es")),
    [kpiPorAlcaldia],
  );

  const stats = useMemo(() => {
    if (!alcaldia) return globalStats;
    return kpiPorAlcaldia.find((row) => row.alcaldia === alcaldia)?.stats ?? globalStats;
  }, [alcaldia, globalStats, kpiPorAlcaldia]);

  const mostrarSelector = opciones.length > 0;

  return (
    <div>
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
        {mostrarSelector && (
          <div className="relative w-full sm:mr-auto sm:max-w-[14rem]">
            <label htmlFor="home-kpi-alcaldia" className="sr-only">
              Ver KPIs por alcaldía
            </label>
            <MapPin
              className="pointer-events-none absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-geo-muted"
              aria-hidden
            />
            <select
              id="home-kpi-alcaldia"
              value={alcaldia}
              onChange={(e) => setAlcaldia(e.target.value)}
              className="w-full appearance-none rounded-lg border border-geo-border bg-white py-2 pl-7 pr-7 text-xs font-medium text-geo-navy transition-colors hover:border-geo-pink focus:border-geo-pink focus:outline-none focus:ring-1 focus:ring-geo-pink/30 sm:py-1.5 sm:text-[10px]"
            >
              <option value={TODA_CDMX}>Toda la CDMX</option>
              {opciones.map((nombre) => (
                <option key={nombre} value={nombre}>
                  {nombre}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-geo-muted"
              aria-hidden
            />
          </div>
        )}
        {dataSource === "supabase" && (
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-medium text-emerald-800">
            Supabase
          </span>
        )}
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-1 rounded-lg border border-geo-border bg-white px-2.5 py-1 text-[10px] font-medium text-geo-muted transition-colors hover:border-geo-pink hover:text-geo-navy disabled:opacity-60"
            aria-label="Actualizar indicadores"
          >
            <RefreshCw
              className={cn("h-3 w-3", refreshing && "animate-spin")}
              strokeWidth={2}
            />
            {refreshing ? "Actualizando…" : "Actualizar"}
          </button>
        )}
      </div>
      {alcaldia ? (
        <p className="mb-2 text-[10px] font-medium text-geo-muted">
          Indicadores de <span className="text-geo-navy">{alcaldia}</span>
        </p>
      ) : null}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {stats.map((stat) => (
          <StatCard
            key={`${alcaldia || "cdmx"}-${stat.label}`}
            icon={homeStatIcons[stat.iconKey]}
            value={stat.value}
            label={stat.label}
            description={stat.description}
          />
        ))}
      </div>
    </div>
  );
}
