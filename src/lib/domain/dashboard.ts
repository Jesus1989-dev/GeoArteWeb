import type { KpiAccent, KpiIcon } from "@/components/features/dashboard/DashboardKpiCard";

export type DashboardKpi = {
  label: string;
  value: string;
  delta: string;
  deltaPositive: boolean;
  accent: KpiAccent;
  icon: KpiIcon;
};

export type ParticipacionGeneroRow = {
  disciplina: string;
  hombres: number;
  mujeres: number;
  otros: number;
};

/** Tipologías SIC con serie de participación por género en Supabase (padrón SECTEI). */
export const PARTICIPACION_GENERO_MAX_TIPOLOGIAS = 12;

/** Segmentos visibles en el gráfico de distribución por tipología. */
export const DISTRIBUCION_TIPOLOGIA_MAX_SLICES = 12;

export type TendenciaAsistenciaRow = {
  mes: string;
  visitas: number;
  eventos: number;
};

export type DensidadInfraRow = {
  zona: string;
  valor: number;
};

export type DistribucionTipologiaRow = {
  name: string;
  value: number;
  color: string;
};

import type { EstadoEspacio } from "@/lib/domain/admin";

export type EspacioTablaRow = {
  id: string;
  nombre: string;
  alcaldia: string;
  /** Índice de completitud del registro en padrón (0–100). */
  completitud: number;
  estado: EstadoEspacio;
  lat: number | null;
  lng: number | null;
};

export type ComparadorMetricaRow = {
  label: string;
  a: number;
  b: number;
};

export type MetricaAlcaldiaResumen = {
  cantidadEspacios: number;
  porcentajeCobertura: number;
  porcentajeBrecha: number;
};

export type EstadisticaRow = {
  id: string;
  titulo: string;
  categoria: string | null;
  valor: number;
  unidad: string | null;
  anio: number | null;
  alcaldia_id: string | null;
  disciplina_nombre: string | null;
  tipo_espacio_sic: string | null;
  segmento_nse: string | null;
};
