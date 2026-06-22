import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/data/supabase/server";
import { isSupabaseConfigured } from "@/lib/data/supabase/config";
import { authRoutes } from "@/lib/data/mock/auth";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (!isSupabaseConfigured() || !code) {
    return NextResponse.redirect(`${origin}${authRoutes.login}?error=auth_callback`);
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return NextResponse.redirect(
        `${origin}${authRoutes.login}?error=${encodeURIComponent(error.message)}`,
      );
    }

    const safeNext = next.startsWith("/") ? next : "/";
    return NextResponse.redirect(`${origin}${safeNext}`);
  } catch {
    return NextResponse.redirect(`${origin}${authRoutes.login}?error=auth_callback`);
  }
}
