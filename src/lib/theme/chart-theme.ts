import type { CSSProperties } from "react";
import type { ResolvedTheme } from "@/lib/theme/theme";

/** Paleta Recharts alineada con la marca GEO ARTE (claro / oscuro). */
export type ChartTheme = {
  gridStroke: string;
  tickFill: string;
  tooltipStyle: CSSProperties;
  /** Barras y líneas principales — navy institucional. */
  seriesPrimary: string;
  /** Segunda serie — rosa institucional. */
  seriesSecondary: string;
  /** Tercera serie / neutro. */
  seriesMuted: string;
  /** Color base para gradientes de área. */
  areaFill: string;
  /** Etiquetas de valor (% en barras, etc.). */
  labelFill: string;
};

export function getChartTheme(resolved: ResolvedTheme): ChartTheme {
  const dark = resolved === "dark";
  return {
    gridStroke: dark ? "#334155" : "#e2e8f0",
    tickFill: dark ? "#94a3b8" : "#64748b",
    tooltipStyle: {
      borderRadius: "8px",
      border: `1px solid ${dark ? "#334155" : "#e2e8f0"}`,
      fontSize: "12px",
      backgroundColor: dark ? "#1e293b" : "#ffffff",
      color: dark ? "#e2e8f0" : "#1e293b",
    },
    seriesPrimary: dark ? "#5b8fd4" : "#1f3a5f",
    seriesSecondary: dark ? "#f472b6" : "#e10599",
    seriesMuted: dark ? "#64748b" : "#7c9ab8",
    areaFill: dark ? "#5b8fd4" : "#1f3a5f",
    labelFill: dark ? "#e2e8f0" : "#475569",
  };
}
