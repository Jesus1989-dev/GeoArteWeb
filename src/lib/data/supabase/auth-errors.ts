export function translateAuthError(message: string): string {
  const lower = message.toLowerCase();
  if (
    lower.includes("failed to fetch") ||
    lower.includes("networkerror") ||
    lower.includes("network request failed") ||
    lower.includes("load failed")
  ) {
    return "No se pudo conectar con el servicio de autenticación. Comprueba tu conexión o inténtalo de nuevo.";
  }
  if (lower.includes("invalid login credentials")) {
    return "Correo o contraseña incorrectos.";
  }
  if (lower.includes("email not confirmed")) {
    return "Confirma tu correo antes de iniciar sesión.";
  }
  if (lower.includes("user already registered")) {
    return "Ese correo ya está registrado. Inicia sesión o usa otro correo.";
  }
  if (
    lower.includes("email rate limit") ||
    lower.includes("over_email_send_rate_limit")
  ) {
    return "Se enviaron demasiados correos de verificación. Espera unos minutos e inténtalo de nuevo.";
  }
  if (lower.includes("redirect") && lower.includes("url")) {
    return "La URL de retorno no está autorizada en Supabase. Revisa Authentication → URL Configuration (Site URL y Redirect URLs).";
  }
  if (lower.includes("database error saving new user")) {
    return "No se pudo crear el perfil en la base de datos. Revisa en Supabase que existan la tabla profiles y el trigger on_auth_user_created (Logs → Postgres).";
  }
  if (lower.includes("signup is disabled")) {
    return "El registro de usuarios está desactivado en el proyecto Supabase.";
  }
  if (lower.includes("password") && lower.includes("weak")) {
    return "La contraseña no cumple los requisitos de seguridad del proyecto.";
  }
  return message;
}
