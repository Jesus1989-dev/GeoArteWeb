import type { SupabaseClient } from "@supabase/supabase-js";
import type { ConsultaContactoInput } from "@/lib/domain/contacto";

const MAX_NOMBRE = 200;
const MAX_EMAIL = 320;
const MAX_ASUNTO = 300;
const MAX_MENSAJE = 5000;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeConsultaContactoInput(raw: {
  nombre?: string | null;
  email?: string | null;
  asunto?: string | null;
  mensaje?: string | null;
}): { input?: ConsultaContactoInput; error?: string } {
  const nombre = raw.nombre?.trim() ?? "";
  const email = raw.email?.trim() ?? "";
  const asunto = raw.asunto?.trim() ?? "";
  const mensaje = raw.mensaje?.trim() ?? "";

  if (!nombre) return { error: "El nombre es obligatorio" };
  if (nombre.length > MAX_NOMBRE) {
    return { error: `El nombre no puede superar ${MAX_NOMBRE} caracteres` };
  }
  if (!email) return { error: "El correo electrónico es obligatorio" };
  if (email.length > MAX_EMAIL || !EMAIL_RE.test(email)) {
    return { error: "Ingrese un correo electrónico válido" };
  }
  if (!asunto) return { error: "El asunto es obligatorio" };
  if (asunto.length > MAX_ASUNTO) {
    return { error: `El asunto no puede superar ${MAX_ASUNTO} caracteres` };
  }
  if (!mensaje) return { error: "El mensaje es obligatorio" };
  if (mensaje.length > MAX_MENSAJE) {
    return { error: `El mensaje no puede superar ${MAX_MENSAJE} caracteres` };
  }

  return { input: { nombre, email, asunto, mensaje } };
}

export async function insertConsultaContacto(
  admin: SupabaseClient,
  input: ConsultaContactoInput,
): Promise<{ id?: string; error?: string }> {
  const { data, error } = await admin
    .from("consultas_contacto")
    .insert({
      nombre: input.nombre,
      email: input.email,
      asunto: input.asunto,
      mensaje: input.mensaje,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };
  return { id: data.id as string };
}
