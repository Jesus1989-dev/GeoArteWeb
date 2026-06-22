import type { User } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  AdminUsuarioCreateFormInput,
  AdminUsuarioRolFormInput,
  AdminUsuarioRow,
} from "@/lib/domain/admin";
import { splitFullName } from "@/lib/auth/profile-name";
import type { RolPerfil } from "@/lib/data/mock/perfil";
import { appRolToSupabaseRol, supabaseRolToAppRol } from "@/lib/data/supabase/rol";

function getServerSiteOrigin(): string {
  return process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function translateAuthAdminError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("already been registered") || lower.includes("already exists")) {
    return "Ese correo ya está registrado.";
  }
  if (lower.includes("invalid email")) {
    return "Correo electrónico no válido.";
  }
  if (lower.includes("password")) {
    return "La contraseña no cumple los requisitos de seguridad (mín. 6 caracteres).";
  }
  return message;
}

function resolveEstadoAcceso(user: User | null, emailFromAuth?: string): string {
  if (!user) return emailFromAuth ? "Registrado" : "—";
  if (user.email_confirmed_at) return "Activo";
  if (user.invited_at) return "Invitación enviada";
  return "Pendiente verificación";
}

type ProfileDbRow = {
  id: string;
  display_name: string | null;
  rol: string | null;
  created_at: string | null;
};

const ROL_LABEL: Record<RolPerfil, string> = {
  ciudadano: "Ciudadano",
  investigador: "Investigador",
  autoridad: "Autoridad",
};

function formatRegistro(iso: string | null | undefined): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function mapUsuarioDbRow(
  row: ProfileDbRow,
  authUser?: User | null,
): AdminUsuarioRow {
  const fullId = String(row.id ?? "");
  const rolApp = supabaseRolToAppRol(row.rol) ?? "ciudadano";
  const email = authUser?.email?.trim() || "";
  return {
    id: fullId.slice(0, 8).toUpperCase(),
    fullId,
    email,
    displayName: String(row.display_name ?? "Sin nombre").trim() || "Sin nombre",
    rol: ROL_LABEL[rolApp],
    rolApp,
    registradoEl: formatRegistro(row.created_at),
    estadoAcceso: resolveEstadoAcceso(authUser ?? null, email),
  };
}

async function fetchAuthUsersById(
  admin: SupabaseClient,
): Promise<Map<string, User>> {
  const map = new Map<string, User>();
  const { data, error } = await admin.auth.admin.listUsers({ perPage: 200, page: 1 });
  if (error) throw new Error(error.message);
  for (const user of data.users ?? []) {
    map.set(user.id, user);
  }
  return map;
}

async function ensureProfileForAuthUser(
  admin: SupabaseClient,
  userId: string,
  input: { displayName: string; rol: RolPerfil },
): Promise<{ error?: string }> {
  const nameParts = splitFullName(input.displayName.trim());
  const { error } = await admin.from("profiles").upsert(
    {
      id: userId,
      first_name: nameParts.firstName || null,
      last_name: nameParts.lastName || null,
      display_name: input.displayName.trim(),
      rol: appRolToSupabaseRol(input.rol),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );

  if (error) return { error: error.message };
  return {};
}

export async function listUsuariosAdmin(admin: SupabaseClient): Promise<AdminUsuarioRow[]> {
  const [profilesResult, authById] = await Promise.all([
    admin
      .from("profiles")
      .select("id, display_name, rol, created_at")
      .order("created_at", { ascending: false })
      .limit(200),
    fetchAuthUsersById(admin),
  ]);

  if (profilesResult.error) throw new Error(profilesResult.error.message);

  return ((profilesResult.data ?? []) as ProfileDbRow[]).map((row) =>
    mapUsuarioDbRow(row, authById.get(String(row.id)) ?? null),
  );
}

function normalizeUsuarioCreateInput(input: AdminUsuarioCreateFormInput): {
  payload?: {
    modo: AdminUsuarioCreateFormInput["modo"];
    nombre: string;
    email: string;
    password?: string;
    rol: RolPerfil;
    institucion?: string;
  };
  error?: string;
} {
  const nombre = input.nombre?.trim() ?? "";
  const email = input.email?.trim().toLowerCase() ?? "";
  const rol = input.rol;

  if (!nombre) return { error: "El nombre es obligatorio" };
  if (!email) return { error: "El correo es obligatorio" };
  if (!isValidEmail(email)) return { error: "Correo electrónico no válido" };
  if (rol !== "ciudadano" && rol !== "investigador" && rol !== "autoridad") {
    return { error: "Rol no válido" };
  }

  if (input.modo === "crear") {
    const password = input.password ?? "";
    if (password.length < 8) {
      return { error: "La contraseña debe tener al menos 8 caracteres" };
    }
    return {
      payload: {
        modo: "crear",
        nombre,
        email,
        password,
        rol,
        institucion: input.institucion?.trim(),
      },
    };
  }

  if (input.modo !== "invitar") {
    return { error: "Modo de alta no válido" };
  }

  return {
    payload: {
      modo: "invitar",
      nombre,
      email,
      rol,
      institucion: input.institucion?.trim(),
    },
  };
}

export async function createUsuarioAdmin(
  admin: SupabaseClient,
  input: AdminUsuarioCreateFormInput,
): Promise<{ row?: AdminUsuarioRow; mensaje?: string; error?: string }> {
  const normalized = normalizeUsuarioCreateInput(input);
  if (normalized.error || !normalized.payload) return { error: normalized.error };

  const { modo, nombre, email, password, rol, institucion } = normalized.payload;
  const origin = getServerSiteOrigin();
  const metadata = {
    display_name: nombre,
    app_rol: rol,
    institucion: institucion || null,
  };

  let authUser: User | null = null;

  if (modo === "invitar") {
    const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
      data: metadata,
      redirectTo: `${origin}/auth/callback?next=/email-verificado`,
    });

    if (error) return { error: translateAuthAdminError(error.message) };
    authUser = data.user;
  } else {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password: password!,
      email_confirm: true,
      user_metadata: metadata,
    });

    if (error) return { error: translateAuthAdminError(error.message) };
    authUser = data.user;
  }

  if (!authUser?.id) {
    return { error: "No se pudo crear el usuario en Auth" };
  }

  const profileResult = await ensureProfileForAuthUser(admin, authUser.id, {
    displayName: nombre,
    rol,
  });
  if (profileResult.error) return { error: profileResult.error };

  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("id, display_name, rol, created_at")
    .eq("id", authUser.id)
    .maybeSingle();

  if (profileError) return { error: profileError.message };
  if (!profile) return { error: "No se pudo leer el perfil creado" };

  const row = mapUsuarioDbRow(profile as ProfileDbRow, authUser);
  const mensaje =
    modo === "invitar"
      ? `Invitación enviada a ${email}. Debe aceptar el enlace del correo.`
      : `Cuenta creada para ${email}. Ya puede iniciar sesión con la contraseña asignada.`;

  return { row, mensaje };
}

export async function updateUsuarioRolAdmin(
  admin: SupabaseClient,
  profileId: string,
  input: AdminUsuarioRolFormInput,
  options: { actorUserId: string },
): Promise<{ row?: AdminUsuarioRow; error?: string }> {
  const rol = input.rol;
  if (rol !== "ciudadano" && rol !== "investigador" && rol !== "autoridad") {
    return { error: "Rol no válido" };
  }

  if (profileId === options.actorUserId && rol !== "autoridad") {
    return {
      error: "No puedes quitarte el rol Autoridad mientras administras el panel",
    };
  }

  const { data: existing, error: fetchError } = await admin
    .from("profiles")
    .select("id, display_name, rol, created_at")
    .eq("id", profileId)
    .maybeSingle();

  if (fetchError) return { error: fetchError.message };
  if (!existing) return { error: "Usuario no encontrado" };

  const { data, error } = await admin
    .from("profiles")
    .update({
      rol: appRolToSupabaseRol(rol),
      updated_at: new Date().toISOString(),
    })
    .eq("id", profileId)
    .select("id, display_name, rol, created_at")
    .maybeSingle();

  if (error) return { error: error.message };
  if (!data) return { error: "Usuario no encontrado" };

  const authById = await fetchAuthUsersById(admin);
  return {
    row: mapUsuarioDbRow(data as ProfileDbRow, authById.get(profileId) ?? null),
  };
}
