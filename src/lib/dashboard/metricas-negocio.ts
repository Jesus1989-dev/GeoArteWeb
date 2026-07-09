import type { MetricaAlcaldiaResumen, MetricasNegocioResumen } from "@/lib/domain/dashboard";

function norm(s: string): string {
  return s.trim().toLowerCase();
}

function matchesLoose(a: string, b: string): boolean {
  const x = norm(a);
  const y = norm(b);
  if (!x || !y) return false;
  return x === y || x.includes(y) || y.includes(x);
}

function resolveMetricaAlcaldia(
  metricasPorAlcaldia: Record<string, MetricaAlcaldiaResumen>,
  alcaldia: string,
): MetricaAlcaldiaResumen | null {
  if (metricasPorAlcaldia[alcaldia]) return metricasPorAlcaldia[alcaldia];
  const key = Object.keys(metricasPorAlcaldia).find((nombre) =>
    matchesLoose(nombre, alcaldia),
  );
  return key ? metricasPorAlcaldia[key] : null;
}

export function buildMetricasNegocioResumen(
  metricasPorAlcaldia: Record<string, MetricaAlcaldiaResumen>,
  alcaldia: string,
): MetricasNegocioResumen | null {
  const entries = Object.entries(metricasPorAlcaldia);
  if (entries.length === 0) return null;

  if (alcaldia === "Todas") {
    const totalRecintos = entries.reduce((sum, [, m]) => sum + m.cantidadEspacios, 0);
    const coberturas = entries.map(([, m]) => m.porcentajeCobertura);
    const brechas = entries.map(([, m]) => m.porcentajeBrecha);
    const avgCob =
      coberturas.length > 0
        ? coberturas.reduce((sum, value) => sum + value, 0) / coberturas.length
        : null;
    const avgBre =
      brechas.length > 0
        ? brechas.reduce((sum, value) => sum + value, 0) / brechas.length
        : null;

    return {
      alcaldia: "Toda la CDMX",
      cobertura: avgCob != null ? Math.round(avgCob) : null,
      brecha: avgBre != null ? Math.round(avgBre) : null,
      recintos: totalRecintos,
      esAgregadoCdmx: true,
    };
  }

  const metrica = resolveMetricaAlcaldia(metricasPorAlcaldia, alcaldia);
  if (!metrica) return null;

  return {
    alcaldia,
    cobertura: Math.round(metrica.porcentajeCobertura),
    brecha: Math.round(metrica.porcentajeBrecha),
    recintos: metrica.cantidadEspacios,
    esAgregadoCdmx: false,
  };
}
