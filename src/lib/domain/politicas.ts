export type PoliticasHeroStatIcon = "zap" | "users" | "dollar" | "mapPin";

export type PoliticasHeroStat = {
  icon: PoliticasHeroStatIcon;
  value: string;
  label: string;
  sublabel: string;
};

export type PoliticasHero = {
  badge: string;
  tituloLinea1: string;
  tituloLinea2: string;
  descripcion: string;
};

export type BrechaInversionAlcaldiaRow = {
  /** Etiqueta en el eje X (puede estar abreviada). */
  alcaldia: string;
  /** Nombre completo para tooltip al desplazar el gráfico. */
  alcaldiaCompleta?: string;
  deficit: number;
  presupuesto: number;
};

export type EvidenciaDiagnosticoContenido = {
  titulo: string;
  parrafo: string;
  highlight: string;
  meta2025: string;
  urgencia: string;
};

export type FiltroObjetivoId =
  | "todos"
  | "genero"
  | "periferias"
  | "digitalizacion"
  | "economia";

export type FiltroObjetivo = {
  id: FiltroObjetivoId;
  label: string;
};

export type PrioridadAccion = "Prioridad Alta" | "Prioridad Media" | "Prioridad Baja";

export type AccionEstrategica = {
  id: string;
  titulo: string;
  prioridad: PrioridadAccion;
  costoNivel: 1 | 2 | 3;
  alcaldia: string;
  descripcion: string;
  /** Descripción cualitativa del impacto (UI). */
  impacto: string;
  /** Ciudadanos beneficiados — columna `impacto_ciudadanos` en Supabase. */
  impactoCiudadanos: number | null;
  /** Presupuesto en MXN — columna `presupuesto_mxn` en Supabase. */
  presupuestoMxn: number | null;
};

export type SeccionRecomendacionesIcon = "zap" | "mapPin";

export type SeccionRecomendaciones = {
  id: Exclude<FiltroObjetivoId, "todos">;
  titulo: string;
  icon: SeccionRecomendacionesIcon;
  subtitulo: string;
  acciones: AccionEstrategica[];
};

export type PoliticasCta = {
  titulo: string;
  descripcion: string;
  boton: string;
  href: string;
};

export type PoliticasDataSource = "supabase" | "mock";
