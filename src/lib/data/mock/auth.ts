import type { RolPerfil } from "@/lib/data/mock/perfil";
import { perfilRoles } from "@/lib/data/mock/perfil";

export type AuthSession = {
  userId?: string;
  email: string;
  nombre: string;
  firstName?: string;
  lastName?: string;
  rol: RolPerfil;
  institucion?: string;
  emailVerified?: boolean;
  /** URL pública en Storage (`avatars`) o null si solo iniciales. */
  avatarUrl?: string | null;
};

export const authRoles = perfilRoles;

export const authRoleDescriptions: Record<
  RolPerfil,
  { titulo: string; descripcion: string }
> = {
  ciudadano: {
    titulo: "Ciudadano",
    descripcion: "Consulta mapas, guarda recursos y participa en la plataforma.",
  },
  investigador: {
    titulo: "Investigador",
    descripcion: "Accede a datos, reportes y herramientas de análisis territorial.",
  },
  autoridad: {
    titulo: "Autoridad",
    descripcion: "Administra espacios, capas SIG y validaciones institucionales.",
  },
};

export const authLoginCopy = {
  titulo: "Iniciar sesión",
  subtitulo: "Accede a GEO ARTE CDMX con tu perfil institucional o ciudadano.",
  emailLabel: "Correo electrónico",
  emailPlaceholder: "tu@correo.com",
  passwordLabel: "Contraseña",
  passwordPlaceholder: "••••••••",
  rolLabel: "Tipo de perfil",
  submitLabel: "Entrar",
  registroPrompt: "¿No tienes cuenta?",
  registroLink: "Crear cuenta",
  olvideLink: "¿Olvidaste tu contraseña?",
  demoTitulo: "Cuentas de demostración",
  demoHint: "Contraseña para todas: demo123",
} as const;

export const authRegistroCopy = {
  titulo: "Crear cuenta",
  subtitulo: "Regístrate según tu rol en el ecosistema cultural de la CDMX.",
  nombreLabel: "Nombre completo",
  nombreInvestigadorLabel: "Nombre",
  nombrePlaceholder: "EJ. ANA LÓPEZ",
  emailLabel: "Correo electrónico",
  emailPlaceholder: "ana@ejemplo.com",
  institucionOrganizacionLabel: "Institución u organización",
  institucionOrganizacionPlaceholder: "EJ. UNIVERSIDAD NACIONAL AUTÓNOMA DE MÉXICO",
  areaInvestigacionLabel: "Área de investigación",
  areaInvestigacionPlaceholder: "EJ. GEOGRAFÍA CULTURAL",
  cargoLabel: "Cargo o área",
  cargoPlaceholder: "EJ. DIRECCIÓN DE ANÁLISIS TERRITORIAL",
  terminosPrefix: "Acepto los",
  terminosServicioLabel: "términos del servicio",
  terminosServicioHref: "/sobre-el-proyecto",
  terminosMiddle: "y la",
  privacidadLabel: "política de privacidad de datos de la Ciudad de México",
  privacidadHref: "https://www.cdmx.gob.mx/aviso-de-privacidad",
  passwordLabel: "Contraseña",
  passwordPlaceholder: "Mínimo 6 caracteres",
  confirmLabel: "Confirmar contraseña",
  confirmPlaceholder: "Repite tu contraseña",
  rolLabel: "Tipo de perfil",
  submitLabel: "Registrarse",
  loginPrompt: "¿Ya tienes cuenta?",
  loginLink: "Iniciar sesión",
} as const;

export const authRecuperarCopy = {
  titulo: "Recuperar contraseña",
  subtitulo:
    "Te enviaremos un enlace a tu correo para restablecer el acceso a tu cuenta.",
  emailLabel: "Correo electrónico",
  emailPlaceholder: "tu@correo.com",
  submitLabel: "Enviar enlace",
  loginPrompt: "¿Recordaste tu contraseña?",
  loginLink: "Volver a iniciar sesión",
  exitoTitulo: "Revisa tu bandeja de entrada",
  exitoTexto:
    "Si el correo está registrado en GEO ARTE CDMX, recibirás instrucciones en los próximos minutos. Revisa también la carpeta de spam.",
  demoEnlaceLabel: "Continuar en modo demo",
  demoEnlaceHint: "Simula el enlace del correo para restablecer la contraseña.",
} as const;

export const authRestablecerCopy = {
  titulo: "Nueva contraseña",
  subtitulo: "Elige una contraseña segura para tu cuenta.",
  passwordLabel: "Nueva contraseña",
  passwordPlaceholder: "Mínimo 6 caracteres",
  confirmLabel: "Confirmar contraseña",
  confirmPlaceholder: "Repite la contraseña",
  submitLabel: "Guardar contraseña",
  loginLink: "Ir a iniciar sesión",
  exitoTitulo: "Contraseña actualizada",
  exitoTexto:
    "Tu contraseña se actualizó correctamente. Ya puedes iniciar sesión con tus nuevos datos.",
  tokenInvalido: "El enlace de recuperación no es válido o ha expirado.",
} as const;

export const authVerificarCopy = {
  titulo: "Verifica tu correo",
  subtitulo:
    "Enviamos un mensaje de confirmación a tu bandeja. Debes verificar el correo antes de usar la plataforma.",
  reenviarLabel: "Reenviar correo",
  reenviarExito: "Correo de verificación reenviado (demo).",
  confirmarLabel: "Ya verifiqué mi correo",
  demoLabel: "Simular verificación (demo)",
  demoHint:
    "En producción, este paso se completará al abrir el enlace del correo. Aquí puedes simularlo para continuar.",
  cambiarCorreo: "¿Correo incorrecto?",
  registroLink: "Volver al registro",
  loginLink: "Ir a iniciar sesión",
} as const;

export const authEmailVerificadoCopy = {
  titulo: "Correo verificado",
  subtitulo:
    "Tu cuenta quedó activada. Ya puedes acceder con tu perfil asignado.",
  loginLabel: "Iniciar sesión",
  perfilLabel: "Ir a mi perfil",
} as const;

export const authDemoResetToken = "demo-reset-token";

export const authDemoUsers: Array<AuthSession & { password: string }> = [
  {
    email: "ciudadano@geoarte.mx",
    password: "demo123",
    nombre: "María González",
    rol: "ciudadano",
  },
  {
    email: "investigador@geoarte.mx",
    password: "demo123",
    nombre: "Dr. Alejandro Méndez",
    rol: "investigador",
    institucion: "Dirección de Análisis Territorial",
  },
  {
    email: "autoridad@geoarte.mx",
    password: "demo123",
    nombre: "Lic. Patricia Romero",
    rol: "autoridad",
    institucion: "Secretaría de Cultura CDMX",
  },
];

export const authRedirects: Record<RolPerfil, string> = {
  ciudadano: "/",
  investigador: "/",
  autoridad: "/",
};

export const authRoutes = {
  login: "/login",
  registro: "/registro",
  recuperar: "/recuperar-contrasena",
  restablecer: "/restablecer-contrasena",
  verificar: "/verificar-email",
  emailVerificado: "/email-verificado",
} as const;
