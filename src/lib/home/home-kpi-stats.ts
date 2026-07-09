import type { HomeStatItem } from "@/lib/domain/home";
import { resolveTotalEspaciosPadron } from "@/lib/espacios/padron-count";

type ConteoRow = { nombre: string; total: number };
type MetricaRow = {
  alcaldia_nombre?: string | null;
  cantidad_espacios?: number | null;
  porcentaje_cobertura?: number | null;
};
type EstadisticaRow = { titulo?: string; categoria?: string; valor?: number };

export type HomeKpiPorAlcaldia = {
  alcaldia: string;
  stats: HomeStatItem[];
};

function norm(s: string): string {
  return s.trim().toLowerCase();
}

function matchesAlcaldia(a: string, b: string): boolean {
  const x = norm(a);
  const y = norm(b);
  if (!x || !y) return false;
  return x === y || x.includes(y) || y.includes(x);
}

function formatNumber(n: number): string {
  return n.toLocaleString("es-MX");
}

function formatPercent(n: number): string {
  return `${(Math.round(n * 10) / 10).toFixed(1)}%`;
}

function valorResumen(
  rows: EstadisticaRow[],
  titulo: string,
  fallback: number,
): number {
  const match =
    rows.find((r) => r.categoria === "Resumen" && r.titulo === titulo) ??
    rows.find((r) => r.titulo === titulo);
  return match?.valor ?? fallback;
}

function findConteo(conteo: ConteoRow[], alcaldia: string): ConteoRow | undefined {
  return (
    conteo.find((row) => row.nombre === alcaldia) ??
    conteo.find((row) => matchesAlcaldia(row.nombre, alcaldia))
  );
}

function findMetrica(metricas: MetricaRow[], alcaldia: string): MetricaRow | undefined {
  return (
    metricas.find((row) => String(row.alcaldia_nombre ?? "").trim() === alcaldia) ??
    metricas.find((row) => matchesAlcaldia(String(row.alcaldia_nombre ?? ""), alcaldia))
  );
}

function resolveCoberturaPercent(metrica: MetricaRow | undefined, fallback: number): number {
  const raw = Number(metrica?.porcentaje_cobertura) || fallback;
  if (raw > 0 && raw <= 1) return raw * 100;
  return raw;
}

export function buildHomeStats(input: {
  estadisticas: EstadisticaRow[];
  conteo: ConteoRow[];
  metricas: MetricaRow[];
  totalAlcaldias: number;
  anioCorte: number;
  totalEspaciosPadron: number;
  /** Si se indica, los KPIs reflejan solo esa demarcación. */
  alcaldiaSeleccionada?: string;
}): HomeStatItem[] {
  const {
    estadisticas,
    conteo,
    metricas,
    totalAlcaldias,
    anioCorte,
    totalEspaciosPadron,
    alcaldiaSeleccionada,
  } = input;
  const periodo = `${anioCorte - 1}-${anioCorte}`;

  if (alcaldiaSeleccionada) {
    const rowConteo = findConteo(conteo, alcaldiaSeleccionada);
    const rowMetrica = findMetrica(metricas, alcaldiaSeleccionada);
    const espaciosDesdeMetrica = Number(rowMetrica?.cantidad_espacios) || 0;
    const totalEspacios = rowConteo?.total ?? espaciosDesdeMetrica;
    const cobertura = resolveCoberturaPercent(rowMetrica, 0);

    return [
      {
        iconKey: "building",
        value: formatNumber(totalEspacios),
        label: "Total Espacios",
        description: `Infraestructura en ${alcaldiaSeleccionada}`,
      },
      {
        iconKey: "map",
        value: "1 / 16",
        label: "Alcaldías",
        description: alcaldiaSeleccionada,
      },
      {
        iconKey: "layers",
        value: formatPercent(cobertura),
        label: "Cobertura",
        description: "Índice de accesibilidad en la demarcación",
      },
      {
        iconKey: "calendar",
        value: periodo,
        label: "Periodo",
        description: "Última actualización de datos",
      },
    ];
  }

  const totalEspacios = resolveTotalEspaciosPadron(totalEspaciosPadron);

  const alcaldiasConMetricas = new Set(
    metricas
      .map((row) => String(row.alcaldia_nombre ?? "").trim())
      .filter(Boolean),
  ).size;
  const alcaldiasConEspaciosRpc = conteo.filter((row) => row.total > 0).length;
  const alcaldiasCubiertas =
    alcaldiasConMetricas > 0 ? alcaldiasConMetricas : alcaldiasConEspaciosRpc;

  const coberturaDesdeMetricas =
    metricas.length > 0
      ? metricas.reduce((sum, row) => sum + (Number(row.porcentaje_cobertura) || 0), 0) /
        metricas.length
      : null;
  const coberturaResumen = valorResumen(estadisticas, "Cobertura", 0);
  const coberturaPromedio =
    coberturaResumen > 0
      ? coberturaResumen
      : coberturaDesdeMetricas != null && coberturaDesdeMetricas > 0 && coberturaDesdeMetricas <= 1
        ? coberturaDesdeMetricas * 100
        : (coberturaDesdeMetricas ?? 0);

  return [
    {
      iconKey: "building",
      value: formatNumber(totalEspacios),
      label: "Total Espacios",
      description: "Registros en el padrón SECTEI",
    },
    {
      iconKey: "map",
      value: `${alcaldiasCubiertas} / ${totalAlcaldias}`,
      label: "Alcaldías",
      description: "Cobertura total del territorio CDMX",
    },
    {
      iconKey: "layers",
      value: formatPercent(coberturaPromedio),
      label: "Cobertura Prom.",
      description: "Índice de accesibilidad promedio",
    },
    {
      iconKey: "calendar",
      value: periodo,
      label: "Periodo",
      description: "Última actualización de datos",
    },
  ];
}

export function buildHomeKpiPorAlcaldia(input: {
  estadisticas: EstadisticaRow[];
  conteo: ConteoRow[];
  metricas: MetricaRow[];
  alcaldias: string[];
  totalAlcaldias: number;
  anioCorte: number;
  totalEspaciosPadron: number;
}): HomeKpiPorAlcaldia[] {
  const { alcaldias, ...rest } = input;
  return alcaldias.map((alcaldia) => ({
    alcaldia,
    stats: buildHomeStats({ ...rest, alcaldiaSeleccionada: alcaldia }),
  }));
}
