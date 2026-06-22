import type {
  AdminCapaFormInput,
  AdminCapaSigRow,
  AdminEspacioFormInput,
  AdminEspacioRow,
  AdminFuenteFormInput,
  AdminLogEntry,
  AdminMapaCapasEstado,
  AdminMapaCapasSyncResult,
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
  AdminUsuarioCreateResult,
  AdminUsuarioRolFormInput,
  AdminUsuarioRow,
} from "@/lib/domain/admin";
import type { ConsultaContactoEstado, ConsultaContactoRow } from "@/lib/domain/contacto";
import type { FuenteInformacion } from "@/lib/domain/fuentes-informacion";

async function parseJson<T>(response: Response): Promise<T> {
  const body = (await response.json()) as T & { error?: string };
  if (!response.ok) {
    throw new Error(body.error ?? `Error ${response.status}`);
  }
  return body;
}

export async function fetchAdminEspacioMeta(): Promise<{ categorias: string[] }> {
  const response = await fetch("/api/admin/espacios", { cache: "no-store" });
  return parseJson(response);
}

export async function createAdminEspacio(
  input: AdminEspacioFormInput,
): Promise<AdminEspacioRow> {
  const response = await fetch("/api/admin/espacios", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const body = await parseJson<{ espacio: AdminEspacioRow }>(response);
  return body.espacio;
}

export async function updateAdminEspacio(
  fullId: string,
  input: AdminEspacioFormInput,
): Promise<AdminEspacioRow> {
  const response = await fetch(`/api/admin/espacios/${encodeURIComponent(fullId)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const body = await parseJson<{ espacio: AdminEspacioRow }>(response);
  return body.espacio;
}

export async function deleteAdminEspacio(fullId: string): Promise<void> {
  const response = await fetch(`/api/admin/espacios/${encodeURIComponent(fullId)}`, {
    method: "DELETE",
  });
  await parseJson(response);
}

export async function publishAdminEspacio(fullId: string): Promise<AdminEspacioRow> {
  const response = await fetch(
    `/api/admin/espacios/${encodeURIComponent(fullId)}/publicar`,
    { method: "POST" },
  );
  const body = await parseJson<{ espacio: AdminEspacioRow }>(response);
  return body.espacio;
}

export async function fetchAdminEspaciosFlujo(): Promise<AdminEspacioRow[]> {
  const response = await fetch("/api/admin/espacios/flujo", { cache: "no-store" });
  const body = await parseJson<{ espacios: AdminEspacioRow[] }>(response);
  return body.espacios;
}

export async function fetchAdminUsuarios(): Promise<AdminUsuarioRow[]> {
  const response = await fetch("/api/admin/usuarios", { cache: "no-store" });
  const body = await parseJson<{ usuarios: AdminUsuarioRow[] }>(response);
  return body.usuarios;
}

export async function createAdminUsuario(
  input: AdminUsuarioCreateFormInput,
): Promise<AdminUsuarioCreateResult> {
  const response = await fetch("/api/admin/usuarios", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const body = await parseJson<AdminUsuarioCreateResult & { error?: string }>(response);
  return { usuario: body.usuario, mensaje: body.mensaje };
}

export async function updateAdminUsuarioRol(
  fullId: string,
  input: AdminUsuarioRolFormInput,
): Promise<AdminUsuarioRow> {
  const response = await fetch(`/api/admin/usuarios/${encodeURIComponent(fullId)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const body = await parseJson<{ usuario: AdminUsuarioRow }>(response);
  return body.usuario;
}

export async function fetchAdminCapas(): Promise<AdminCapaSigRow[]> {
  const response = await fetch("/api/admin/capas", { cache: "no-store" });
  const body = await parseJson<{ capas: AdminCapaSigRow[] }>(response);
  return body.capas;
}

export async function createAdminCapa(input: AdminCapaFormInput): Promise<AdminCapaSigRow> {
  const response = await fetch("/api/admin/capas", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const body = await parseJson<{ capa: AdminCapaSigRow }>(response);
  return body.capa;
}

export async function updateAdminCapa(
  fullId: string,
  input: AdminCapaFormInput,
): Promise<AdminCapaSigRow> {
  const response = await fetch(`/api/admin/capas/${encodeURIComponent(fullId)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const body = await parseJson<{ capa: AdminCapaSigRow }>(response);
  return body.capa;
}

export async function deleteAdminCapa(fullId: string): Promise<void> {
  const response = await fetch(`/api/admin/capas/${encodeURIComponent(fullId)}`, {
    method: "DELETE",
  });
  await parseJson(response);
}

export function capaToFormInput(row: AdminCapaSigRow): AdminCapaFormInput {
  return {
    nombre: row.nombre,
    descripcion: row.descripcion,
    orden: row.orden,
  };
}

export function usuarioToRolFormInput(row: AdminUsuarioRow): AdminUsuarioRolFormInput {
  return { rol: row.rolApp };
}

export async function fetchAdminLogs(): Promise<AdminLogEntry[]> {
  const response = await fetch("/api/admin/logs", { cache: "no-store" });
  const body = await parseJson<{ logs: AdminLogEntry[] }>(response);
  return body.logs;
}

export function espacioToFormInput(row: AdminEspacioRow): AdminEspacioFormInput {
  return {
    nombre: row.nombre,
    direccion: row.direccion ?? "",
    alcaldia: row.alcaldia,
    tipo: row.tipo === "Sin clasificar" ? "" : row.tipo,
    horario: row.horario ?? "",
    telefono: row.telefono ?? "",
    latitud: row.latitud ?? null,
    longitud: row.longitud ?? null,
    descripcion: row.descripcion ?? "",
  };
}

export async function fetchAdminFuentes(): Promise<FuenteInformacion[]> {
  const response = await fetch("/api/admin/fuentes", { cache: "no-store" });
  const body = await parseJson<{ fuentes: FuenteInformacion[] }>(response);
  return body.fuentes;
}

export async function createAdminFuente(
  input: AdminFuenteFormInput,
): Promise<FuenteInformacion> {
  const response = await fetch("/api/admin/fuentes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const body = await parseJson<{ fuente: FuenteInformacion }>(response);
  return body.fuente;
}

export async function updateAdminFuente(
  id: string,
  input: AdminFuenteFormInput,
): Promise<FuenteInformacion> {
  const response = await fetch(`/api/admin/fuentes/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const body = await parseJson<{ fuente: FuenteInformacion }>(response);
  return body.fuente;
}

export async function deleteAdminFuente(id: string): Promise<void> {
  const response = await fetch(`/api/admin/fuentes/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  await parseJson(response);
}

export function fuenteToFormInput(row: FuenteInformacion, orden = 0): AdminFuenteFormInput {
  return {
    institucion: row.institucion,
    dataset: row.dataset,
    estado: row.estado,
    tipoEstado: row.tipoEstado,
    urlFuente: row.urlFuente ?? "",
    orden,
    activo: true,
  };
}

export async function fetchAdminConsultasContacto(): Promise<ConsultaContactoRow[]> {
  const response = await fetch("/api/admin/consultas-contacto", { cache: "no-store" });
  const body = await parseJson<{ consultas: ConsultaContactoRow[] }>(response);
  return body.consultas;
}

export async function fetchAdminPoliticasRecomendaciones(): Promise<
  AdminPoliticaRecomendacionRow[]
> {
  const response = await fetch("/api/admin/politicas-recomendaciones", {
    cache: "no-store",
  });
  const body = await parseJson<{ recomendaciones: AdminPoliticaRecomendacionRow[] }>(
    response,
  );
  return body.recomendaciones;
}

export async function createAdminPoliticaRecomendacion(
  input: AdminPoliticaRecomendacionFormInput,
): Promise<AdminPoliticaRecomendacionRow> {
  const response = await fetch("/api/admin/politicas-recomendaciones", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const body = await parseJson<{ recomendacion: AdminPoliticaRecomendacionRow }>(
    response,
  );
  return body.recomendacion;
}

export async function updateAdminPoliticaRecomendacion(
  id: string,
  input: AdminPoliticaRecomendacionFormInput,
): Promise<AdminPoliticaRecomendacionRow> {
  const response = await fetch(
    `/api/admin/politicas-recomendaciones/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
  );
  const body = await parseJson<{ recomendacion: AdminPoliticaRecomendacionRow }>(
    response,
  );
  return body.recomendacion;
}

export async function setAdminPoliticaRecomendacionActivo(
  id: string,
  activo: boolean,
): Promise<void> {
  const response = await fetch(
    `/api/admin/politicas-recomendaciones/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activo }),
    },
  );
  await parseJson(response);
}

export function politicaRecomendacionToFormInput(
  row: AdminPoliticaRecomendacionRow,
): AdminPoliticaRecomendacionFormInput {
  return {
    id: row.id,
    objetivoId: row.objetivoId,
    titulo: row.titulo,
    prioridad: row.prioridad,
    costoNivel: row.costoNivel,
    alcaldia: row.alcaldia,
    descripcion: row.descripcion,
    impacto: row.impacto,
    impactoCiudadanos: row.impactoCiudadanos,
    presupuestoMxn: row.presupuestoMxn,
    orden: row.orden,
    activo: row.activo,
  };
}

export async function fetchAdminRecursosCualitativos(): Promise<
  AdminRecursoCualitativoRow[]
> {
  const response = await fetch("/api/admin/recursos-cualitativos", {
    cache: "no-store",
  });
  const body = await parseJson<{ recursos: AdminRecursoCualitativoRow[] }>(
    response,
  );
  return body.recursos;
}

export async function createAdminRecursoCualitativo(
  input: AdminRecursoCualitativoFormInput,
): Promise<AdminRecursoCualitativoRow> {
  const response = await fetch("/api/admin/recursos-cualitativos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const body = await parseJson<{ recurso: AdminRecursoCualitativoRow }>(response);
  return body.recurso;
}

export async function updateAdminRecursoCualitativo(
  id: string,
  input: AdminRecursoCualitativoFormInput,
): Promise<AdminRecursoCualitativoRow> {
  const response = await fetch(
    `/api/admin/recursos-cualitativos/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
  );
  const body = await parseJson<{ recurso: AdminRecursoCualitativoRow }>(response);
  return body.recurso;
}

export async function setAdminRecursoCualitativoActivo(
  id: string,
  activo: boolean,
): Promise<void> {
  const response = await fetch(
    `/api/admin/recursos-cualitativos/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activo }),
    },
  );
  await parseJson(response);
}

export function recursoCualitativoToFormInput(
  row: AdminRecursoCualitativoRow,
): AdminRecursoCualitativoFormInput {
  return {
    id: row.id,
    tipo: row.tipo,
    fecha: row.fecha,
    titulo: row.titulo,
    alcaldia: row.alcaldia,
    snippet: row.snippet,
    verificado: row.verificado,
    digitalizado: row.digitalizado,
    investigador: row.investigador,
    fechaDetalle: row.fechaDetalle,
    resumen: row.resumen,
    transcripcion: row.transcripcion.map((b) => ({ ...b })),
    lat: row.lat,
    lng: row.lng,
    orden: row.orden,
    activo: row.activo,
  };
}

export async function updateAdminConsultaContactoEstado(
  id: string,
  estado: ConsultaContactoEstado,
): Promise<ConsultaContactoRow> {
  const response = await fetch(`/api/admin/consultas-contacto/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ estado }),
  });
  const body = await parseJson<{ consulta: ConsultaContactoRow }>(response);
  return body.consulta;
}

export async function fetchAdminReportePlantillas(): Promise<AdminReportePlantillaRow[]> {
  const response = await fetch("/api/admin/reportes-plantillas", { cache: "no-store" });
  const body = await parseJson<{ plantillas: AdminReportePlantillaRow[] }>(response);
  return body.plantillas;
}

export async function createAdminReportePlantilla(
  input: AdminReportePlantillaFormInput,
): Promise<AdminReportePlantillaRow> {
  const response = await fetch("/api/admin/reportes-plantillas", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const body = await parseJson<{ plantilla: AdminReportePlantillaRow }>(response);
  return body.plantilla;
}

export async function updateAdminReportePlantilla(
  id: string,
  input: AdminReportePlantillaFormInput,
): Promise<AdminReportePlantillaRow> {
  const response = await fetch(`/api/admin/reportes-plantillas/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const body = await parseJson<{ plantilla: AdminReportePlantillaRow }>(response);
  return body.plantilla;
}

export async function setAdminReportePlantillaActivo(
  id: string,
  activo: boolean,
): Promise<void> {
  const response = await fetch(`/api/admin/reportes-plantillas/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ activo }),
  });
  await parseJson(response);
}

export async function fetchAdminReportesCentroConfig(): Promise<AdminReportesCentroConfigFormInput> {
  const response = await fetch("/api/admin/reportes-config", { cache: "no-store" });
  const body = await parseJson<{ config: AdminReportesCentroConfigFormInput }>(response);
  return body.config;
}

export async function updateAdminReportesCentroConfig(
  input: AdminReportesCentroConfigFormInput,
): Promise<AdminReportesCentroConfigFormInput> {
  const response = await fetch("/api/admin/reportes-config", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const body = await parseJson<{ config: AdminReportesCentroConfigFormInput }>(response);
  return body.config;
}

export async function fetchAdminPoliticasCentroConfig(): Promise<AdminPoliticasCentroConfigFormInput> {
  const response = await fetch("/api/admin/politicas-config", { cache: "no-store" });
  const body = await parseJson<{ config: AdminPoliticasCentroConfigFormInput }>(response);
  return body.config;
}

export async function updateAdminPoliticasCentroConfig(
  input: AdminPoliticasCentroConfigFormInput,
): Promise<AdminPoliticasCentroConfigFormInput> {
  const response = await fetch("/api/admin/politicas-config", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const body = await parseJson<{ config: AdminPoliticasCentroConfigFormInput }>(response);
  return body.config;
}

export async function fetchAdminContactoCentroConfig(): Promise<AdminContactoCentroConfigFormInput> {
  const response = await fetch("/api/admin/contacto-config", { cache: "no-store" });
  const body = await parseJson<{ config: AdminContactoCentroConfigFormInput }>(response);
  return body.config;
}

export async function updateAdminContactoCentroConfig(
  input: AdminContactoCentroConfigFormInput,
): Promise<AdminContactoCentroConfigFormInput> {
  const response = await fetch("/api/admin/contacto-config", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const body = await parseJson<{ config: AdminContactoCentroConfigFormInput }>(response);
  return body.config;
}

export function reportePlantillaToFormInput(
  row: AdminReportePlantillaRow,
): AdminReportePlantillaFormInput {
  return {
    id: row.id,
    titulo: row.titulo,
    descripcion: row.descripcion,
    categoria: row.categoria,
    formatos: row.formatos.filter(
      (f): f is "PDF" | "CSV" | "XLSX" =>
        f === "PDF" || f === "CSV" || f === "XLSX",
    ),
    filtrosDefaultJson: row.filtrosDefaultJson,
    orden: row.orden,
    activo: row.activo,
  };
}

export async function fetchAdminMapaCapasEstado(): Promise<AdminMapaCapasEstado> {
  const response = await fetch("/api/admin/mapa-capas/estado", { cache: "no-store" });
  const body = await parseJson<{ estado: AdminMapaCapasEstado }>(response);
  return body.estado;
}

export async function syncAdminMapaCapas(): Promise<AdminMapaCapasSyncResult> {
  const response = await fetch("/api/admin/mapa-capas/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  return parseJson<AdminMapaCapasSyncResult>(response);
}
