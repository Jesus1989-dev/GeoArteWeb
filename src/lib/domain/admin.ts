import type { RolPerfil } from "@/lib/data/mock/perfil";
import type { TipoRecursoDb, TranscripcionBloque } from "@/lib/domain/investigacion";
import type { FiltroObjetivoId, PrioridadAccion } from "@/lib/domain/politicas";

export type EstadoEspacio = "Publicado" | "Revisión" | "Borrador";

export type AdminEspacioRow = {
  /** Prefijo corto para la tabla (8 caracteres del UUID). */
  id: string;
  /** UUID completo para operaciones CRUD. */
  fullId: string;
  nombre: string;
  alcaldia: string;
  tipo: string;
  estado: EstadoEspacio;
  ultimaModif: string;
  direccion?: string;
  horario?: string;
  telefono?: string;
  latitud?: number | null;
  longitud?: number | null;
  descripcion?: string;
};

export type AdminEspacioFormInput = {
  nombre: string;
  direccion?: string;
  alcaldia: string;
  tipo?: string;
  horario?: string;
  telefono?: string;
  latitud?: number | null;
  longitud?: number | null;
  descripcion?: string;
};

export type AdminCapaSigRow = {
  /** Prefijo corto para la tabla (8 caracteres del UUID). */
  id: string;
  /** UUID completo para operaciones CRUD. */
  fullId: string;
  nombre: string;
  descripcion: string;
  formato: string;
  estado: "Activa" | "Revisión" | "Borrador";
  actualizacion: string;
  orden: number;
  espaciosVinculados: number;
};

export type AdminCapaFormInput = {
  nombre: string;
  descripcion?: string;
  orden: number;
};

export type AdminValidacionMetrica = {
  orden: number;
  metrica: string;
  valor: string;
  afecta_a: string;
};

export type AdminKpi = {
  label: string;
  value: string;
  descripcion: string;
  tendencia: string | null;
  tendenciaPositiva: boolean | null;
  icon: "building" | "alert" | "layers" | "users";
};

export type AdminListadoMeta = {
  totalEspacios: number;
  busquedaPlaceholder: string;
  puedeAnterior: boolean;
  puedeSiguiente: boolean;
  pagina: number;
  totalPaginas: number;
  pageSize: number;
};

export type AdminUsuarioRow = {
  /** Prefijo corto para la tabla. */
  id: string;
  /** UUID del perfil (auth.users.id). */
  fullId: string;
  email: string;
  displayName: string;
  rol: string;
  rolApp: RolPerfil;
  registradoEl: string;
  /** Etiqueta de estado de acceso (verificación / invitación). */
  estadoAcceso: string;
};

export type AdminUsuarioRolFormInput = {
  rol: RolPerfil;
};

export type AdminUsuarioCreateModo = "invitar" | "crear";

export type AdminUsuarioCreateFormInput = {
  modo: AdminUsuarioCreateModo;
  nombre: string;
  email: string;
  password?: string;
  rol: RolPerfil;
  institucion?: string;
};

export type AdminUsuarioCreateResult = {
  usuario: AdminUsuarioRow;
  mensaje: string;
};

export type AdminLogTipo =
  | "export"
  | "espacio"
  | "mapa_sync"
  | "consulta"
  | "usuario"
  | "reporte"
  | "politica"
  | "investigacion"
  | "config";

export type AdminLogEntry = {
  id: string;
  tipo: AdminLogTipo;
  descripcion: string;
  detalle: string;
  /** Texto formateado para la UI */
  fecha: string;
  /** ISO 8601 para ordenar de forma fiable */
  occurredAt: string;
};

export type AdminPoliticaObjetivoId = Exclude<FiltroObjetivoId, "todos">;

export type AdminPoliticaRecomendacionRow = {
  id: string;
  objetivoId: AdminPoliticaObjetivoId;
  titulo: string;
  prioridad: PrioridadAccion;
  costoNivel: 1 | 2 | 3;
  alcaldia: string;
  descripcion: string;
  impacto: string;
  impactoCiudadanos: number | null;
  presupuestoMxn: number | null;
  orden: number;
  activo: boolean;
};

export type AdminPoliticaRecomendacionFormInput = {
  id: string;
  objetivoId: AdminPoliticaObjetivoId;
  titulo: string;
  prioridad: PrioridadAccion;
  costoNivel: 1 | 2 | 3;
  alcaldia: string;
  descripcion: string;
  impacto: string;
  impactoCiudadanos: number | null;
  presupuestoMxn: number | null;
  orden: number;
  activo: boolean;
};

export type AdminRecursoCualitativoRow = {
  id: string;
  tipo: TipoRecursoDb;
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
  orden: number;
  activo: boolean;
};

export type AdminRecursoCualitativoFormInput = {
  id: string;
  tipo: TipoRecursoDb;
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
  orden: number;
  activo: boolean;
};

export type AdminFuenteFormInput = {
  institucion: string;
  dataset: string;
  estado: string;
  tipoEstado: "activo" | "estatico" | "api" | "procesado";
  urlFuente?: string;
  orden?: number;
  activo?: boolean;
};

export type AdminReportePlantillaRow = {
  id: string;
  titulo: string;
  descripcion: string;
  categoria: string;
  formatos: string[];
  filtrosDefaultJson: string;
  orden: number;
  activo: boolean;
};

export type AdminReportePlantillaFormInput = {
  id: string;
  titulo: string;
  descripcion: string;
  categoria: string;
  formatos: ("PDF" | "CSV" | "XLSX")[];
  filtrosDefaultJson: string;
  orden: number;
  activo: boolean;
};

export type AdminContactoCentroConfigFormInput = {
  heroBreadcrumbInicio: string;
  heroBreadcrumbActual: string;
  heroTitulo: string;
  heroSubtitulo: string;
  buzonBadge: string;
  buzonTitulo: string;
  buzonDescripcion: string;
  buzonBtnEnviar: string;
  buzonNombreLabel: string;
  buzonNombrePlaceholder: string;
  buzonEmailLabel: string;
  buzonEmailPlaceholder: string;
  buzonAsuntoLabel: string;
  buzonAsuntoPlaceholder: string;
  buzonMensajeLabel: string;
  buzonMensajePlaceholder: string;
  faqTitulo: string;
  faqItemsJson: string;
  apiTitulo: string;
  apiSubtitulo: string;
  apiBtnDocumentacion: string;
  apiCurlTitulo: string;
  apiBtnCopiarToken: string;
  apiDemoToken: string;
  apiEndpointsJson: string;
  datasetsTitulo: string;
  datasetsBtnDescargar: string;
  datasetsJson: string;
  politicasJson: string;
};

export type AdminPoliticasCentroConfigFormInput = {
  heroBadge: string;
  heroTituloLinea1: string;
  heroTituloLinea2: string;
  heroDescripcion: string;
  ctaTitulo: string;
  ctaDescripcion: string;
  ctaBoton: string;
  ctaHref: string;
  filtrosObjetivoJson: string;
};

export type AdminReportesCentroConfigFormInput = {
  ayudaTexto: string;
  ayudaEnlaceLabel: string;
  ayudaEnlaceHref: string;
};

export type AdminEspacioMeta = {
  categorias: string[];
};

export type AdminMapaCapasSyncLogEntry = {
  accion: string;
  filasAfectadas: number;
  mensaje: string;
  ejecutadoEn: string;
};

export type AdminMapaCapasEstado = {
  anioCorte: number;
  espaciosGeoref: number;
  metricasAlcaldia: number;
  geometriasAlcaldias: number;
  geometriasMacrozonas: number;
  lineasTransporte: number;
  ultimaMetricas: string;
  ultimaGeometrias: string;
  ultimaTransporte: string;
  ultimosSync: AdminMapaCapasSyncLogEntry[];
};

export type AdminMapaCapasSyncPaso = {
  accion: string;
  filas: number;
  ok: boolean;
};

export type AdminMapaCapasSyncResult = {
  ok: boolean;
  mensaje: string;
  pasos: AdminMapaCapasSyncPaso[];
  estado: AdminMapaCapasEstado;
};
