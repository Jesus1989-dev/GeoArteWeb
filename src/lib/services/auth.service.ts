import {
  authDemoResetToken,
  authDemoUsers,
  authEmailVerificadoCopy,
  authLoginCopy,
  authRecuperarCopy,
  authRegistroCopy,
  authRestablecerCopy,
  authRoleDescriptions,
  authRoles,
  authVerificarCopy,
  type AuthSession,
} from "@/lib/data/mock/auth";
import {
  getTestLoginByRol,
  type TestLoginCredentials,
} from "@/lib/auth/test-login";
import type { RolPerfil } from "@/lib/data/mock/perfil";

export type AuthPageData = {
  roles: typeof authRoles;
  roleDescriptions: typeof authRoleDescriptions;
  loginCopy: typeof authLoginCopy;
  registroCopy: typeof authRegistroCopy;
  recuperarCopy: typeof authRecuperarCopy;
  restablecerCopy: typeof authRestablecerCopy;
  verificarCopy: typeof authVerificarCopy;
  emailVerificadoCopy: typeof authEmailVerificadoCopy;
  demoResetToken: typeof authDemoResetToken;
  demoUsers: typeof authDemoUsers;
  /** Solo en login: credenciales TEST_LOGIN_* del .env (como Flutter). */
  testLoginByRol: Partial<Record<RolPerfil, TestLoginCredentials>>;
};

export function getAuthPageData(): AuthPageData {
  return {
    roles: authRoles,
    roleDescriptions: authRoleDescriptions,
    loginCopy: authLoginCopy,
    registroCopy: authRegistroCopy,
    recuperarCopy: authRecuperarCopy,
    restablecerCopy: authRestablecerCopy,
    verificarCopy: authVerificarCopy,
    emailVerificadoCopy: authEmailVerificadoCopy,
    demoResetToken: authDemoResetToken,
    demoUsers: authDemoUsers,
    testLoginByRol: getTestLoginByRol(),
  };
}

export type LoginInput = {
  email: string;
  password: string;
  rol: RolPerfil;
};

export type RegisterInput = {
  nombre: string;
  email: string;
  password: string;
  confirmPassword: string;
  rol: RolPerfil;
  institucion?: string;
  cargo?: string;
  areaInvestigacion?: string;
  aceptaTerminos?: boolean;
};

export function validateLogin(input: LoginInput, usesSupabase = false): string | null {
  const email = input.email.trim();
  if (!email.includes("@")) return "Ingresa un correo válido.";
  if (input.password.length < 6) return "La contraseña debe tener al menos 6 caracteres.";

  if (usesSupabase) return null;

  const demo = authDemoUsers.find(
    (u) => u.email.toLowerCase() === email.toLowerCase(),
  );
  if (demo) {
    if (demo.password !== input.password) return "Contraseña incorrecta.";
    if (demo.rol !== input.rol)
      return `Esta cuenta está registrada como ${demo.rol}, no como ${input.rol}.`;
    return null;
  }

  return null;
}

export function buildSessionFromLogin(input: LoginInput): AuthSession {
  const email = input.email.trim().toLowerCase();
  const demo = authDemoUsers.find((u) => u.email.toLowerCase() === email);
  if (demo) {
    return {
      email: demo.email,
      nombre: demo.nombre,
      rol: demo.rol,
      institucion: demo.institucion,
      emailVerified: true,
    };
  }
  const nombre = email.split("@")[0]?.replace(/\./g, " ") ?? "Usuario";
  return {
    email,
    nombre: nombre.charAt(0).toUpperCase() + nombre.slice(1),
    rol: input.rol,
    emailVerified: true,
  };
}

export function validateRegister(input: RegisterInput): string | null {
  if (!input.nombre.trim()) return "El nombre es obligatorio.";
  const email = input.email.trim();
  if (!email.includes("@")) return "Ingresa un correo válido.";
  if (input.password.length < 6)
    return "La contraseña debe tener al menos 6 caracteres.";
  if (input.password !== input.confirmPassword)
    return "Las contraseñas no coinciden.";
  if (input.rol === "investigador" && !input.institucion?.trim())
    return "Indica tu institución u organización.";
  if (input.rol === "investigador" && !input.areaInvestigacion?.trim())
    return "Indica tu área de investigación.";
  if (input.rol === "autoridad" && !input.institucion?.trim())
    return "Indica tu institución u organización.";
  if (input.rol === "autoridad" && !input.cargo?.trim())
    return "Indica tu cargo o área.";
  if (!input.aceptaTerminos)
    return "Debes aceptar los términos del servicio y la política de privacidad de datos de la Ciudad de México.";
  return null;
}

export function buildSessionFromRegister(input: RegisterInput): AuthSession {
  return {
    email: input.email.trim().toLowerCase(),
    nombre: input.nombre.trim(),
    rol: input.rol,
    institucion: input.institucion?.trim() || undefined,
    emailVerified: false,
  };
}

export function validateRecuperarEmail(email: string): string | null {
  const value = email.trim();
  if (!value.includes("@")) return "Ingresa un correo válido.";
  return null;
}

export function validateRestablecer(input: {
  password: string;
  confirmPassword: string;
}): string | null {
  if (input.password.length < 6)
    return "La contraseña debe tener al menos 6 caracteres.";
  if (input.password !== input.confirmPassword)
    return "Las contraseñas no coinciden.";
  return null;
}

export function isValidResetToken(token: string | null): boolean {
  return token === authDemoResetToken;
}
