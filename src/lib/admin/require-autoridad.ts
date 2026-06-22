import { NextResponse } from "next/server";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/data/supabase/server";
import { getSupabaseServiceRoleClient } from "@/lib/data/supabase/service-role";
import { supabaseRolToAppRol } from "@/lib/data/supabase/rol";

type AutoridadOk = {
  user: User;
  admin: SupabaseClient;
};

type AutoridadErr = {
  error: NextResponse;
};

export type AutoridadSession = AutoridadOk | AutoridadErr;

export function isAutoridadError(
  result: AutoridadSession,
): result is AutoridadErr {
  return "error" in result;
}

/** Verifica sesión activa con rol Autoridad; devuelve cliente service role para mutaciones. */
export async function requireAutoridadSession(): Promise<AutoridadSession> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      error: NextResponse.json({ error: "Sesión requerida" }, { status: 401 }),
    };
  }

  const admin = getSupabaseServiceRoleClient();
  if (!admin) {
    return {
      error: NextResponse.json(
        { error: "SUPABASE_SERVICE_ROLE_KEY no configurada en el servidor" },
        { status: 503 },
      ),
    };
  }

  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("rol")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    return {
      error: NextResponse.json(
        { error: "No se pudo verificar el perfil" },
        { status: 500 },
      ),
    };
  }

  if (supabaseRolToAppRol(profile?.rol) !== "autoridad") {
    return {
      error: NextResponse.json({ error: "Acceso restringido" }, { status: 403 }),
    };
  }

  return { user, admin };
}
