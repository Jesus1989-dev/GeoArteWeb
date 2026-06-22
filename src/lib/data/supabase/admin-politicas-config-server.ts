import type { SupabaseClient } from "@supabase/supabase-js";
import type { AdminPoliticasCentroConfigFormInput } from "@/lib/domain/admin";
import {
  getDefaultPoliticasCentroConfigRaw,
  parseFiltrosObjetivo,
  type PoliticasCentroConfigRaw,
} from "@/lib/politicas/politicas-config";

type ConfigDbRow = {
  hero_badge: string;
  hero_titulo_linea1: string;
  hero_titulo_linea2: string;
  hero_descripcion: string;
  cta_titulo: string;
  cta_descripcion: string;
  cta_boton: string;
  cta_href: string;
  filtros_objetivo: unknown;
};

function mapConfigRow(row: ConfigDbRow): PoliticasCentroConfigRaw {
  return {
    heroBadge: String(row.hero_badge ?? "").trim(),
    heroTituloLinea1: String(row.hero_titulo_linea1 ?? "").trim(),
    heroTituloLinea2: String(row.hero_titulo_linea2 ?? "").trim(),
    heroDescripcion: String(row.hero_descripcion ?? "").trim(),
    ctaTitulo: String(row.cta_titulo ?? "").trim(),
    ctaDescripcion: String(row.cta_descripcion ?? "").trim(),
    ctaBoton: String(row.cta_boton ?? "").trim(),
    ctaHref: String(row.cta_href ?? "").trim(),
    filtrosObjetivo: parseFiltrosObjetivo(row.filtros_objetivo),
  };
}

function normalizeConfigInput(
  input: AdminPoliticasCentroConfigFormInput,
): { payload: Record<string, unknown>; raw?: PoliticasCentroConfigRaw; error?: string } {
  const heroBadge = input.heroBadge?.trim() ?? "";
  const heroTituloLinea1 = input.heroTituloLinea1?.trim() ?? "";
  const heroTituloLinea2 = input.heroTituloLinea2?.trim() ?? "";
  const heroDescripcion = input.heroDescripcion?.trim() ?? "";
  const ctaTitulo = input.ctaTitulo?.trim() ?? "";
  const ctaDescripcion = input.ctaDescripcion?.trim() ?? "";
  const ctaBoton = input.ctaBoton?.trim() ?? "";
  const ctaHref = input.ctaHref?.trim() ?? "";

  if (!heroBadge) return { payload: {}, error: "El badge del hero es obligatorio" };
  if (!heroTituloLinea1) return { payload: {}, error: "La primera línea del título es obligatoria" };
  if (!heroTituloLinea2) return { payload: {}, error: "La segunda línea del título es obligatoria" };
  if (!heroDescripcion) return { payload: {}, error: "La descripción del hero es obligatoria" };
  if (!ctaTitulo) return { payload: {}, error: "El título del CTA es obligatorio" };
  if (!ctaDescripcion) return { payload: {}, error: "La descripción del CTA es obligatoria" };
  if (!ctaBoton) return { payload: {}, error: "El texto del botón CTA es obligatorio" };
  if (!ctaHref) return { payload: {}, error: "La URL del CTA es obligatoria" };

  let filtrosParsed: unknown;
  try {
    filtrosParsed = JSON.parse(input.filtrosObjetivoJson?.trim() || "[]");
  } catch {
    return { payload: {}, error: "filtros_objetivo debe ser JSON válido" };
  }

  const filtrosObjetivo = parseFiltrosObjetivo(filtrosParsed);

  const raw: PoliticasCentroConfigRaw = {
    heroBadge,
    heroTituloLinea1,
    heroTituloLinea2,
    heroDescripcion,
    ctaTitulo,
    ctaDescripcion,
    ctaBoton,
    ctaHref,
    filtrosObjetivo,
  };

  return {
    payload: {
      id: "default",
      hero_badge: heroBadge,
      hero_titulo_linea1: heroTituloLinea1,
      hero_titulo_linea2: heroTituloLinea2,
      hero_descripcion: heroDescripcion,
      cta_titulo: ctaTitulo,
      cta_descripcion: ctaDescripcion,
      cta_boton: ctaBoton,
      cta_href: ctaHref,
      filtros_objetivo: filtrosObjetivo,
      updated_at: new Date().toISOString(),
    },
    raw,
  };
}

export async function getPoliticasCentroConfigAdmin(
  client: SupabaseClient,
): Promise<PoliticasCentroConfigRaw> {
  const { data, error } = await client
    .from("politicas_centro_config")
    .select(
      "hero_badge, hero_titulo_linea1, hero_titulo_linea2, hero_descripcion, cta_titulo, cta_descripcion, cta_boton, cta_href, filtros_objetivo",
    )
    .eq("id", "default")
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return getDefaultPoliticasCentroConfigRaw();

  return mapConfigRow(data as ConfigDbRow);
}

export async function fetchPoliticasCentroConfigFromSupabase(
  client: SupabaseClient,
): Promise<PoliticasCentroConfigRaw | null> {
  const { data, error } = await client
    .from("politicas_centro_config")
    .select(
      "hero_badge, hero_titulo_linea1, hero_titulo_linea2, hero_descripcion, cta_titulo, cta_descripcion, cta_boton, cta_href, filtros_objetivo",
    )
    .eq("id", "default")
    .maybeSingle();

  if (error) {
    console.warn("[politicas] politicas_centro_config:", error.message);
    return null;
  }

  if (!data) return null;
  return mapConfigRow(data as ConfigDbRow);
}

export async function updatePoliticasCentroConfigAdmin(
  client: SupabaseClient,
  input: AdminPoliticasCentroConfigFormInput,
): Promise<{ config?: PoliticasCentroConfigRaw; error?: string }> {
  const normalized = normalizeConfigInput(input);
  if (normalized.error) return { error: normalized.error };

  const { error } = await client.from("politicas_centro_config").upsert(normalized.payload);

  if (error) return { error: error.message };

  return { config: normalized.raw };
}
