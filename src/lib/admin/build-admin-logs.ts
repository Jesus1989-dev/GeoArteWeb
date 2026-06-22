import type { SupabaseClient } from "@supabase/supabase-js";
import type { AdminLogEntry, AdminLogTipo } from "@/lib/domain/admin";
import { resolveExportDisplayTitle } from "@/lib/reportes/export-display-title";
import {
  formatExportLogDetalle,
  parseExportMeta,
} from "@/lib/reportes/export-meta";

const MAX_LOGS = 80;

const MAPA_SYNC_LABELS: Record<string, string> = {
  metricas_alcaldia: "Métricas por alcaldía",
  macrozonas: "Macrozonas territoriales",
  transporte: "Capa de transporte",
};

function resolveMapaSyncLabel(accion: string): string {
  const mapped = MAPA_SYNC_LABELS[accion];
  if (mapped) return mapped;
  if (accion) return accion;
  return "Sincronización de mapa";
}

export function formatAdminLogFecha(iso: string | null | undefined): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function entry(
  id: string,
  tipo: AdminLogTipo,
  descripcion: string,
  detalle: string,
  occurredAt: string | null | undefined,
): AdminLogEntry | null {
  if (!occurredAt) return null;
  const at = new Date(occurredAt);
  if (Number.isNaN(at.getTime())) return null;
  const iso = at.toISOString();
  return {
    id,
    tipo,
    descripcion,
    detalle,
    fecha: formatAdminLogFecha(iso),
    occurredAt: iso,
  };
}

function wasEdited(createdAt: string | null, updatedAt: string | null): boolean {
  if (!createdAt || !updatedAt) return false;
  return new Date(updatedAt).getTime() - new Date(createdAt).getTime() > 60_000;
}

function mergeAndSort(entries: AdminLogEntry[]): AdminLogEntry[] {
  return entries
    .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))
    .slice(0, MAX_LOGS);
}

export async function buildAdminLogsFromSupabase(
  admin: SupabaseClient,
): Promise<AdminLogEntry[]> {
  const [
    syncRes,
    exportsRes,
    espaciosRes,
    consultasRes,
    profilesRes,
    reportesRes,
    politicasRes,
    recursosRes,
    contactoCfgRes,
    politicasCfgRes,
    reportesCfgRes,
  ] = await Promise.all([
    admin
      .from("mapa_sync_log")
      .select("id, accion, filas_afectadas, mensaje, ejecutado_en")
      .order("ejecutado_en", { ascending: false })
      .limit(30),
    admin
      .from("export_downloads")
      .select("id, file_name, format, meta, created_at")
      .order("created_at", { ascending: false })
      .limit(25),
    admin
      .from("espacios_culturales")
      .select("id, nombre, created_at, updated_at")
      .order("updated_at", { ascending: false })
      .limit(25),
    admin
      .from("consultas_contacto")
      .select("id, nombre, asunto, estado, created_at")
      .order("created_at", { ascending: false })
      .limit(25),
    admin
      .from("profiles")
      .select("id, display_name, rol, created_at")
      .order("created_at", { ascending: false })
      .limit(20),
    admin
      .from("reporte_plantillas")
      .select("id, titulo, activo, created_at, updated_at")
      .order("updated_at", { ascending: false })
      .limit(20),
    admin
      .from("politicas_recomendaciones")
      .select("id, titulo, activo, created_at, updated_at")
      .order("updated_at", { ascending: false })
      .limit(20),
    admin
      .from("recursos_cualitativos")
      .select("id, titulo, tipo, activo, created_at, updated_at")
      .order("updated_at", { ascending: false })
      .limit(20),
    admin
      .from("contacto_centro_config")
      .select("id, updated_at")
      .eq("id", "default")
      .maybeSingle(),
    admin
      .from("politicas_centro_config")
      .select("id, updated_at")
      .eq("id", "default")
      .maybeSingle(),
    admin
      .from("reportes_centro_config")
      .select("id, updated_at")
      .eq("id", "default")
      .maybeSingle(),
  ]);

  const entries: AdminLogEntry[] = [];

  if (!syncRes.error) {
    for (const row of syncRes.data ?? []) {
      const accion = String(row.accion ?? "");
      const label = resolveMapaSyncLabel(accion);
      const filas = Number(row.filas_afectadas) || 0;
      const e = entry(
        `sync-${String(row.id)}`,
        "mapa_sync",
        `Mapa: ${label}`,
        `${filas} filas · ${String(row.mensaje ?? "—")}`,
        row.ejecutado_en,
      );
      if (e) entries.push(e);
    }
  }

  if (!exportsRes.error) {
    for (const row of exportsRes.data ?? []) {
      const parsed = parseExportMeta(row.meta);
      const e = entry(
        `exp-${String(row.id)}`,
        "export",
        resolveExportDisplayTitle(row.file_name, parsed),
        formatExportLogDetalle(row.format, row.meta),
        row.created_at,
      );
      if (e) entries.push(e);
    }
  }

  if (!espaciosRes.error) {
    for (const row of espaciosRes.data ?? []) {
      const e = entry(
        `esp-${String(row.id)}`,
        "espacio",
        String(row.nombre ?? "Espacio cultural"),
        `Actualización · ID ${String(row.id).slice(0, 8).toUpperCase()}`,
        row.updated_at,
      );
      if (e) entries.push(e);
    }
  }

  if (!consultasRes.error) {
    for (const row of consultasRes.data ?? []) {
      const e = entry(
        `con-${String(row.id)}`,
        "consulta",
        `Consulta: ${String(row.asunto ?? "Sin asunto")}`,
        `${String(row.nombre ?? "—")} · ${String(row.estado ?? "nuevo")}`,
        row.created_at,
      );
      if (e) entries.push(e);
    }
  }

  if (!profilesRes.error) {
    for (const row of profilesRes.data ?? []) {
      const nombreTrim = String(row.display_name ?? "Usuario").trim();
      const nombre = nombreTrim.length > 0 ? nombreTrim : "Usuario";
      const e = entry(
        `usr-${String(row.id)}`,
        "usuario",
        `Nuevo perfil: ${nombre}`,
        `Rol ${String(row.rol ?? "sin asignar")} · ID ${String(row.id).slice(0, 8).toUpperCase()}`,
        row.created_at,
      );
      if (e) entries.push(e);
    }
  }

  if (!reportesRes.error) {
    for (const row of reportesRes.data ?? []) {
      if (!wasEdited(row.created_at, row.updated_at)) continue;
      const e = entry(
        `rep-${String(row.id)}`,
        "reporte",
        `Plantilla de reporte: ${String(row.titulo ?? row.id)}`,
        row.activo ? "Activa · catálogo editado" : "Inactiva · catálogo editado",
        row.updated_at,
      );
      if (e) entries.push(e);
    }
  }

  if (!politicasRes.error) {
    for (const row of politicasRes.data ?? []) {
      if (!wasEdited(row.created_at, row.updated_at)) continue;
      const e = entry(
        `pol-${String(row.id)}`,
        "politica",
        `Política: ${String(row.titulo ?? row.id)}`,
        row.activo ? "Activa · recomendación editada" : "Inactiva · recomendación editada",
        row.updated_at,
      );
      if (e) entries.push(e);
    }
  }

  if (!recursosRes.error) {
    for (const row of recursosRes.data ?? []) {
      if (!wasEdited(row.created_at, row.updated_at)) continue;
      const e = entry(
        `inv-${String(row.id)}`,
        "investigacion",
        `Recurso cualitativo: ${String(row.titulo ?? row.id)}`,
        `${String(row.tipo ?? "recurso")} · ${row.activo ? "activo" : "inactivo"}`,
        row.updated_at,
      );
      if (e) entries.push(e);
    }
  }

  const configRows: Array<{ key: string; label: string; updated_at?: string | null }> = [
    { key: "cfg-contacto", label: "Centro de contacto", ...contactoCfgRes.data },
    { key: "cfg-politicas", label: "Centro de políticas", ...politicasCfgRes.data },
    { key: "cfg-reportes", label: "Centro de reportes", ...reportesCfgRes.data },
  ];

  for (const cfg of configRows) {
    if (!cfg.updated_at) continue;
    const e = entry(
      cfg.key,
      "config",
      `Configuración: ${cfg.label}`,
      "Textos o catálogo del centro actualizados",
      cfg.updated_at,
    );
    if (e) entries.push(e);
  }

  return mergeAndSort(entries);
}
