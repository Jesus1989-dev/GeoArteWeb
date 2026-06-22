"use client";

import { useMemo } from "react";
import { useTheme } from "@/contexts/ThemeProvider";
import { getChartTheme, type ChartTheme } from "@/lib/theme/chart-theme";

export function useChartTheme(): ChartTheme {
  const { resolved } = useTheme();
  return useMemo(() => getChartTheme(resolved), [resolved]);
}
