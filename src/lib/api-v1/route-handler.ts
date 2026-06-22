import { NextResponse } from "next/server";
import { assertApiV1Authorized } from "@/lib/api-v1/auth";

export function apiV1Json<T>(payload: T, init?: ResponseInit): NextResponse {
  return NextResponse.json(payload, {
    ...init,
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      ...(init?.headers ?? {}),
    },
  });
}

export function apiV1Error(message: string, status: number): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

export async function withApiV1Auth(
  request: Request,
  handler: () => Promise<NextResponse>,
): Promise<NextResponse> {
  const authError = assertApiV1Authorized(request);
  if (authError) return authError;

  try {
    return await handler();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error interno de la API";
    return apiV1Error(message, 500);
  }
}
