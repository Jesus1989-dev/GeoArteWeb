import { NextResponse } from "next/server";
import { contactoApi } from "@/lib/data/mock/contacto";

function getConfiguredApiToken(): string | undefined {
  const fromEnv = process.env.GEOARTE_API_TOKEN?.trim();
  if (fromEnv) return fromEnv;
  return contactoApi.demoToken;
}

/** Valida token Bearer / X-API-Key si GEOARTE_API_REQUIRE_TOKEN=true. */
export function assertApiV1Authorized(request: Request): NextResponse | null {
  const requireToken = process.env.GEOARTE_API_REQUIRE_TOKEN === "true";
  if (!requireToken) return null;

  const expected = getConfiguredApiToken();
  if (!expected) {
    return NextResponse.json(
      { error: "API token no configurado en el servidor" },
      { status: 503 },
    );
  }

  const authHeader = request.headers.get("authorization");
  const apiKey = request.headers.get("x-api-key");
  const bearer =
    authHeader?.startsWith("Bearer ") ? authHeader.slice("Bearer ".length).trim() : null;
  const provided = bearer || apiKey?.trim();

  if (provided !== expected) {
    return NextResponse.json({ error: "Token de API inválido o ausente" }, { status: 401 });
  }

  return null;
}

export function getPublicApiTokenForDocs(): string {
  return getConfiguredApiToken() ?? contactoApi.demoToken;
}
