import type { AuthSession } from "@/lib/data/mock/auth";
import type { RolPerfil } from "@/lib/data/mock/perfil";
import { perfilRoles, perfilUsuario } from "@/lib/data/mock/perfil";

export function getIniciales(nombre: string): string {
  return nombre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

function subtituloForRol(session: AuthSession): string {
  if (session.rol === "ciudadano") {
    return "Participante ciudadano · Ciudad de México";
  }
  if (session.institucion) return session.institucion;
  if (session.rol === "investigador") {
    return "Investigador · Análisis territorial";
  }
  return "Autoridad · Gestión institucional CDMX";
}

export function buildPerfilUsuarioFromSession(session: AuthSession) {
  const badge =
    perfilRoles.find((r) => r.id === session.rol)?.label ?? session.rol;

  return {
    ...perfilUsuario,
    nombre: session.nombre,
    subtitulo: subtituloForRol(session),
    badgeRol: badge,
    avatarIniciales: getIniciales(session.nombre),
    avatarUrl: session.avatarUrl ?? null,
    rolActivoDefault: session.rol,
  };
}

export function badgeLabelForRol(rol: RolPerfil): string {
  return perfilRoles.find((r) => r.id === rol)?.label ?? rol;
}
