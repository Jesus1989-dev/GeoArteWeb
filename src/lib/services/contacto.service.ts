import {
  applyAnioToContactoDatasets,
  getDefaultContactoCentroConfigRaw,
  type ContactoApiConfig,
  type ContactoApiEndpoint,
  type ContactoBuzonConfig,
  type ContactoFaqItem,
  type ContactoHeroConfig,
  type ContactoPoliticasConfig,
} from "@/lib/contacto/contacto-config";
import type { DatasetAccent } from "@/lib/data/mock/contacto";
import { curlExample as curlExampleTemplate } from "@/lib/data/mock/contacto";
import type { ContactoDatasetId } from "@/lib/domain/datasets";
import { buildCurlExample } from "@/lib/api-v1/base-url";
import { getPublicApiTokenForDocs } from "@/lib/api-v1/auth";
import { getAnioCorteMetricas, isSupabaseConfigured } from "@/lib/data/supabase/config";
import { fetchContactoCentroConfigFromSupabase } from "@/lib/data/supabase/admin-contacto-config-server";
import { createSupabasePublicClient } from "@/lib/data/supabase/server-public";

export type ContactoDatasetCard = {
  id: ContactoDatasetId;
  title: string;
  format: string;
  size: string;
  accent: DatasetAccent;
  filename: string;
  incluye: string;
};

export type ContactoDataSource = "supabase" | "mock";

export type ContactoPageData = {
  contactoHero: ContactoHeroConfig;
  contactoBuzon: ContactoBuzonConfig;
  contactoFaq: { titulo: string };
  contactoApi: ContactoApiConfig;
  apiEndpoints: ContactoApiEndpoint[];
  contactoDatasetsSection: {
    titulo: string;
    subtitulo: string;
    nota: string;
    btnDescargar: string;
  };
  datasets: ContactoDatasetCard[];
  contactoPoliticas: ContactoPoliticasConfig;
  faqItems: ContactoFaqItem[];
  apiBaseUrl: string;
  curlExample: string;
  apiToken: string;
  dataSource: ContactoDataSource;
  dataSourceNote: string;
};

export type ContactoCurlData = {
  curlExample: string;
};

async function loadEditorialContent(): Promise<{
  editorial: ReturnType<typeof getDefaultContactoCentroConfigRaw>;
  dataSource: ContactoDataSource;
  dataSourceNote: string;
}> {
  const fallback = getDefaultContactoCentroConfigRaw();

  if (!isSupabaseConfigured()) {
    return {
      editorial: fallback,
      dataSource: "mock",
      dataSourceNote:
        "Contenido de demostración — configura Supabase y aplica contacto_centro_config",
    };
  }

  try {
    const client = createSupabasePublicClient();
    const fromDb = await fetchContactoCentroConfigFromSupabase(client);
    if (fromDb) {
      return {
        editorial: fromDb,
        dataSource: "supabase",
        dataSourceNote: "Recursos y soporte GEO ARTE CDMX",
      };
    }
  } catch (err) {
    console.warn("[contacto] config:", err);
  }

  return {
    editorial: fallback,
    dataSource: "mock",
    dataSourceNote: "Contenido por defecto (tabla contacto_centro_config no disponible)",
  };
}

/** Controlador de datos — contacto. */
export async function getContactoPageData(apiBaseUrl: string): Promise<ContactoPageData> {
  const token = getPublicApiTokenForDocs();
  const curlExample = buildCurlExample(apiBaseUrl, token);
  const { editorial, dataSource, dataSourceNote } = await loadEditorialContent();
  const anio = getAnioCorteMetricas();
  const datasetsWithAnio = applyAnioToContactoDatasets(editorial.datasets, anio);

  return {
    contactoHero: editorial.hero,
    contactoBuzon: editorial.buzon,
    contactoFaq: { titulo: editorial.faqTitulo },
    contactoApi: editorial.api,
    apiEndpoints: editorial.apiEndpoints,
    contactoDatasetsSection: editorial.datasetsSection,
    datasets: datasetsWithAnio,
    contactoPoliticas: editorial.politicas,
    faqItems: editorial.faqItems,
    apiBaseUrl,
    curlExample,
    apiToken: token,
    dataSource,
    dataSourceNote,
  };
}

export function getContactoCurlData(curlExample: string = curlExampleTemplate): ContactoCurlData {
  return { curlExample };
}
