import type { MetricaAlcaldiaResumen } from "@/lib/domain/dashboard";
import type { EspacioPadronExportRow } from "@/lib/dashboard/padron-export";

export type AlcaldiaKpiDetalleRow = {
  alcaldia: string;
  espaciosSectei: number | null;
  espaciosEnFiltro: number;
  coberturaPorcentaje: number | null;
  brechaPorcentaje: number | null;
  tipologiasEnFiltro: number;
};

function norm(s: string): string {
  return s.trim().toLowerCase();
}

function matchesLoose(a: string, b: string): boolean {
  const x = norm(a);
  const y = norm(b);
  if (!x || !y) return false;
  return x === y || x.includes(y) || y.includes(x);
}

function findMetrica(
  metricasPorAlcaldia: Record<string, MetricaAlcaldiaResumen>,
  alcaldia: string,
): MetricaAlcaldiaResumen | undefined {
  if (metricasPorAlcaldia[alcaldia]) return metricasPorAlcaldia[alcaldia];
  const key = Object.keys(metricasPorAlcaldia).find((k) => matchesLoose(k, alcaldia));
  return key ? metricasPorAlcaldia[key] : undefined;
}

function findConteoRpc(
  conteoPorAlcaldia: Record<string, number> | undefined,
  alcaldia: string,
): number | undefined {
  if (!conteoPorAlcaldia) return undefined;
  if (conteoPorAlcaldia[alcaldia] != null) return conteoPorAlcaldia[alcaldia];
  const key = Object.keys(conteoPorAlcaldia).find((k) => matchesLoose(k, alcaldia));
  return key != null ? conteoPorAlcaldia[key] : undefined;
}

/** Detalle KPI por demarcación (Supabase metricas_alcaldia + padrón filtrado). */
export function buildAlcaldiasKpiDetalle(input: {
  metricasPorAlcaldia: Record<string, MetricaAlcaldiaResumen>;
  conteoPorAlcaldia?: Record<string, number>;
  padronRows: EspacioPadronExportRow[];
  /** Solo aplica con territorio «Todas» (toda la CDMX). */
  incluirDesgloseCiudad: boolean;
}): AlcaldiaKpiDetalleRow[] {
  if (!input.incluirDesgloseCiudad) return [];

  const { metricasPorAlcaldia, conteoPorAlcaldia, padronRows } = input;

  const padronCount = new Map<string, number>();
  const tipologias = new Map<string, Set<string>>();

  for (const row of padronRows) {
    padronCount.set(row.alcaldia, (padronCount.get(row.alcaldia) ?? 0) + 1);
    if (row.tipologia.trim()) {
      const set = tipologias.get(row.alcaldia) ?? new Set<string>();
      set.add(row.tipologia.trim());
      tipologias.set(row.alcaldia, set);
    }
  }

  const nombres = new Set<string>([
    ...Object.keys(metricasPorAlcaldia),
    ...Object.keys(conteoPorAlcaldia ?? {}),
    ...padronCount.keys(),
  ]);

  return [...nombres]
    .sort((a, b) => a.localeCompare(b, "es"))
    .map((alcaldia) => {
      const metrica = findMetrica(metricasPorAlcaldia, alcaldia);
      const rpc = findConteoRpc(conteoPorAlcaldia, alcaldia);
      const espaciosSectei =
        metrica?.cantidadEspacios ?? rpc ?? (padronCount.get(alcaldia) ?? null);

      return {
        alcaldia,
        espaciosSectei: espaciosSectei ?? null,
        espaciosEnFiltro: padronCount.get(alcaldia) ?? 0,
        coberturaPorcentaje: metrica?.porcentajeCobertura ?? null,
        brechaPorcentaje: metrica?.porcentajeBrecha ?? null,
        tipologiasEnFiltro: tipologias.get(alcaldia)?.size ?? 0,
      };
    });
}

export function alcaldiaKpiDetalleToRecord(row: AlcaldiaKpiDetalleRow) {
  return {
    alcaldia: row.alcaldia,
    espacios_sectei: row.espaciosSectei,
    espacios_en_filtro: row.espaciosEnFiltro,
    cobertura_porcentaje: row.coberturaPorcentaje,
    brecha_porcentaje: row.brechaPorcentaje,
    tipologias_en_filtro: row.tipologiasEnFiltro,
  };
}
