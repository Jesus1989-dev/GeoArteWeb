"use server";

import {
  insertConsultaContacto,
  normalizeConsultaContactoInput,
} from "@/lib/data/supabase/consultas-contacto.repository";
import { isSupabaseConfigured } from "@/lib/data/supabase/config";
import { getSupabaseServiceRoleClient } from "@/lib/data/supabase/service-role";

export type ContactoFormResult = {
  ok: boolean;
  message: string;
};

/** Persiste una consulta del buzón institucional en Supabase. */
export async function submitContactoForm(
  formData: FormData,
): Promise<ContactoFormResult> {
  const normalized = normalizeConsultaContactoInput({
    nombre: formData.get("nombre")?.toString(),
    email: formData.get("email")?.toString(),
    asunto: formData.get("asunto")?.toString(),
    mensaje: formData.get("mensaje")?.toString(),
  });

  if (normalized.error) {
    return { ok: false, message: normalized.error };
  }

  if (!isSupabaseConfigured()) {
    return {
      ok: false,
      message:
        "El buzón no está disponible en este entorno. Configure Supabase para habilitarlo.",
    };
  }

  const admin = getSupabaseServiceRoleClient();
  if (!admin) {
    return {
      ok: false,
      message:
        "No se pudo conectar con el servidor. Intente de nuevo más tarde.",
    };
  }

  const result = await insertConsultaContacto(admin, normalized.input!);

  if (result.error) {
    return {
      ok: false,
      message: "No pudimos registrar su consulta. Intente de nuevo más tarde.",
    };
  }

  return {
    ok: true,
    message:
      "Hemos recibido su consulta. Nuestro equipo le responderá a la brevedad al correo indicado.",
  };
}
