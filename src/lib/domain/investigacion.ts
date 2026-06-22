export type TipoRecurso = "Entrevista" | "Encuesta" | "Grupo focal";

export type TipoRecursoDb = "entrevista" | "encuesta" | "grupo_focal";

export type TranscripcionRol = "Investigador" | "Informante";

export type TranscripcionBloque = {
  rol: TranscripcionRol;
  texto: string;
};

export type RecursoCualitativo = {
  id: string;
  tipo: TipoRecurso;
  fecha: string;
  titulo: string;
  alcaldia: string;
  snippet: string;
  verificado: boolean;
  digitalizado: boolean;
  investigador: string;
  fechaDetalle: string;
  resumen: string;
  transcripcion: TranscripcionBloque[];
  lat: number | null;
  lng: number | null;
};

export type RecursoCualitativoListItem = Pick<
  RecursoCualitativo,
  | "id"
  | "tipo"
  | "fecha"
  | "titulo"
  | "alcaldia"
  | "snippet"
  | "verificado"
  | "digitalizado"
  | "lat"
  | "lng"
>;

export type InvestigacionListQuery = {
  q: string;
  tipo: TipoRecurso | "todos";
  alcaldia: string;
  page: number;
  pageSize: number;
};

export type InvestigacionPagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  totalCatalogo: number;
};

export type InvestigacionKpi = {
  label: string;
  value: string;
  accent: "navy" | "pink";
};

export type InvestigacionDataSource = "supabase" | "mock";

export type InvestigacionPageData = {
  investigacionKpis: InvestigacionKpi[];
  recursosCualitativos: RecursoCualitativoListItem[];
  alcaldiasOpciones: string[];
  pagination: InvestigacionPagination;
  dataSource: InvestigacionDataSource;
  dataSourceNote: string;
};
