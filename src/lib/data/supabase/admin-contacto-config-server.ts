import type { SupabaseClient } from "@supabase/supabase-js";
import type { AdminContactoCentroConfigFormInput } from "@/lib/domain/admin";
import {
  contactoCentroConfigToFormInput,
  getDefaultContactoCentroConfigRaw,
  mapContactoCentroConfigRow,
  normalizeContactoCentroConfigInput,
  type ContactoCentroConfigRaw,
} from "@/lib/contacto/contacto-config";

export async function getContactoCentroConfigAdmin(
  client: SupabaseClient,
): Promise<ContactoCentroConfigRaw> {
  const { data, error } = await client
    .from("contacto_centro_config")
    .select(
      "hero, buzon, faq_titulo, faq_items, api, api_endpoints, datasets_section, datasets, politicas",
    )
    .eq("id", "default")
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return getDefaultContactoCentroConfigRaw();

  return mapContactoCentroConfigRow(data);
}

export async function fetchContactoCentroConfigFromSupabase(
  client: SupabaseClient,
): Promise<ContactoCentroConfigRaw | null> {
  const { data, error } = await client
    .from("contacto_centro_config")
    .select(
      "hero, buzon, faq_titulo, faq_items, api, api_endpoints, datasets_section, datasets, politicas",
    )
    .eq("id", "default")
    .maybeSingle();

  if (error) {
    console.warn("[contacto] contacto_centro_config:", error.message);
    return null;
  }

  if (!data) return null;
  return mapContactoCentroConfigRow(data);
}

export async function updateContactoCentroConfigAdmin(
  client: SupabaseClient,
  input: AdminContactoCentroConfigFormInput,
): Promise<{ config?: ContactoCentroConfigRaw; error?: string }> {
  const normalized = normalizeContactoCentroConfigInput(input);
  if (normalized.error || !normalized.raw) return { error: normalized.error };

  const raw = normalized.raw;
  const { error } = await client.from("contacto_centro_config").upsert({
    id: "default",
    hero: raw.hero,
    buzon: raw.buzon,
    faq_titulo: raw.faqTitulo,
    faq_items: raw.faqItems,
    api: raw.api,
    api_endpoints: raw.apiEndpoints,
    datasets_section: raw.datasetsSection,
    datasets: raw.datasets,
    politicas: raw.politicas,
    updated_at: new Date().toISOString(),
  });

  if (error) return { error: error.message };
  return { config: raw };
}
