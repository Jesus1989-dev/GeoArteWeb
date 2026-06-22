import { headers } from "next/headers";

export { buildApiV1Url, buildCurlExample } from "@/lib/api-v1/url-builders";

/** Base URL pública del sitio (documentación API en Contacto). */
export async function getPublicSiteBaseUrl(): Promise<string> {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");

  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  if (!host) return "http://localhost:3000";

  const proto = headerStore.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}
