import type { DistribucionTipologiaRow } from "@/lib/domain/dashboard";
import { DISTRIBUCION_TIPOLOGIA_MAX_SLICES } from "@/lib/domain/dashboard";

export const TIPOLOGIA_CHART_COLORS = [
  "#1f3a5f",
  "#e10599",
  "#3b82f6",
  "#64748b",
  "#0ea5e9",
  "#f59e0b",
  "#10b981",
  "#8b5cf6",
  "#ef4444",
  "#14b8a6",
  "#f97316",
  "#6366f1",
] as const;

export function buildDistribucionTipologiaRows(
  counts: Map<string, number>,
): DistribucionTipologiaRow[] {
  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  const top = sorted.slice(0, DISTRIBUCION_TIPOLOGIA_MAX_SLICES);
  const rest = sorted.slice(DISTRIBUCION_TIPOLOGIA_MAX_SLICES).reduce((s, [, n]) => s + n, 0);
  const slices = rest > 0 ? [...top, ["Otros", rest] as const] : top;

  return slices.map(([name, value], i) => ({
    name,
    value,
    color: TIPOLOGIA_CHART_COLORS[i % TIPOLOGIA_CHART_COLORS.length],
  }));
}

export function buildDistribucionFromEspaciosRows(
  espacios: Array<{ tipo: string }>,
): DistribucionTipologiaRow[] {
  const counts = new Map<string, number>();
  for (const e of espacios) {
    const tipo = e.tipo.trim() || "Sin clasificar";
    counts.set(tipo, (counts.get(tipo) ?? 0) + 1);
  }
  return buildDistribucionTipologiaRows(counts);
}
