import { type NextRequest, NextResponse } from "next/server";
import { authRoutes } from "@/lib/data/mock/auth";
import { isAuthPath, isProtectedPath } from "@/lib/auth/route-access";
import { updateSupabaseSession } from "@/lib/data/supabase/middleware-client";
import { supabaseRolToAppRol } from "@/lib/data/supabase/rol";
import { isSupabaseConfigured } from "@/lib/data/supabase/config";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.next();
  }

  try {
    return await runMiddleware(request);
  } catch (err) {
    console.error("[middleware] Error de sesión Supabase:", err);
    return NextResponse.next();
  }
}

async function runMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const result = await updateSupabaseSession(request);

  if (!("supabase" in result)) {
    return result;
  }

  const { supabase, supabaseResponse, user } = result;

  if (isProtectedPath(pathname) && user == null) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = authRoutes.login;
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (user != null && isAuthPath(pathname)) {
    const emailVerified =
      user.email_confirmed_at != null && user.email_confirmed_at.trim() !== "";

    if (
      pathname.startsWith(authRoutes.verificar) ||
      pathname.startsWith(authRoutes.restablecer)
    ) {
      return supabaseResponse;
    }

    if (!emailVerified) {
      const verifyUrl = request.nextUrl.clone();
      verifyUrl.pathname = authRoutes.verificar;
      verifyUrl.searchParams.set("email", user.email ?? "");
      return NextResponse.redirect(verifyUrl);
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("rol")
      .eq("id", user.id)
      .maybeSingle();

    const rol = supabaseRolToAppRol(profile?.rol);
    const destination =
      rol != null ? "/" : authRoutes.verificar;

    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = destination;
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
