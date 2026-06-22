"use client";

import { useCallback, useEffect, useState } from "react";
import type { AdminPageData } from "@/lib/services/admin.service";
import { markHomeDataStale } from "@/lib/data/home-revalidation";
import { getAdminEspaciosPage } from "@/lib/services/admin.service";
import type {
  AdminCapaFormInput,
  AdminCapaSigRow,
  AdminEspacioFormInput,
  AdminKpi,
  AdminEspacioRow,
  AdminFuenteFormInput,
  AdminLogEntry,
  AdminMapaCapasEstado,
  AdminPoliticaRecomendacionFormInput,
  AdminPoliticaRecomendacionRow,
  AdminContactoCentroConfigFormInput,
  AdminPoliticasCentroConfigFormInput,
  AdminRecursoCualitativoFormInput,
  AdminRecursoCualitativoRow,
  AdminReportePlantillaFormInput,
  AdminReportePlantillaRow,
  AdminReportesCentroConfigFormInput,
  AdminUsuarioCreateFormInput,
  AdminUsuarioRolFormInput,
  AdminUsuarioRow,
} from "@/lib/domain/admin";
import type { FuenteInformacion } from "@/lib/domain/fuentes-informacion";
import type { ConsultaContactoEstado, ConsultaContactoRow } from "@/lib/domain/contacto";
import {
  capaToFormInput,
  createAdminCapa,
  createAdminEspacio,
  createAdminUsuario,
  createAdminFuente,
  createAdminPoliticaRecomendacion,
  createAdminRecursoCualitativo,
  createAdminReportePlantilla,
  deleteAdminCapa,
  deleteAdminEspacio,
  deleteAdminFuente,
  espacioToFormInput,
  publishAdminEspacio,
  fetchAdminCapas,
  fetchAdminEspacioMeta,
  fetchAdminEspaciosFlujo,
  fetchAdminConsultasContacto,
  fetchAdminContactoCentroConfig,
  fetchAdminFuentes,
  fetchAdminLogs,
  fetchAdminMapaCapasEstado,
  fetchAdminPoliticasRecomendaciones,
  fetchAdminPoliticasCentroConfig,
  fetchAdminRecursosCualitativos,
  fetchAdminReportePlantillas,
  fetchAdminReportesCentroConfig,
  fetchAdminUsuarios,
  fuenteToFormInput,
  politicaRecomendacionToFormInput,
  recursoCualitativoToFormInput,
  setAdminPoliticaRecomendacionActivo,
  reportePlantillaToFormInput,
  setAdminRecursoCualitativoActivo,
  setAdminReportePlantillaActivo,
  syncAdminMapaCapas,
  updateAdminCapa,
  updateAdminConsultaContactoEstado,
  updateAdminEspacio,
  updateAdminFuente,
  updateAdminUsuarioRol,
  usuarioToRolFormInput,
  updateAdminPoliticaRecomendacion,
  updateAdminPoliticasCentroConfig,
  updateAdminContactoCentroConfig,
  updateAdminRecursoCualitativo,
  updateAdminReportePlantilla,
  updateAdminReportesCentroConfig,
} from "@/lib/api/admin-client";
import { markInvestigacionForRefresh } from "@/lib/investigacion/investigacion-refresh";
import {
  getDefaultPoliticasCentroConfigRaw,
  politicasCentroConfigToFormInput,
} from "@/lib/politicas/politicas-config";
import {
  contactoCentroConfigToFormInput,
  getDefaultContactoCentroConfigRaw,
} from "@/lib/contacto/contacto-config";
import { markContactoForRefresh } from "@/lib/contacto/contacto-refresh";
import { markPoliticasForRefresh } from "@/lib/politicas/politicas-refresh";
import { markReportesForRefresh } from "@/lib/reportes/reportes-refresh";
import { fetchAdminKpis } from "@/lib/data/supabase/admin.repository";
import { CDMX_ALCALDIAS } from "@/lib/data/supabase/search.repository";
import {
  getEspacioPublishBlocker,
  resolveCamposPublicacion,
} from "@/lib/espacios/espacio-registro";

export type AdminFormModalState =
  | { open: false }
  | { open: true; mode: "create"; initial: AdminEspacioFormInput }
  | { open: true; mode: "edit"; fullId: string; initial: AdminEspacioFormInput };

const EMPTY_FORM: AdminEspacioFormInput = {
  nombre: "",
  direccion: "",
  alcaldia: CDMX_ALCALDIAS[0] ?? "Cuauhtémoc",
  tipo: "",
  horario: "",
  telefono: "",
  latitud: null,
  longitud: null,
  descripcion: "",
};

export type AdminFuenteFormModalState =
  | { open: false }
  | { open: true; mode: "create"; initial: AdminFuenteFormInput }
  | { open: true; mode: "edit"; id: string; initial: AdminFuenteFormInput };

const EMPTY_CAPA_FORM: AdminCapaFormInput = {
  nombre: "",
  descripcion: "",
  orden: 0,
};

export type AdminCapaFormModalState =
  | { open: false }
  | { open: true; mode: "create"; initial: AdminCapaFormInput }
  | { open: true; mode: "edit"; fullId: string; initial: AdminCapaFormInput };

export type AdminUsuarioRolModalState =
  | { open: false }
  | { open: true; usuario: AdminUsuarioRow; initial: AdminUsuarioRolFormInput };

const EMPTY_USUARIO_CREATE_FORM: AdminUsuarioCreateFormInput = {
  modo: "invitar",
  nombre: "",
  email: "",
  password: "",
  rol: "investigador",
  institucion: "",
};

export type AdminUsuarioCreateModalState =
  | { open: false }
  | { open: true; initial: AdminUsuarioCreateFormInput };

const EMPTY_FUENTE_FORM: AdminFuenteFormInput = {
  institucion: "",
  dataset: "",
  estado: "Sincronizado",
  tipoEstado: "activo",
  urlFuente: "",
  orden: 0,
  activo: true,
};

export type AdminConsultaDetailModalState =
  | { open: false }
  | { open: true; consulta: ConsultaContactoRow };

const EMPTY_POLITICA_FORM: AdminPoliticaRecomendacionFormInput = {
  id: "",
  objetivoId: "genero",
  titulo: "",
  prioridad: "Prioridad Media",
  costoNivel: 2,
  alcaldia: CDMX_ALCALDIAS[0] ?? "Cuauhtémoc",
  descripcion: "",
  impacto: "",
  impactoCiudadanos: null,
  presupuestoMxn: null,
  orden: 0,
  activo: true,
};

export type AdminPoliticaFormModalState =
  | { open: false }
  | { open: true; mode: "create"; initial: AdminPoliticaRecomendacionFormInput }
  | {
      open: true;
      mode: "edit";
      id: string;
      initial: AdminPoliticaRecomendacionFormInput;
    };

const EMPTY_RECURSO_FORM: AdminRecursoCualitativoFormInput = {
  id: "",
  tipo: "entrevista",
  fecha: "",
  titulo: "",
  alcaldia: CDMX_ALCALDIAS[0] ?? "Cuauhtémoc",
  snippet: "",
  verificado: false,
  digitalizado: true,
  investigador: "Equipo investigación",
  fechaDetalle: "",
  resumen: "",
  transcripcion: [{ rol: "Investigador", texto: "" }],
  lat: null,
  lng: null,
  orden: 0,
  activo: true,
};

export type AdminRecursoFormModalState =
  | { open: false }
  | { open: true; mode: "create"; initial: AdminRecursoCualitativoFormInput }
  | {
      open: true;
      mode: "edit";
      id: string;
      initial: AdminRecursoCualitativoFormInput;
    };

const EMPTY_REPORTE_PLANTILLA_FORM: AdminReportePlantillaFormInput = {
  id: "",
  titulo: "",
  descripcion: "",
  categoria: "",
  formatos: ["PDF"],
  filtrosDefaultJson: JSON.stringify(
    {
      alcaldia: "Todas",
      disciplina: "Todas",
      periodo: { pick: "first" },
      nse: "Todos",
      edad: "Todos",
      genero: "Todos",
    },
    null,
    2,
  ),
  orden: 0,
  activo: true,
};

const DEFAULT_REPORTES_CENTRO_CONFIG: AdminReportesCentroConfigFormInput = {
  ayudaTexto: "Genera informes PDF, CSV o Excel con filtros propios.",
  ayudaEnlaceLabel: "Ver historial en Mi perfil",
  ayudaEnlaceHref: "/perfil",
};

export type AdminReportePlantillaFormModalState =
  | { open: false }
  | { open: true; mode: "create"; initial: AdminReportePlantillaFormInput }
  | {
      open: true;
      mode: "edit";
      id: string;
      initial: AdminReportePlantillaFormInput;
    };

/** Controlador de UI — administración con paginación, CRUD y secciones auxiliares. */
export function useAdminController(
  data: AdminPageData,
  options?: { initialSeccion?: string | null },
) {
  const menuIds = new Set(data.adminMenu.map((m) => m.id));
  const fromUrl = options?.initialSeccion?.trim();
  const defaultSeccion =
    fromUrl && menuIds.has(fromUrl) ? fromUrl : "espacios";
  const [seccion, setSeccion] = useState<string>(defaultSeccion);
  const [tab, setTab] = useState<"listado" | "flujo" | "editor">("listado");
  const [adminKpis, setAdminKpis] = useState<AdminKpi[]>(data.adminKpis);
  const [espaciosAdmin, setEspaciosAdmin] = useState(data.espaciosAdmin);
  const [listadoMeta, setListadoMeta] = useState(data.adminListadoMeta);
  const [busqueda, setBusqueda] = useState("");
  const [debouncedBusqueda, setDebouncedBusqueda] = useState("");
  const [pagina, setPagina] = useState(1);
  const [espaciosLoading, setEspaciosLoading] = useState(false);

  const [formModal, setFormModal] = useState<AdminFormModalState>({ open: false });
  const [formSaving, setFormSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [actionError, setActionError] = useState<string | null>(null);

  const [flujoEspacios, setFlujoEspacios] = useState<AdminEspacioRow[]>([]);
  const [flujoLoading, setFlujoLoading] = useState(false);
  const [flujoPublishingId, setFlujoPublishingId] = useState<string | null>(null);

  const [editorEspacioId, setEditorEspacioId] = useState<string>("");
  const [editorLat, setEditorLat] = useState("");
  const [editorLng, setEditorLng] = useState("");
  const [editorSaving, setEditorSaving] = useState(false);

  const [capas, setCapas] = useState<AdminCapaSigRow[]>(data.adminCapasSig);
  const [capasLoading, setCapasLoading] = useState(false);
  const [capaFormModal, setCapaFormModal] = useState<AdminCapaFormModalState>({
    open: false,
  });
  const [capaFormSaving, setCapaFormSaving] = useState(false);
  const [capaFormError, setCapaFormError] = useState<string | null>(null);

  const [mapaCapasEstado, setMapaCapasEstado] = useState<AdminMapaCapasEstado | null>(null);
  const [mapaCapasLoading, setMapaCapasLoading] = useState(false);
  const [mapaCapasSyncing, setMapaCapasSyncing] = useState(false);
  const [mapaCapasSyncMessage, setMapaCapasSyncMessage] = useState<string | null>(null);

  const [usuarios, setUsuarios] = useState<AdminUsuarioRow[]>([]);
  const [usuariosLoading, setUsuariosLoading] = useState(false);
  const [usuarioRolModal, setUsuarioRolModal] = useState<AdminUsuarioRolModalState>({
    open: false,
  });
  const [usuarioRolSaving, setUsuarioRolSaving] = useState(false);
  const [usuarioRolError, setUsuarioRolError] = useState<string | null>(null);
  const [usuarioCreateModal, setUsuarioCreateModal] = useState<AdminUsuarioCreateModalState>({
    open: false,
  });
  const [usuarioCreateSaving, setUsuarioCreateSaving] = useState(false);
  const [usuarioCreateError, setUsuarioCreateError] = useState<string | null>(null);
  const [usuarioCreateSuccess, setUsuarioCreateSuccess] = useState<string | null>(null);

  const [logs, setLogs] = useState<AdminLogEntry[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  const [fuentes, setFuentes] = useState<FuenteInformacion[]>([]);
  const [fuentesLoading, setFuentesLoading] = useState(false);
  const [fuenteFormModal, setFuenteFormModal] = useState<AdminFuenteFormModalState>({
    open: false,
  });
  const [fuenteFormSaving, setFuenteFormSaving] = useState(false);
  const [fuenteFormError, setFuenteFormError] = useState<string | null>(null);

  const [consultas, setConsultas] = useState<ConsultaContactoRow[]>([]);
  const [consultasLoading, setConsultasLoading] = useState(false);
  const [contactoCentroConfig, setContactoCentroConfig] =
    useState<AdminContactoCentroConfigFormInput>(
      contactoCentroConfigToFormInput(getDefaultContactoCentroConfigRaw()),
    );
  const [contactoConfigSaving, setContactoConfigSaving] = useState(false);
  const [contactoConfigError, setContactoConfigError] = useState<string | null>(null);
  const [politicasRecomendaciones, setPoliticasRecomendaciones] = useState<
    AdminPoliticaRecomendacionRow[]
  >([]);
  const [politicasLoading, setPoliticasLoading] = useState(false);
  const [politicaFormModal, setPoliticaFormModal] = useState<AdminPoliticaFormModalState>({
    open: false,
  });
  const [politicaFormSaving, setPoliticaFormSaving] = useState(false);
  const [politicaFormError, setPoliticaFormError] = useState<string | null>(null);
  const [politicasCentroConfig, setPoliticasCentroConfig] =
    useState<AdminPoliticasCentroConfigFormInput>(
      politicasCentroConfigToFormInput(getDefaultPoliticasCentroConfigRaw()),
    );
  const [politicasConfigSaving, setPoliticasConfigSaving] = useState(false);
  const [politicasConfigError, setPoliticasConfigError] = useState<string | null>(null);

  const [recursosCualitativos, setRecursosCualitativos] = useState<
    AdminRecursoCualitativoRow[]
  >([]);
  const [recursosLoading, setRecursosLoading] = useState(false);
  const [recursoFormModal, setRecursoFormModal] = useState<AdminRecursoFormModalState>({
    open: false,
  });
  const [recursoFormSaving, setRecursoFormSaving] = useState(false);
  const [recursoFormError, setRecursoFormError] = useState<string | null>(null);
  const [consultaDetailModal, setConsultaDetailModal] = useState<AdminConsultaDetailModalState>({
    open: false,
  });
  const [consultaDetailSaving, setConsultaDetailSaving] = useState(false);
  const [consultaDetailError, setConsultaDetailError] = useState<string | null>(null);

  const [reportePlantillas, setReportePlantillas] = useState<AdminReportePlantillaRow[]>([]);
  const [reportesLoading, setReportesLoading] = useState(false);
  const [reportesCentroConfig, setReportesCentroConfig] =
    useState<AdminReportesCentroConfigFormInput>(DEFAULT_REPORTES_CENTRO_CONFIG);
  const [reportesConfigSaving, setReportesConfigSaving] = useState(false);
  const [reportesConfigError, setReportesConfigError] = useState<string | null>(null);
  const [reportePlantillaFormModal, setReportePlantillaFormModal] =
    useState<AdminReportePlantillaFormModalState>({ open: false });
  const [reportePlantillaFormSaving, setReportePlantillaFormSaving] = useState(false);
  const [reportePlantillaFormError, setReportePlantillaFormError] = useState<string | null>(
    null,
  );

  useEffect(() => {
    setAdminKpis(data.adminKpis);
  }, [data.adminKpis]);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedBusqueda(busqueda.trim()), 350);
    return () => window.clearTimeout(timer);
  }, [busqueda]);

  useEffect(() => {
    setPagina(1);
  }, [debouncedBusqueda]);

  const reloadEspacios = useCallback(async () => {
    if (data.dataSource !== "supabase") return;

    setEspaciosLoading(true);
    try {
      const result = await getAdminEspaciosPage({
        page: pagina,
        search: debouncedBusqueda || undefined,
      });
      setEspaciosAdmin(result.espaciosAdmin);
      setListadoMeta(result.adminListadoMeta);
    } catch (err) {
      console.error("[admin] paginación:", err);
    } finally {
      setEspaciosLoading(false);
    }
  }, [data.dataSource, debouncedBusqueda, pagina]);

  const notifyHomeDataChanged = useCallback(() => {
    markHomeDataStale();
  }, []);

  const refreshAdminKpis = useCallback(async () => {
    if (data.dataSource !== "supabase") return;
    try {
      setAdminKpis(await fetchAdminKpis());
    } catch (err) {
      console.error("[admin] kpis:", err);
    }
  }, [data.dataSource]);

  const refreshEspaciosYMetricas = useCallback(async () => {
    await Promise.all([reloadEspacios(), refreshAdminKpis()]);
  }, [reloadEspacios, refreshAdminKpis]);

  useEffect(() => {
    if (data.dataSource !== "supabase") {
      setEspaciosAdmin(data.espaciosAdmin);
      setListadoMeta(data.adminListadoMeta);
      return;
    }
    reloadEspacios();
  }, [data.dataSource, debouncedBusqueda, pagina, reloadEspacios]);

  const loadFlujo = useCallback(async () => {
    if (data.dataSource !== "supabase") {
      setFlujoEspacios(
        espaciosAdmin.filter(
          (e) => e.estado === "Revisión" || e.estado === "Borrador",
        ),
      );
      return;
    }

    setFlujoLoading(true);
    try {
      const rows = await fetchAdminEspaciosFlujo();
      setFlujoEspacios(rows);
    } catch (err) {
      console.error("[admin] flujo:", err);
    } finally {
      setFlujoLoading(false);
    }
  }, [data.dataSource, espaciosAdmin]);

  useEffect(() => {
    if (tab === "flujo") loadFlujo();
  }, [tab, loadFlujo]);

  const loadCapas = useCallback(async () => {
    if (data.dataSource !== "supabase") {
      setCapas(data.adminCapasSig.map((c) => ({ ...c })));
      return;
    }

    setCapasLoading(true);
    try {
      setCapas(await fetchAdminCapas());
    } catch (err) {
      console.error("[admin] capas:", err);
    } finally {
      setCapasLoading(false);
    }
  }, [data.adminCapasSig, data.dataSource]);

  useEffect(() => {
    if (seccion === "capas") loadCapas();
  }, [seccion, loadCapas]);

  const loadMapaCapasEstado = useCallback(async () => {
    if (data.dataSource !== "supabase") {
      setMapaCapasEstado({
        anioCorte: new Date().getFullYear(),
        espaciosGeoref: 1428,
        metricasAlcaldia: 16,
        geometriasAlcaldias: 16,
        geometriasMacrozonas: 5,
        lineasTransporte: 4,
        ultimaMetricas: "—",
        ultimaGeometrias: "—",
        ultimaTransporte: "—",
        ultimosSync: [],
      });
      return;
    }

    setMapaCapasLoading(true);
    setMapaCapasSyncMessage(null);
    try {
      setMapaCapasEstado(await fetchAdminMapaCapasEstado());
    } catch (err) {
      console.error("[admin] mapa-capas:", err);
      setActionError(
        err instanceof Error ? err.message : "No se pudo cargar el estado del mapa",
      );
    } finally {
      setMapaCapasLoading(false);
    }
  }, [data.dataSource]);

  const syncMapaCapasAdmin = useCallback(async () => {
    if (data.dataSource !== "supabase") return;

    setMapaCapasSyncing(true);
    setMapaCapasSyncMessage(null);
    setActionError(null);
    try {
      const result = await syncAdminMapaCapas();
      setMapaCapasEstado(result.estado);
      setMapaCapasSyncMessage(result.mensaje);
      notifyHomeDataChanged();
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo sincronizar";
      setActionError(message);
    } finally {
      setMapaCapasSyncing(false);
    }
  }, [data.dataSource, notifyHomeDataChanged]);

  useEffect(() => {
    if (seccion === "mapa-capas") loadMapaCapasEstado();
  }, [seccion, loadMapaCapasEstado]);

  const loadUsuarios = useCallback(async () => {
    if (data.dataSource !== "supabase") {
      setUsuarios([
        {
          id: "MOCK-01",
          fullId: "mock-01",
          email: "autoridad@demo.geoarte.mx",
          displayName: "Autoridad Demo",
          rol: "Autoridad",
          rolApp: "autoridad",
          registradoEl: "Ene 2026",
          estadoAcceso: "Activo",
        },
        {
          id: "MOCK-02",
          fullId: "mock-02",
          email: "investigador@demo.geoarte.mx",
          displayName: "Investigador Demo",
          rol: "Investigador",
          rolApp: "investigador",
          registradoEl: "Feb 2026",
          estadoAcceso: "Activo",
        },
      ]);
      return;
    }

    setUsuariosLoading(true);
    try {
      setUsuarios(await fetchAdminUsuarios());
    } catch (err) {
      console.error("[admin] usuarios:", err);
    } finally {
      setUsuariosLoading(false);
    }
  }, [data.dataSource]);

  const loadLogs = useCallback(async () => {
    if (data.dataSource !== "supabase") {
      const now = new Date().toISOString();
      setLogs([
        {
          id: "mock-1",
          tipo: "mapa_sync",
          descripcion: "Mapa: Métricas por alcaldía",
          detalle: "16 filas · año 2026 (demo)",
          fecha: "Hoy",
          occurredAt: now,
        },
        {
          id: "mock-2",
          tipo: "export",
          descripcion: "Reporte CDMX demo",
          detalle: "PDF · Dashboard",
          fecha: "Ayer",
          occurredAt: new Date(Date.now() - 86_400_000).toISOString(),
        },
        {
          id: "mock-3",
          tipo: "consulta",
          descripcion: "Consulta: Acceso a datos abiertos",
          detalle: "María López · nuevo",
          fecha: "Ayer",
          occurredAt: new Date(Date.now() - 90_000_000).toISOString(),
        },
      ]);
      return;
    }

    setLogsLoading(true);
    try {
      setLogs(await fetchAdminLogs());
    } catch (err) {
      console.error("[admin] logs:", err);
    } finally {
      setLogsLoading(false);
    }
  }, [data.dataSource]);

  useEffect(() => {
    if (seccion === "usuarios") loadUsuarios();
  }, [seccion, loadUsuarios]);

  useEffect(() => {
    if (seccion === "logs") loadLogs();
  }, [seccion, loadLogs]);

  const loadFuentes = useCallback(async () => {
    if (data.dataSource !== "supabase") {
      setFuentes([]);
      return;
    }

    setFuentesLoading(true);
    try {
      setFuentes(await fetchAdminFuentes());
    } catch (err) {
      console.error("[admin] fuentes:", err);
    } finally {
      setFuentesLoading(false);
    }
  }, [data.dataSource]);

  useEffect(() => {
    if (seccion === "fuentes") loadFuentes();
  }, [seccion, loadFuentes]);

  const loadConsultas = useCallback(async () => {
    if (data.dataSource !== "supabase") {
      setConsultas([
        {
          id: "mock-1",
          nombre: "María González",
          email: "maria@ejemplo.edu.mx",
          asunto: "Acceso a datos de museos 2024",
          mensaje:
            "Solicito acceso al dataset completo de museos con metadatos ampliados para investigación académica.",
          estado: "nuevo",
          createdAt: new Date().toISOString(),
          createdAtLabel: "Hace 2 horas",
        },
      ]);
      return;
    }

    setConsultasLoading(true);
    try {
      setConsultas(await fetchAdminConsultasContacto());
    } catch (err) {
      console.error("[admin] consultas:", err);
    } finally {
      setConsultasLoading(false);
    }
  }, [data.dataSource]);

  const loadContactoCentroConfig = useCallback(async () => {
    if (data.dataSource !== "supabase") return;
    try {
      const config = await fetchAdminContactoCentroConfig();
      setContactoCentroConfig(config);
    } catch (err) {
      console.error("[admin] contacto config:", err);
    }
  }, [data.dataSource]);

  const loadConsultasAdmin = useCallback(async () => {
    await Promise.all([loadConsultas(), loadContactoCentroConfig()]);
  }, [loadConsultas, loadContactoCentroConfig]);

  useEffect(() => {
    if (seccion === "consultas") loadConsultasAdmin();
  }, [seccion, loadConsultasAdmin]);

  const loadPoliticasRecomendaciones = useCallback(async () => {
    if (data.dataSource !== "supabase") return;
    setPoliticasLoading(true);
    try {
      const rows = await fetchAdminPoliticasRecomendaciones();
      setPoliticasRecomendaciones(rows);
    } catch (err) {
      console.error("[admin] politicas:", err);
    } finally {
      setPoliticasLoading(false);
    }
  }, [data.dataSource]);

  const loadPoliticasCentroConfig = useCallback(async () => {
    if (data.dataSource !== "supabase") return;
    try {
      const config = await fetchAdminPoliticasCentroConfig();
      setPoliticasCentroConfig(config);
    } catch (err) {
      console.error("[admin] politicas config:", err);
    }
  }, [data.dataSource]);

  const loadPoliticasAdmin = useCallback(async () => {
    await Promise.all([loadPoliticasRecomendaciones(), loadPoliticasCentroConfig()]);
  }, [loadPoliticasCentroConfig, loadPoliticasRecomendaciones]);

  useEffect(() => {
    if (seccion === "politicas") loadPoliticasAdmin();
  }, [seccion, loadPoliticasAdmin]);

  const loadRecursosCualitativos = useCallback(async () => {
    if (data.dataSource !== "supabase") return;
    setRecursosLoading(true);
    try {
      const rows = await fetchAdminRecursosCualitativos();
      setRecursosCualitativos(rows);
    } catch (err) {
      console.error("[admin] investigacion:", err);
    } finally {
      setRecursosLoading(false);
    }
  }, [data.dataSource]);

  useEffect(() => {
    if (seccion === "investigacion") loadRecursosCualitativos();
  }, [seccion, loadRecursosCualitativos]);

  const loadReportePlantillas = useCallback(async () => {
    if (data.dataSource !== "supabase") return;
    setReportesLoading(true);
    try {
      const rows = await fetchAdminReportePlantillas();
      setReportePlantillas(rows);
    } catch (err) {
      console.error("[admin] reportes plantillas:", err);
    } finally {
      setReportesLoading(false);
    }
  }, [data.dataSource]);

  const loadReportesCentroConfig = useCallback(async () => {
    if (data.dataSource !== "supabase") return;
    try {
      const config = await fetchAdminReportesCentroConfig();
      setReportesCentroConfig(config);
    } catch (err) {
      console.error("[admin] reportes config:", err);
    }
  }, [data.dataSource]);

  const loadReportesAdmin = useCallback(async () => {
    await Promise.all([loadReportePlantillas(), loadReportesCentroConfig()]);
  }, [loadReportePlantillas, loadReportesCentroConfig]);

  useEffect(() => {
    if (seccion === "reportes") loadReportesAdmin();
  }, [seccion, loadReportesAdmin]);

  useEffect(() => {
    if (editorEspacioId) {
      const row = espaciosAdmin.find((e) => e.fullId === editorEspacioId);
      if (row) {
        setEditorLat(row.latitud != null ? String(row.latitud) : "");
        setEditorLng(row.longitud != null ? String(row.longitud) : "");
      }
    } else {
      setEditorLat("");
      setEditorLng("");
    }
  }, [editorEspacioId, espaciosAdmin]);

  const openCreateModal = useCallback(async () => {
    setFormError(null);
    setActionError(null);
    setFormModal({ open: true, mode: "create", initial: { ...EMPTY_FORM } });

    if (data.dataSource === "supabase" && categorias.length === 0) {
      try {
        const meta = await fetchAdminEspacioMeta();
        setCategorias(meta.categorias);
      } catch {
        /* categorías opcionales */
      }
    }
  }, [categorias.length, data.dataSource]);

  const openEditModal = useCallback(
    async (row: AdminEspacioRow) => {
      setFormError(null);
      setActionError(null);
      setFormModal({
        open: true,
        mode: "edit",
        fullId: row.fullId,
        initial: espacioToFormInput(row),
      });

      if (data.dataSource === "supabase" && categorias.length === 0) {
        try {
          const meta = await fetchAdminEspacioMeta();
          setCategorias(meta.categorias);
        } catch {
          /* categorías opcionales */
        }
      }
    },
    [categorias.length, data.dataSource],
  );

  const closeFormModal = useCallback(() => {
    setFormModal({ open: false });
    setFormError(null);
  }, []);

  const submitFormModal = useCallback(
    async (input: AdminEspacioFormInput) => {
      setFormSaving(true);
      setFormError(null);
      setActionError(null);

      try {
        if (data.dataSource === "supabase") {
          if (formModal.open && formModal.mode === "create") {
            await createAdminEspacio(input);
          } else if (formModal.open && formModal.mode === "edit") {
            await updateAdminEspacio(formModal.fullId, input);
          }
          await refreshEspaciosYMetricas();
          if (tab === "flujo") await loadFlujo();
          notifyHomeDataChanged();
        } else if (formModal.open && formModal.mode === "create") {
          const next: AdminEspacioRow = {
            ...input,
            id: `EC-${String(espaciosAdmin.length + 1).padStart(3, "0")}`,
            fullId: `EC-${String(espaciosAdmin.length + 1).padStart(3, "0")}`,
            nombre: input.nombre,
            alcaldia: input.alcaldia,
            tipo: input.tipo?.trim() || "Sin clasificar",
            estado: "Borrador",
            ultimaModif: "Ahora",
          };
          setEspaciosAdmin((prev) => [next, ...prev]);
        } else if (formModal.open && formModal.mode === "edit") {
          setEspaciosAdmin((prev) =>
            prev.map((row) =>
              row.fullId === formModal.fullId
                ? {
                    ...row,
                    ...input,
                    tipo: input.tipo?.trim() || "Sin clasificar",
                    ultimaModif: "Ahora",
                  }
                : row,
            ),
          );
        }

        closeFormModal();
      } catch (err) {
        const message = err instanceof Error ? err.message : "No se pudo guardar";
        setFormError(message);
      } finally {
        setFormSaving(false);
      }
    },
    [
      closeFormModal,
      data.dataSource,
      espaciosAdmin.length,
      formModal,
      loadFlujo,
      notifyHomeDataChanged,
      refreshEspaciosYMetricas,
      tab,
    ],
  );

  const publishFlujoEspacio = useCallback(
    async (row: AdminEspacioRow) => {
      const blocker = getEspacioPublishBlocker(row);
      if (blocker) {
        setActionError(blocker);
        return;
      }

      const detalle =
        row.estado === "Revisión"
          ? "Se completarán horario o teléfono pendientes si faltan."
          : "";
      const ok = window.confirm(
        `¿Marcar "${row.nombre}" como publicado en el mapa?${detalle ? ` ${detalle}` : ""}`,
      );
      if (!ok) return;

      setFlujoPublishingId(row.fullId);
      setActionError(null);

      try {
        if (data.dataSource === "supabase") {
          await publishAdminEspacio(row.fullId);
          await refreshEspaciosYMetricas();
          await loadFlujo();
          notifyHomeDataChanged();
        } else {
          const { horario, telefono } = resolveCamposPublicacion(row);
          const published: AdminEspacioRow = {
            ...row,
            horario,
            telefono,
            estado: "Publicado",
            ultimaModif: "Ahora",
          };
          setEspaciosAdmin((prev) =>
            prev.map((e) => (e.fullId === row.fullId ? published : e)),
          );
          setFlujoEspacios((prev) => prev.filter((e) => e.fullId !== row.fullId));
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "No se pudo publicar el espacio";
        setActionError(message);
      } finally {
        setFlujoPublishingId(null);
      }
    },
    [
      data.dataSource,
      loadFlujo,
      notifyHomeDataChanged,
      refreshEspaciosYMetricas,
    ],
  );

  const deleteEspacio = useCallback(
    async (row: AdminEspacioRow) => {
      const ok = window.confirm(`¿Eliminar "${row.nombre}"? Esta acción no se puede deshacer.`);
      if (!ok) return;

      setActionError(null);
      try {
        if (data.dataSource === "supabase") {
          await deleteAdminEspacio(row.fullId);
          await refreshEspaciosYMetricas();
          if (tab === "flujo") await loadFlujo();
          notifyHomeDataChanged();
        } else {
          setEspaciosAdmin((prev) => prev.filter((e) => e.fullId !== row.fullId));
        }
        if (editorEspacioId === row.fullId) setEditorEspacioId("");
      } catch (err) {
        const message = err instanceof Error ? err.message : "No se pudo eliminar";
        setActionError(message);
      }
    },
    [
      data.dataSource,
      editorEspacioId,
      loadFlujo,
      notifyHomeDataChanged,
      refreshEspaciosYMetricas,
      tab,
    ],
  );

  const saveEditorCoords = useCallback(async () => {
    const row = espaciosAdmin.find((e) => e.fullId === editorEspacioId);
    if (!row) return;

    const lat = editorLat.trim() === "" ? null : Number.parseFloat(editorLat);
    const lng = editorLng.trim() === "" ? null : Number.parseFloat(editorLng);

    if (
      (lat != null && !Number.isFinite(lat)) ||
      (lng != null && !Number.isFinite(lng))
    ) {
      setActionError("Coordenadas no válidas");
      return;
    }

    setEditorSaving(true);
    setActionError(null);

    try {
      const input = espacioToFormInput({ ...row, latitud: lat, longitud: lng });
      if (data.dataSource === "supabase") {
        await updateAdminEspacio(row.fullId, input);
        await refreshEspaciosYMetricas();
        notifyHomeDataChanged();
      } else {
        setEspaciosAdmin((prev) =>
          prev.map((e) =>
            e.fullId === row.fullId
              ? { ...e, latitud: lat, longitud: lng, ultimaModif: "Ahora" }
              : e,
          ),
        );
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudieron guardar las coordenadas";
      setActionError(message);
    } finally {
      setEditorSaving(false);
    }
  }, [
    data.dataSource,
    editorEspacioId,
    editorLat,
    editorLng,
    espaciosAdmin,
    notifyHomeDataChanged,
    refreshEspaciosYMetricas,
  ]);

  function irPaginaAnterior() {
    setPagina((p) => Math.max(1, p - 1));
  }

  function irPaginaSiguiente() {
    setPagina((p) => Math.min(listadoMeta.totalPaginas, p + 1));
  }

  function irALogs() {
    setSeccion("logs");
  }

  const openCreateFuenteModal = useCallback(() => {
    setFuenteFormError(null);
    setFuenteFormModal({
      open: true,
      mode: "create",
      initial: { ...EMPTY_FUENTE_FORM, orden: fuentes.length + 1 },
    });
  }, [fuentes.length]);

  const openEditFuenteModal = useCallback((row: FuenteInformacion, index: number) => {
    setFuenteFormError(null);
    setFuenteFormModal({
      open: true,
      mode: "edit",
      id: row.id,
      initial: fuenteToFormInput(row, index + 1),
    });
  }, []);

  const closeFuenteFormModal = useCallback(() => {
    setFuenteFormModal({ open: false });
    setFuenteFormError(null);
  }, []);

  const submitFuenteFormModal = useCallback(
    async (input: AdminFuenteFormInput) => {
      if (data.dataSource !== "supabase") return;

      setFuenteFormSaving(true);
      setFuenteFormError(null);
      try {
        if (fuenteFormModal.open && fuenteFormModal.mode === "create") {
          await createAdminFuente(input);
        } else if (fuenteFormModal.open && fuenteFormModal.mode === "edit") {
          await updateAdminFuente(fuenteFormModal.id, input);
        }
        await loadFuentes();
        closeFuenteFormModal();
      } catch (err) {
        const message = err instanceof Error ? err.message : "No se pudo guardar la fuente";
        setFuenteFormError(message);
      } finally {
        setFuenteFormSaving(false);
      }
    },
    [closeFuenteFormModal, data.dataSource, fuenteFormModal, loadFuentes],
  );

  const openCreateCapaModal = useCallback(() => {
    setCapaFormError(null);
    const nextOrden = capas.reduce((max, c) => Math.max(max, c.orden), 0) + 10;
    setCapaFormModal({
      open: true,
      mode: "create",
      initial: { ...EMPTY_CAPA_FORM, orden: nextOrden },
    });
  }, [capas]);

  const openEditCapaModal = useCallback((row: AdminCapaSigRow) => {
    setCapaFormError(null);
    setCapaFormModal({
      open: true,
      mode: "edit",
      fullId: row.fullId,
      initial: capaToFormInput(row),
    });
  }, []);

  const closeCapaFormModal = useCallback(() => {
    setCapaFormModal({ open: false });
    setCapaFormError(null);
  }, []);

  const submitCapaFormModal = useCallback(
    async (input: AdminCapaFormInput) => {
      if (data.dataSource !== "supabase") return;

      setCapaFormSaving(true);
      setCapaFormError(null);
      try {
        if (capaFormModal.open && capaFormModal.mode === "create") {
          await createAdminCapa(input);
        } else if (capaFormModal.open && capaFormModal.mode === "edit") {
          await updateAdminCapa(capaFormModal.fullId, input);
        }
        await loadCapas();
        setCategorias([]);
        notifyHomeDataChanged();
        closeCapaFormModal();
      } catch (err) {
        const message = err instanceof Error ? err.message : "No se pudo guardar la capa";
        setCapaFormError(message);
      } finally {
        setCapaFormSaving(false);
      }
    },
    [
      capaFormModal,
      closeCapaFormModal,
      data.dataSource,
      loadCapas,
      notifyHomeDataChanged,
    ],
  );

  const deleteCapa = useCallback(
    async (row: AdminCapaSigRow) => {
      if (data.dataSource !== "supabase") return;
      const ok = window.confirm(
        `¿Eliminar la tipología "${row.nombre}"? Solo es posible si no tiene espacios vinculados.`,
      );
      if (!ok) return;

      setActionError(null);
      try {
        await deleteAdminCapa(row.fullId);
        await loadCapas();
        setCategorias([]);
        notifyHomeDataChanged();
      } catch (err) {
        const message = err instanceof Error ? err.message : "No se pudo eliminar";
        setActionError(message);
      }
    },
    [data.dataSource, loadCapas, notifyHomeDataChanged],
  );

  const openCreateUsuarioModal = useCallback(() => {
    setUsuarioCreateError(null);
    setUsuarioCreateSuccess(null);
    setUsuarioCreateModal({
      open: true,
      initial: { ...EMPTY_USUARIO_CREATE_FORM },
    });
  }, []);

  const closeUsuarioCreateModal = useCallback(() => {
    setUsuarioCreateModal({ open: false });
    setUsuarioCreateError(null);
    setUsuarioCreateSuccess(null);
  }, []);

  const submitUsuarioCreateModal = useCallback(
    async (input: AdminUsuarioCreateFormInput) => {
      if (data.dataSource !== "supabase") return;

      setUsuarioCreateSaving(true);
      setUsuarioCreateError(null);
      setUsuarioCreateSuccess(null);
      try {
        const result = await createAdminUsuario(input);
        setUsuarios((prev) => [result.usuario, ...prev]);
        setUsuarioCreateSuccess(result.mensaje);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "No se pudo crear el usuario";
        setUsuarioCreateError(message);
      } finally {
        setUsuarioCreateSaving(false);
      }
    },
    [data.dataSource],
  );

  const openUsuarioRolModal = useCallback((usuario: AdminUsuarioRow) => {
    setUsuarioRolError(null);
    setUsuarioRolModal({
      open: true,
      usuario,
      initial: usuarioToRolFormInput(usuario),
    });
  }, []);

  const closeUsuarioRolModal = useCallback(() => {
    setUsuarioRolModal({ open: false });
    setUsuarioRolError(null);
  }, []);

  const submitUsuarioRolModal = useCallback(
    async (input: AdminUsuarioRolFormInput) => {
      if (data.dataSource !== "supabase" || !usuarioRolModal.open) return;

      setUsuarioRolSaving(true);
      setUsuarioRolError(null);
      try {
        const updated = await updateAdminUsuarioRol(usuarioRolModal.usuario.fullId, input);
        setUsuarios((prev) =>
          prev.map((u) => (u.fullId === updated.fullId ? updated : u)),
        );
        closeUsuarioRolModal();
      } catch (err) {
        const message = err instanceof Error ? err.message : "No se pudo actualizar el rol";
        setUsuarioRolError(message);
      } finally {
        setUsuarioRolSaving(false);
      }
    },
    [closeUsuarioRolModal, data.dataSource, usuarioRolModal],
  );

  const deleteFuente = useCallback(
    async (row: FuenteInformacion) => {
      if (data.dataSource !== "supabase") return;
      const ok = window.confirm(`¿Eliminar la fuente "${row.institucion}"?`);
      if (!ok) return;

      setActionError(null);
      try {
        await deleteAdminFuente(row.id);
        await loadFuentes();
      } catch (err) {
        const message = err instanceof Error ? err.message : "No se pudo eliminar";
        setActionError(message);
      }
    },
    [data.dataSource, loadFuentes],
  );

  const openConsultaDetailModal = useCallback((consulta: ConsultaContactoRow) => {
    setConsultaDetailError(null);
    setConsultaDetailModal({ open: true, consulta });
  }, []);

  const closeConsultaDetailModal = useCallback(() => {
    setConsultaDetailModal({ open: false });
    setConsultaDetailError(null);
  }, []);

  const openCreatePoliticaModal = useCallback(() => {
    setPoliticaFormError(null);
    const nextOrden =
      politicasRecomendaciones.reduce((max, r) => Math.max(max, r.orden), 0) + 10;
    setPoliticaFormModal({
      open: true,
      mode: "create",
      initial: { ...EMPTY_POLITICA_FORM, orden: nextOrden },
    });
  }, [politicasRecomendaciones]);

  const openEditPoliticaModal = useCallback((row: AdminPoliticaRecomendacionRow) => {
    setPoliticaFormError(null);
    setPoliticaFormModal({
      open: true,
      mode: "edit",
      id: row.id,
      initial: politicaRecomendacionToFormInput(row),
    });
  }, []);

  const closePoliticaFormModal = useCallback(() => {
    setPoliticaFormModal({ open: false });
    setPoliticaFormError(null);
  }, []);

  const submitPoliticaFormModal = useCallback(
    async (input: AdminPoliticaRecomendacionFormInput) => {
      if (data.dataSource !== "supabase") return;

      setPoliticaFormSaving(true);
      setPoliticaFormError(null);
      try {
        if (politicaFormModal.open && politicaFormModal.mode === "create") {
          await createAdminPoliticaRecomendacion(input);
        } else if (politicaFormModal.open && politicaFormModal.mode === "edit") {
          await updateAdminPoliticaRecomendacion(politicaFormModal.id, input);
        }
        await loadPoliticasRecomendaciones();
        markPoliticasForRefresh();
        closePoliticaFormModal();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "No se pudo guardar la recomendación";
        setPoliticaFormError(message);
      } finally {
        setPoliticaFormSaving(false);
      }
    },
    [
      closePoliticaFormModal,
      data.dataSource,
      loadPoliticasRecomendaciones,
      politicaFormModal,
    ],
  );

  const togglePoliticaActivo = useCallback(
    async (row: AdminPoliticaRecomendacionRow) => {
      if (data.dataSource !== "supabase") return;

      const next = !row.activo;
      const msg = next
        ? `¿Activar "${row.titulo}" en la página pública?`
        : `¿Desactivar "${row.titulo}"? Dejará de mostrarse en Políticas.`;
      if (!window.confirm(msg)) return;

      setActionError(null);
      try {
        await setAdminPoliticaRecomendacionActivo(row.id, next);
        await loadPoliticasRecomendaciones();
        markPoliticasForRefresh();
      } catch (err) {
        const message = err instanceof Error ? err.message : "No se pudo actualizar";
        setActionError(message);
      }
    },
    [data.dataSource, loadPoliticasRecomendaciones],
  );

  const savePoliticasCentroConfig = useCallback(
    async (input: AdminPoliticasCentroConfigFormInput) => {
      if (data.dataSource !== "supabase") return;

      setPoliticasConfigSaving(true);
      setPoliticasConfigError(null);
      try {
        const saved = await updateAdminPoliticasCentroConfig(input);
        setPoliticasCentroConfig(saved);
        markPoliticasForRefresh();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "No se pudo guardar la configuración";
        setPoliticasConfigError(message);
      } finally {
        setPoliticasConfigSaving(false);
      }
    },
    [data.dataSource],
  );

  const saveContactoCentroConfig = useCallback(
    async (input: AdminContactoCentroConfigFormInput) => {
      if (data.dataSource !== "supabase") return;

      setContactoConfigSaving(true);
      setContactoConfigError(null);
      try {
        const saved = await updateAdminContactoCentroConfig(input);
        setContactoCentroConfig(saved);
        markContactoForRefresh();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "No se pudo guardar la configuración";
        setContactoConfigError(message);
      } finally {
        setContactoConfigSaving(false);
      }
    },
    [data.dataSource],
  );

  const openCreateRecursoModal = useCallback(() => {
    setRecursoFormError(null);
    const nextOrden =
      recursosCualitativos.reduce((max, r) => Math.max(max, r.orden), 0) + 10;
    setRecursoFormModal({
      open: true,
      mode: "create",
      initial: { ...EMPTY_RECURSO_FORM, orden: nextOrden },
    });
  }, [recursosCualitativos]);

  const openEditRecursoModal = useCallback((row: AdminRecursoCualitativoRow) => {
    setRecursoFormError(null);
    setRecursoFormModal({
      open: true,
      mode: "edit",
      id: row.id,
      initial: recursoCualitativoToFormInput(row),
    });
  }, []);

  const closeRecursoFormModal = useCallback(() => {
    setRecursoFormModal({ open: false });
    setRecursoFormError(null);
  }, []);

  const submitRecursoFormModal = useCallback(
    async (input: AdminRecursoCualitativoFormInput) => {
      if (data.dataSource !== "supabase") return;

      setRecursoFormSaving(true);
      setRecursoFormError(null);
      try {
        if (recursoFormModal.open && recursoFormModal.mode === "create") {
          await createAdminRecursoCualitativo(input);
        } else if (recursoFormModal.open && recursoFormModal.mode === "edit") {
          await updateAdminRecursoCualitativo(recursoFormModal.id, input);
        }
        await loadRecursosCualitativos();
        markInvestigacionForRefresh();
        closeRecursoFormModal();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "No se pudo guardar el recurso";
        setRecursoFormError(message);
      } finally {
        setRecursoFormSaving(false);
      }
    },
    [
      closeRecursoFormModal,
      data.dataSource,
      loadRecursosCualitativos,
      recursoFormModal,
    ],
  );

  const toggleRecursoActivo = useCallback(
    async (row: AdminRecursoCualitativoRow) => {
      if (data.dataSource !== "supabase") return;

      const next = !row.activo;
      const msg = next
        ? `¿Activar "${row.titulo}" en el repositorio público?`
        : `¿Desactivar "${row.titulo}"? Dejará de mostrarse en Investigación.`;
      if (!window.confirm(msg)) return;

      setActionError(null);
      try {
        await setAdminRecursoCualitativoActivo(row.id, next);
        await loadRecursosCualitativos();
        markInvestigacionForRefresh();
      } catch (err) {
        const message = err instanceof Error ? err.message : "No se pudo actualizar";
        setActionError(message);
      }
    },
    [data.dataSource, loadRecursosCualitativos],
  );

  const openCreateReportePlantillaModal = useCallback(() => {
    setReportePlantillaFormError(null);
    const nextOrden =
      reportePlantillas.reduce((max, p) => Math.max(max, p.orden), 0) + 10;
    setReportePlantillaFormModal({
      open: true,
      mode: "create",
      initial: { ...EMPTY_REPORTE_PLANTILLA_FORM, orden: nextOrden },
    });
  }, [reportePlantillas]);

  const openEditReportePlantillaModal = useCallback((row: AdminReportePlantillaRow) => {
    setReportePlantillaFormError(null);
    setReportePlantillaFormModal({
      open: true,
      mode: "edit",
      id: row.id,
      initial: reportePlantillaToFormInput(row),
    });
  }, []);

  const closeReportePlantillaFormModal = useCallback(() => {
    setReportePlantillaFormModal({ open: false });
    setReportePlantillaFormError(null);
  }, []);

  const submitReportePlantillaFormModal = useCallback(
    async (input: AdminReportePlantillaFormInput) => {
      if (data.dataSource !== "supabase") return;

      setReportePlantillaFormSaving(true);
      setReportePlantillaFormError(null);
      try {
        if (reportePlantillaFormModal.open && reportePlantillaFormModal.mode === "create") {
          await createAdminReportePlantilla(input);
        } else if (
          reportePlantillaFormModal.open &&
          reportePlantillaFormModal.mode === "edit"
        ) {
          await updateAdminReportePlantilla(reportePlantillaFormModal.id, input);
        }
        await loadReportePlantillas();
        markReportesForRefresh();
        closeReportePlantillaFormModal();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "No se pudo guardar la plantilla";
        setReportePlantillaFormError(message);
      } finally {
        setReportePlantillaFormSaving(false);
      }
    },
    [
      closeReportePlantillaFormModal,
      data.dataSource,
      loadReportePlantillas,
      reportePlantillaFormModal,
    ],
  );

  const toggleReportePlantillaActivo = useCallback(
    async (row: AdminReportePlantillaRow) => {
      if (data.dataSource !== "supabase") return;

      const next = !row.activo;
      const msg = next
        ? `¿Activar "${row.titulo}" en el Centro de reportes?`
        : `¿Desactivar "${row.titulo}"? Dejará de mostrarse en Reportes.`;
      if (!window.confirm(msg)) return;

      setActionError(null);
      try {
        await setAdminReportePlantillaActivo(row.id, next);
        await loadReportePlantillas();
        markReportesForRefresh();
      } catch (err) {
        const message = err instanceof Error ? err.message : "No se pudo actualizar";
        setActionError(message);
      }
    },
    [data.dataSource, loadReportePlantillas],
  );

  const saveReportesCentroConfig = useCallback(
    async (input: AdminReportesCentroConfigFormInput) => {
      if (data.dataSource !== "supabase") return;

      setReportesConfigSaving(true);
      setReportesConfigError(null);
      try {
        const saved = await updateAdminReportesCentroConfig(input);
        setReportesCentroConfig(saved);
        markReportesForRefresh();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "No se pudo guardar la configuración";
        setReportesConfigError(message);
      } finally {
        setReportesConfigSaving(false);
      }
    },
    [data.dataSource],
  );

  const saveConsultaEstado = useCallback(
    async (estado: ConsultaContactoEstado) => {
      if (data.dataSource !== "supabase" || !consultaDetailModal.open) return;

      setConsultaDetailSaving(true);
      setConsultaDetailError(null);
      try {
        const updated = await updateAdminConsultaContactoEstado(
          consultaDetailModal.consulta.id,
          estado,
        );
        setConsultas((prev) =>
          prev.map((row) => (row.id === updated.id ? updated : row)),
        );
        setConsultaDetailModal({ open: true, consulta: updated });
      } catch (err) {
        const message = err instanceof Error ? err.message : "No se pudo actualizar el estado";
        setConsultaDetailError(message);
      } finally {
        setConsultaDetailSaving(false);
      }
    },
    [consultaDetailModal, data.dataSource],
  );

  return {
    adminKpis,
    seccion,
    setSeccion,
    tab,
    setTab,
    espaciosAdmin,
    listadoMeta,
    busqueda,
    setBusqueda,
    pagina,
    espaciosLoading,
    irPaginaAnterior,
    irPaginaSiguiente,
    notifyHomeDataChanged,
    formModal,
    formSaving,
    formError,
    categorias,
    actionError,
    openCreateModal,
    openEditModal,
    closeFormModal,
    submitFormModal,
    deleteEspacio,
    flujoEspacios,
    flujoLoading,
    flujoPublishingId,
    publishFlujoEspacio,
    editorEspacioId,
    setEditorEspacioId,
    editorLat,
    setEditorLat,
    editorLng,
    setEditorLng,
    editorSaving,
    saveEditorCoords,
    capas,
    capasLoading,
    capaFormModal,
    capaFormSaving,
    capaFormError,
    openCreateCapaModal,
    openEditCapaModal,
    closeCapaFormModal,
    submitCapaFormModal,
    deleteCapa,
    loadCapas,
    mapaCapasEstado,
    mapaCapasLoading,
    mapaCapasSyncing,
    mapaCapasSyncMessage,
    loadMapaCapasEstado,
    syncMapaCapasAdmin,
    usuarios,
    usuariosLoading,
    loadUsuarios,
    usuarioCreateModal,
    usuarioCreateSaving,
    usuarioCreateError,
    usuarioCreateSuccess,
    openCreateUsuarioModal,
    closeUsuarioCreateModal,
    submitUsuarioCreateModal,
    usuarioRolModal,
    usuarioRolSaving,
    usuarioRolError,
    openUsuarioRolModal,
    closeUsuarioRolModal,
    submitUsuarioRolModal,
    logs,
    logsLoading,
    irALogs,
    loadLogs,
    fuentes,
    fuentesLoading,
    fuenteFormModal,
    fuenteFormSaving,
    fuenteFormError,
    openCreateFuenteModal,
    openEditFuenteModal,
    closeFuenteFormModal,
    submitFuenteFormModal,
    deleteFuente,
    loadFuentes,
    consultas,
    consultasLoading,
    consultaDetailModal,
    consultaDetailSaving,
    consultaDetailError,
    openConsultaDetailModal,
    closeConsultaDetailModal,
    saveConsultaEstado,
    loadConsultas,
    loadConsultasAdmin,
    contactoCentroConfig,
    contactoConfigSaving,
    contactoConfigError,
    saveContactoCentroConfig,
    politicasRecomendaciones,
    politicasLoading,
    politicaFormModal,
    politicaFormSaving,
    politicaFormError,
    openCreatePoliticaModal,
    openEditPoliticaModal,
    closePoliticaFormModal,
    submitPoliticaFormModal,
    togglePoliticaActivo,
    loadPoliticasRecomendaciones,
    politicasCentroConfig,
    politicasConfigSaving,
    politicasConfigError,
    savePoliticasCentroConfig,
    recursosCualitativos,
    recursosLoading,
    recursoFormModal,
    recursoFormSaving,
    recursoFormError,
    openCreateRecursoModal,
    openEditRecursoModal,
    closeRecursoFormModal,
    submitRecursoFormModal,
    toggleRecursoActivo,
    loadRecursosCualitativos,
    reportePlantillas,
    reportesLoading,
    reportesCentroConfig,
    reportesConfigSaving,
    reportesConfigError,
    reportePlantillaFormModal,
    reportePlantillaFormSaving,
    reportePlantillaFormError,
    openCreateReportePlantillaModal,
    openEditReportePlantillaModal,
    closeReportePlantillaFormModal,
    submitReportePlantillaFormModal,
    toggleReportePlantillaActivo,
    loadReportePlantillas,
    saveReportesCentroConfig,
  };
}

export type AdminControllerState = ReturnType<typeof useAdminController>;
