import { NextResponse } from "next/server";
import {
  getContactoCentroConfigAdmin,
  updateContactoCentroConfigAdmin,
} from "@/lib/data/supabase/admin-contacto-config-server";
import type { AdminContactoCentroConfigFormInput } from "@/lib/domain/admin";
import { contactoCentroConfigToFormInput } from "@/lib/contacto/contacto-config";
import {
  isAutoridadError,
  requireAutoridadSession,
} from "@/lib/admin/require-autoridad";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAutoridadSession();
  if (isAutoridadError(auth)) return auth.error;

  try {
    const config = await getContactoCentroConfigAdmin(auth.admin);
    return NextResponse.json({ config: contactoCentroConfigToFormInput(config) });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error al cargar configuración de contacto";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const auth = await requireAutoridadSession();
  if (isAutoridadError(auth)) return auth.error;

  const body = (await request.json()) as AdminContactoCentroConfigFormInput;
  const result = await updateContactoCentroConfigAdmin(auth.admin, body);

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({
    config: result.config ? contactoCentroConfigToFormInput(result.config) : body,
  });
}
