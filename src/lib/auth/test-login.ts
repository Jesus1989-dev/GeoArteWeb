import type { RolPerfil } from "@/lib/data/mock/perfil";

export type TestLoginCredentials = {
  email: string;
  password: string;
};

const ROL_ENV_SUFFIX: Record<RolPerfil, string> = {
  autoridad: "AUTORIDAD",
  investigador: "INVESTIGADOR",
  ciudadano: "CIUDADANO",
};

function readEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

function readPairForRol(rol: RolPerfil): TestLoginCredentials | undefined {
  const suffix = ROL_ENV_SUFFIX[rol];
  const email =
    readEnv(`TEST_LOGIN_${suffix}_EMAIL`) ??
    readEnv(`NEXT_PUBLIC_TEST_LOGIN_${suffix}_EMAIL`);
  if (!email) return undefined;

  const password =
    readEnv(`TEST_LOGIN_${suffix}_PASSWORD`) ??
    readEnv(`NEXT_PUBLIC_TEST_LOGIN_${suffix}_PASSWORD`) ??
    "";

  return { email, password };
}

/** Credenciales de prueba por rol (mismas variables que SECTEI/.env). */
export function getTestLoginByRol(): Partial<Record<RolPerfil, TestLoginCredentials>> {
  const roles: RolPerfil[] = ["autoridad", "investigador", "ciudadano"];
  const out: Partial<Record<RolPerfil, TestLoginCredentials>> = {};

  for (const rol of roles) {
    const creds = readPairForRol(rol);
    if (creds) out[rol] = creds;
  }

  return out;
}

export function hasTestLoginConfigured(
  byRol: Partial<Record<RolPerfil, TestLoginCredentials>>,
): boolean {
  return Object.keys(byRol).length > 0;
}
