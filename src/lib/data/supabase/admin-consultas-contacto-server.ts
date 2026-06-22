import type { SupabaseClient } from "@supabase/supabase-js";
import {
  CONSULTA_CONTACTO_ESTADOS,
  type ConsultaContactoEstado,
  type ConsultaContactoRow,
} from "@/lib/domain/contacto";

type ConsultaDbRow = {
  id: string;
  nombre: string;
  email: string;
  asunto: string;
  mensaje: string;
  estado: string;
  created_at: string;
};

function formatCreatedAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function mapConsultaRow(row: ConsultaDbRow): ConsultaContactoRow {
  const estado = CONSULTA_CONTACTO_ESTADOS.includes(row.estado as ConsultaContactoEstado)
    ? (row.estado as ConsultaContactoEstado)
    : "nuevo";

  return {
    id: row.id,
    nombre: row.nombre,
    email: row.email,
    asunto: row.asunto,
    mensaje: row.mensaje,
    estado,
    createdAt: row.created_at,
    createdAtLabel: formatCreatedAt(row.created_at),
  };
}

export async function listConsultasContactoAdmin(
  admin: SupabaseClient,
): Promise<ConsultaContactoRow[]> {
  const { data, error } = await admin
    .from("consultas_contacto")
    .select("id, nombre, email, asunto, mensaje, estado, created_at")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return ((data ?? []) as ConsultaDbRow[]).map(mapConsultaRow);
}

export async function updateConsultaContactoEstadoAdmin(
  admin: SupabaseClient,
  id: string,
  estado: ConsultaContactoEstado,
): Promise<{ row?: ConsultaContactoRow; error?: string }> {
  if (!CONSULTA_CONTACTO_ESTADOS.includes(estado)) {
    return { error: "Estado no válido" };
  }

  const { data, error } = await admin
    .from("consultas_contacto")
    .update({ estado })
    .eq("id", id)
    .select("id, nombre, email, asunto, mensaje, estado, created_at")
    .maybeSingle();

  if (error) return { error: error.message };
  if (!data) return { error: "Consulta no encontrada" };
  return { row: mapConsultaRow(data as ConsultaDbRow) };
}
