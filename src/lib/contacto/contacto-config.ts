import type { AdminContactoCentroConfigFormInput } from "@/lib/domain/admin";
import {
  apiEndpoints as apiEndpointsMock,
  contactoApi as contactoApiMock,
  contactoBuzon as contactoBuzonMock,
  contactoDatasetsSection as contactoDatasetsSectionMock,
  contactoFaq as contactoFaqMock,
  contactoHero as contactoHeroMock,
  contactoPoliticas as contactoPoliticasMock,
  datasets as datasetsMock,
  faqItems as faqItemsMock,
  type DatasetAccent,
} from "@/lib/data/mock/contacto";
import type { ContactoDatasetId } from "@/lib/domain/datasets";

const DATASET_IDS: ContactoDatasetId[] = [
  "espacios",
  "indicadores",
  "reporte",
  "api-backup",
];

const DATASET_ACCENTS: DatasetAccent[] = ["blue", "green", "red", "orange"];

export type ContactoHeroConfig = {
  breadcrumbInicio: string;
  breadcrumbActual: string;
  titulo: string;
  subtitulo: string;
};

export type ContactoBuzonConfig = {
  badge: string;
  titulo: string;
  descripcion: string;
  btnEnviar: string;
  campos: {
    nombre: { label: string; placeholder: string };
    email: { label: string; placeholder: string };
    asunto: { label: string; placeholder: string };
    mensaje: { label: string; placeholder: string };
  };
};

export type ContactoFaqItem = {
  id: string;
  question: string;
  answer: string;
};

export type ContactoApiConfig = {
  titulo: string;
  subtitulo: string;
  btnDocumentacion: string;
  curlTitulo: string;
  btnCopiarToken: string;
  demoToken: string;
};

export type ContactoApiEndpoint = {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  description: string;
};

export type ContactoDatasetCardConfig = {
  id: ContactoDatasetId;
  title: string;
  format: string;
  size: string;
  accent: DatasetAccent;
  filename: string;
  incluye: string;
};

export type ContactoPoliticasConfig = typeof contactoPoliticasMock;

export type ContactoCentroConfigRaw = {
  hero: ContactoHeroConfig;
  buzon: ContactoBuzonConfig;
  faqTitulo: string;
  faqItems: ContactoFaqItem[];
  api: ContactoApiConfig;
  apiEndpoints: ContactoApiEndpoint[];
  datasetsSection: {
    titulo: string;
    subtitulo: string;
    nota: string;
    btnDescargar: string;
  };
  datasets: ContactoDatasetCardConfig[];
  politicas: ContactoPoliticasConfig;
};

function parseHero(raw: unknown): ContactoHeroConfig {
  const src = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  return {
    breadcrumbInicio:
      String(src.breadcrumbInicio ?? "").trim() || contactoHeroMock.breadcrumbInicio,
    breadcrumbActual:
      String(src.breadcrumbActual ?? "").trim() || contactoHeroMock.breadcrumbActual,
    titulo: String(src.titulo ?? "").trim() || contactoHeroMock.titulo,
    subtitulo: String(src.subtitulo ?? "").trim() || contactoHeroMock.subtitulo,
  };
}

function parseCampo(raw: unknown, fallback: { label: string; placeholder: string }) {
  const src = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  return {
    label: String(src.label ?? "").trim() || fallback.label,
    placeholder: String(src.placeholder ?? "").trim() || fallback.placeholder,
  };
}

function parseBuzon(raw: unknown): ContactoBuzonConfig {
  const src = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const campos =
    src.campos && typeof src.campos === "object"
      ? (src.campos as Record<string, unknown>)
      : {};
  return {
    badge: String(src.badge ?? "").trim() || contactoBuzonMock.badge,
    titulo: String(src.titulo ?? "").trim() || contactoBuzonMock.titulo,
    descripcion: String(src.descripcion ?? "").trim() || contactoBuzonMock.descripcion,
    btnEnviar: String(src.btnEnviar ?? "").trim() || contactoBuzonMock.btnEnviar,
    campos: {
      nombre: parseCampo(campos.nombre, contactoBuzonMock.campos.nombre),
      email: parseCampo(campos.email, contactoBuzonMock.campos.email),
      asunto: parseCampo(campos.asunto, contactoBuzonMock.campos.asunto),
      mensaje: parseCampo(campos.mensaje, contactoBuzonMock.campos.mensaje),
    },
  };
}

function parseFaqItems(raw: unknown): ContactoFaqItem[] {
  if (!Array.isArray(raw)) return faqItemsMock.map((item) => ({ ...item }));

  const parsed: ContactoFaqItem[] = [];
  for (const item of raw) {
    if (item == null || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const id = String(row.id ?? "").trim();
    const question = String(row.question ?? "").trim();
    const answer = String(row.answer ?? "").trim();
    if (!id || !question || !answer) continue;
    parsed.push({ id, question, answer });
  }

  return parsed.length > 0 ? parsed : faqItemsMock.map((item) => ({ ...item }));
}

function parseApi(raw: unknown): ContactoApiConfig {
  const src = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  return {
    titulo: String(src.titulo ?? "").trim() || contactoApiMock.titulo,
    subtitulo: String(src.subtitulo ?? "").trim() || contactoApiMock.subtitulo,
    btnDocumentacion:
      String(src.btnDocumentacion ?? "").trim() || contactoApiMock.btnDocumentacion,
    curlTitulo: String(src.curlTitulo ?? "").trim() || contactoApiMock.curlTitulo,
    btnCopiarToken:
      String(src.btnCopiarToken ?? "").trim() || contactoApiMock.btnCopiarToken,
    demoToken: String(src.demoToken ?? "").trim() || contactoApiMock.demoToken,
  };
}

function parseApiEndpoints(raw: unknown): ContactoApiEndpoint[] {
  if (!Array.isArray(raw)) return apiEndpointsMock.map((item) => ({ ...item }));

  const parsed: ContactoApiEndpoint[] = [];
  for (const item of raw) {
    if (item == null || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const method = String(row.method ?? "GET").trim().toUpperCase();
    const path = String(row.path ?? "").trim();
    const description = String(row.description ?? "").trim();
    if (!path || !description) continue;
    parsed.push({
      method:
        method === "GET" ||
        method === "POST" ||
        method === "PUT" ||
        method === "PATCH" ||
        method === "DELETE"
          ? method
          : "GET",
      path,
      description,
    });
  }

  return parsed.length > 0 ? parsed : apiEndpointsMock.map((item) => ({ ...item }));
}

function parseDatasetsSection(raw: unknown): {
  titulo: string;
  subtitulo: string;
  nota: string;
  btnDescargar: string;
} {
  const src = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  return {
    titulo: String(src.titulo ?? "").trim() || contactoDatasetsSectionMock.titulo,
    subtitulo:
      String(src.subtitulo ?? "").trim() || contactoDatasetsSectionMock.subtitulo,
    nota: String(src.nota ?? "").trim() || contactoDatasetsSectionMock.nota,
    btnDescargar:
      String(src.btnDescargar ?? "").trim() || contactoDatasetsSectionMock.btnDescargar,
  };
}

function parseDatasets(raw: unknown): ContactoDatasetCardConfig[] {
  if (!Array.isArray(raw)) return datasetsMock.map((item) => ({ ...item }));

  const parsed: ContactoDatasetCardConfig[] = [];
  for (const item of raw) {
    if (item == null || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const id = String(row.id ?? "").trim() as ContactoDatasetId;
    const accent = String(row.accent ?? "").trim() as DatasetAccent;
    const title = String(row.title ?? "").trim();
    const format = String(row.format ?? "").trim();
    const size = String(row.size ?? "").trim();
    const filename = String(row.filename ?? "").trim();
    if (!DATASET_IDS.includes(id) || !DATASET_ACCENTS.includes(accent)) continue;
    if (!title || !format || !filename) continue;
    const mockDefault = datasetsMock.find((d) => d.id === id);
    const incluye =
      String(row.incluye ?? "").trim() || mockDefault?.incluye || "";
    parsed.push({
      id,
      title,
      format,
      size: size || "Dinámico",
      accent,
      filename,
      incluye,
    });
  }

  if (parsed.length === 0) return datasetsMock.map((item) => ({ ...item }));

  const byId = new Map(parsed.map((d) => [d.id, d]));
  return DATASET_IDS.map((id) => {
    const mock = datasetsMock.find((d) => d.id === id)!;
    const fromConfig = byId.get(id);
    if (!fromConfig) return { ...mock };
    return {
      ...fromConfig,
      incluye: fromConfig.incluye.trim() || mock.incluye,
    };
  });
}

function parsePoliticas(raw: unknown): ContactoPoliticasConfig {
  if (raw == null || typeof raw !== "object") {
    return JSON.parse(JSON.stringify(contactoPoliticasMock)) as ContactoPoliticasConfig;
  }

  const src = raw as Record<string, unknown>;
  const pickBlock = (
    key: keyof ContactoPoliticasConfig,
    fields: Array<"titulo" | "descripcion" | "linkLabel" | "linkHref" | "btnLabel" | "btnHref">,
  ) => {
    const fallback = contactoPoliticasMock[key];
    const block =
      src[key] && typeof src[key] === "object"
        ? (src[key] as Record<string, unknown>)
        : {};
    const result: Record<string, string> = {};
    for (const field of fields) {
      result[field] = String(block[field] ?? fallback[field as keyof typeof fallback] ?? "").trim();
    }
    return result;
  };

  return {
    politicas: pickBlock("politicas", [
      "titulo",
      "descripcion",
      "linkLabel",
      "linkHref",
    ]) as ContactoPoliticasConfig["politicas"],
    atribucion: pickBlock("atribucion", [
      "titulo",
      "descripcion",
      "linkLabel",
      "linkHref",
    ]) as ContactoPoliticasConfig["atribucion"],
    apiKey: pickBlock("apiKey", [
      "titulo",
      "descripcion",
      "btnLabel",
      "btnHref",
    ]) as ContactoPoliticasConfig["apiKey"],
  };
}

export function getDefaultContactoCentroConfigRaw(): ContactoCentroConfigRaw {
  return {
    hero: { ...contactoHeroMock },
    buzon: JSON.parse(JSON.stringify(contactoBuzonMock)) as ContactoBuzonConfig,
    faqTitulo: contactoFaqMock.titulo,
    faqItems: faqItemsMock.map((item) => ({ ...item })),
    api: { ...contactoApiMock },
    apiEndpoints: apiEndpointsMock.map((item) => ({ ...item })),
    datasetsSection: { ...contactoDatasetsSectionMock },
    datasets: datasetsMock.map((item) => ({ ...item })),
    politicas: JSON.parse(JSON.stringify(contactoPoliticasMock)) as ContactoPoliticasConfig,
  };
}

export function mapContactoCentroConfigRow(row: {
  hero: unknown;
  buzon: unknown;
  faq_titulo: string;
  faq_items: unknown;
  api: unknown;
  api_endpoints: unknown;
  datasets_section: unknown;
  datasets: unknown;
  politicas: unknown;
}): ContactoCentroConfigRaw {
  return {
    hero: parseHero(row.hero),
    buzon: parseBuzon(row.buzon),
    faqTitulo: String(row.faq_titulo ?? "").trim() || contactoFaqMock.titulo,
    faqItems: parseFaqItems(row.faq_items),
    api: parseApi(row.api),
    apiEndpoints: parseApiEndpoints(row.api_endpoints),
    datasetsSection: parseDatasetsSection(row.datasets_section),
    datasets: parseDatasets(row.datasets),
    politicas: parsePoliticas(row.politicas),
  };
}

export function contactoCentroConfigToFormInput(
  raw: ContactoCentroConfigRaw,
): AdminContactoCentroConfigFormInput {
  return {
    heroBreadcrumbInicio: raw.hero.breadcrumbInicio,
    heroBreadcrumbActual: raw.hero.breadcrumbActual,
    heroTitulo: raw.hero.titulo,
    heroSubtitulo: raw.hero.subtitulo,
    buzonBadge: raw.buzon.badge,
    buzonTitulo: raw.buzon.titulo,
    buzonDescripcion: raw.buzon.descripcion,
    buzonBtnEnviar: raw.buzon.btnEnviar,
    buzonNombreLabel: raw.buzon.campos.nombre.label,
    buzonNombrePlaceholder: raw.buzon.campos.nombre.placeholder,
    buzonEmailLabel: raw.buzon.campos.email.label,
    buzonEmailPlaceholder: raw.buzon.campos.email.placeholder,
    buzonAsuntoLabel: raw.buzon.campos.asunto.label,
    buzonAsuntoPlaceholder: raw.buzon.campos.asunto.placeholder,
    buzonMensajeLabel: raw.buzon.campos.mensaje.label,
    buzonMensajePlaceholder: raw.buzon.campos.mensaje.placeholder,
    faqTitulo: raw.faqTitulo,
    faqItemsJson: JSON.stringify(raw.faqItems, null, 2),
    apiTitulo: raw.api.titulo,
    apiSubtitulo: raw.api.subtitulo,
    apiBtnDocumentacion: raw.api.btnDocumentacion,
    apiCurlTitulo: raw.api.curlTitulo,
    apiBtnCopiarToken: raw.api.btnCopiarToken,
    apiDemoToken: raw.api.demoToken,
    apiEndpointsJson: JSON.stringify(raw.apiEndpoints, null, 2),
    datasetsTitulo: raw.datasetsSection.titulo,
    datasetsBtnDescargar: raw.datasetsSection.btnDescargar,
    datasetsJson: JSON.stringify(raw.datasets, null, 2),
    politicasJson: JSON.stringify(raw.politicas, null, 2),
  };
}

export function normalizeContactoCentroConfigInput(
  input: AdminContactoCentroConfigFormInput,
): { raw?: ContactoCentroConfigRaw; error?: string } {
  const hero = parseHero({
    breadcrumbInicio: input.heroBreadcrumbInicio,
    breadcrumbActual: input.heroBreadcrumbActual,
    titulo: input.heroTitulo,
    subtitulo: input.heroSubtitulo,
  });

  if (!hero.titulo) return { error: "El título del hero es obligatorio" };
  if (!hero.subtitulo) return { error: "El subtítulo del hero es obligatorio" };

  const buzon = parseBuzon({
    badge: input.buzonBadge,
    titulo: input.buzonTitulo,
    descripcion: input.buzonDescripcion,
    btnEnviar: input.buzonBtnEnviar,
    campos: {
      nombre: { label: input.buzonNombreLabel, placeholder: input.buzonNombrePlaceholder },
      email: { label: input.buzonEmailLabel, placeholder: input.buzonEmailPlaceholder },
      asunto: { label: input.buzonAsuntoLabel, placeholder: input.buzonAsuntoPlaceholder },
      mensaje: { label: input.buzonMensajeLabel, placeholder: input.buzonMensajePlaceholder },
    },
  });

  if (!buzon.titulo) return { error: "El título del buzón es obligatorio" };

  let faqItemsParsed: unknown;
  try {
    faqItemsParsed = JSON.parse(input.faqItemsJson?.trim() || "[]");
  } catch {
    return { error: "faq_items debe ser JSON válido" };
  }

  let apiEndpointsParsed: unknown;
  try {
    apiEndpointsParsed = JSON.parse(input.apiEndpointsJson?.trim() || "[]");
  } catch {
    return { error: "api_endpoints debe ser JSON válido" };
  }

  let datasetsParsed: unknown;
  try {
    datasetsParsed = JSON.parse(input.datasetsJson?.trim() || "[]");
  } catch {
    return { error: "datasets debe ser JSON válido" };
  }

  let politicasParsed: unknown;
  try {
    politicasParsed = JSON.parse(input.politicasJson?.trim() || "{}");
  } catch {
    return { error: "politicas debe ser JSON válido" };
  }

  const raw: ContactoCentroConfigRaw = {
    hero,
    buzon,
    faqTitulo: input.faqTitulo?.trim() || contactoFaqMock.titulo,
    faqItems: parseFaqItems(faqItemsParsed),
    api: parseApi({
      titulo: input.apiTitulo,
      subtitulo: input.apiSubtitulo,
      btnDocumentacion: input.apiBtnDocumentacion,
      curlTitulo: input.apiCurlTitulo,
      btnCopiarToken: input.apiBtnCopiarToken,
      demoToken: input.apiDemoToken,
    }),
    apiEndpoints: parseApiEndpoints(apiEndpointsParsed),
    datasetsSection: parseDatasetsSection({
      titulo: input.datasetsTitulo,
      btnDescargar: input.datasetsBtnDescargar,
    }),
    datasets: parseDatasets(datasetsParsed),
    politicas: parsePoliticas(politicasParsed),
  };

  return { raw };
}

export function applyAnioToContactoDatasets(
  datasets: ContactoDatasetCardConfig[],
  anio: number,
): ContactoDatasetCardConfig[] {
  return datasets.map((dataset) =>
    dataset.id === "reporte"
      ? {
          ...dataset,
          title: `Reporte Anual ${anio}`,
          format: "PDF + Excel (ZIP)",
          filename: `geoarte-reporte-anual-${anio}.zip`,
        }
      : dataset,
  );
}
