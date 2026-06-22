import { NextResponse } from "next/server";
import {
  getPoliticasCentroConfigAdmin,
  updatePoliticasCentroConfigAdmin,
} from "@/lib/data/supabase/admin-politicas-config-server";
import type { AdminPoliticasCentroConfigFormInput } from "@/lib/domain/admin";
import { politicasCentroConfigToFormInput } from "@/lib/politicas/politicas-config";
import {
  isAutoridadError,
  requireAutoridadSession,
} from "@/lib/admin/require-autoridad";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAutoridadSession();
  if (isAutoridadError(auth)) return auth.error;

  try {
    const config = await getPoliticasCentroConfigAdmin(auth.admin);
    return NextResponse.json({ config: politicasCentroConfigToFormInput(config) });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error al cargar configuración de políticas";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const auth = await requireAutoridadSession();
  if (isAutoridadError(auth)) return auth.error;

  const body = (await request.json()) as AdminPoliticasCentroConfigFormInput;
  const result = await updatePoliticasCentroConfigAdmin(auth.admin, body);

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({
    config: result.config ? politicasCentroConfigToFormInput(result.config) : body,
  });
}
