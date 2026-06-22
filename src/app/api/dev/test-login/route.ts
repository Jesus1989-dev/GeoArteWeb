import { NextResponse } from "next/server";
import { getTestLoginByRol } from "@/lib/auth/test-login";

/** Solo desarrollo: credenciales TEST_LOGIN_* para autocompletar /login. */
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({});
  }
  return NextResponse.json(getTestLoginByRol());
}
