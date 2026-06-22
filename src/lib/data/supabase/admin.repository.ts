import type {
  AdminCapaSigRow,
  AdminEspacioRow,
  AdminKpi,
  AdminValidacionMetrica,
  EstadoEspacio,
} from "@/lib/domain/admin";
import { mapCapaDbRow } from "@/lib/data/supabase/admin-capas-server";
import { mapEspacioDbRow } from "@/lib/data/supabase/admin-espacios-server";
import { deriveEstadoEspacio } from "@/lib/espacios/espacio-registro";
import { getSupabaseBrowserClient } from "@/lib/data/supabase/client";

const PAGE_SIZE_DEFAULT = 20;

type EspacioDbRow = Parameters<typeof mapEspacioDbRow>[0];

export type AdminEspaciosPageResult = {
  rows: AdminEspacioRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPaginas: number;
};

export async function fetchAdminEspaciosPage(input: {
  page?: number;
  pageSize?: number;
  search?: string;
  estado?: EstadoEspacio | "todos";
}): Promise<AdminEspaciosPageResult> {
  const client = getSupabaseBrowserClient();
  if (!client) {
    return { rows: [], total: 0, page: 1, pageSize: PAGE_SIZE_DEFAULT, totalPaginas: 0 };
  }

  const page = Math.max(1, input.page ?? 1);
  const pageSize = input.pageSize ?? PAGE_SIZE_DEFAULT;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const search = input.search?.trim();

  let query = client
    .from("espacios_culturales")
    .select(
      "id, nombre, direccion, alcaldia, tipo, horario, telefono, latitud, longitud, descripcion, updated_at",
      { count: "exact" },
    )
    .order("nombre", { ascending: true });

  if (search) {
    query = query.or(`nombre.ilike.%${search}%,id.ilike.%${search}%`);
  }

  const { data, error, count } = await query.range(from, to);

  if (error) {
    throw new Error(`Supabase admin espacios: ${error.message}`);
  }

  let rows = ((data ?? []) as EspacioDbRow[]).map(mapEspacioDbRow);

  if (input.estado && input.estado !== "todos") {
    rows = rows.filter((r) => r.estado === input.estado);
  }

  const total = count ?? rows.length;
  const totalPaginas = Math.max(1, Math.ceil(total / pageSize));

  return { rows, total, page, pageSize, totalPaginas };
}

export async function fetchAdminKpis(): Promise<AdminKpi[]> {
  const client = getSupabaseBrowserClient();
  if (!client) return [];

  const [
    { count: totalEspacios },
    { count: perfiles },
    { data: validacion },
    { count: categorias },
    { data: evidencias },
  ] = await Promise.all([
    client
      .from("espacios_culturales")
      .select("id", { count: "exact", head: true }),
    client.from("profiles").select("id", { count: "exact", head: true }),
    client.from("v_sectei_validacion_datos").select("metrica, valor, orden"),
    client.from("categorias_espacios").select("id", { count: "exact", head: true }),
    client.from("evidencias_anexo").select("estatus_validacion"),
  ]);

  const pendientesCalidad = (validacion ?? []).reduce((sum, row) => {
    const valor = Number.parseInt(String(row.valor ?? "0"), 10);
    const metrica = String(row.metrica ?? "").toLowerCase();
    if (!Number.isFinite(valor) || valor <= 0) return sum;
    if (metrica.includes("sin ") || metrica.includes("distinto")) return sum + valor;
    return sum;
  }, 0);

  const evidenciasRevision =
    evidencias?.filter((e) => e.estatus_validacion === "en_revision").length ?? 0;

  const pendientes = pendientesCalidad + evidenciasRevision;

  return [
    {
      label: "Total Espacios",
      value: (totalEspacios ?? 0).toLocaleString("es-MX"),
      descripcion: "Registros en espacios_culturales",
      tendencia: "Padrón SECTEI",
      tendenciaPositiva: true,
      icon: "building",
    },
    {
      label: "Pendientes",
      value: pendientes.toLocaleString("es-MX"),
      descripcion: "Campos incompletos y evidencias en revisión",
      tendencia: null,
      tendenciaPositiva: null,
      icon: "alert",
    },
    {
      label: "Capas temáticas",
      value: String(categorias ?? 0),
      descripcion: "Tipologías SIC publicadas en mapa",
      tendencia: null,
      tendenciaPositiva: null,
      icon: "layers",
    },
    {
      label: "Usuarios registrados",
      value: String(perfiles ?? 0),
      descripcion: "Perfiles en Supabase Auth",
      tendencia: null,
      tendenciaPositiva: null,
      icon: "users",
    },
  ];
}

export async function fetchAdminCapasFromCategorias(): Promise<AdminCapaSigRow[]> {
  const client = getSupabaseBrowserClient();
  if (!client) return [];

  const { data, error } = await client
    .from("categorias_espacios")
    .select("id, nombre, descripcion, created_at, orden")
    .order("orden", { ascending: true });

  if (error) {
    console.warn("[admin] categorias_espacios:", error.message);
    return [];
  }

  return (data ?? []).map((row) => mapCapaDbRow(row as Parameters<typeof mapCapaDbRow>[0], 0));
}

export async function fetchAdminValidacionMetricas(): Promise<AdminValidacionMetrica[]> {
  const client = getSupabaseBrowserClient();
  if (!client) return [];

  const { data, error } = await client
    .from("v_sectei_validacion_datos")
    .select("orden, metrica, valor, afecta_a")
    .order("orden", { ascending: true });

  if (error) {
    console.warn("[admin] v_sectei_validacion_datos:", error.message);
    return [];
  }

  return (data ?? []) as AdminValidacionMetrica[];
}

export async function countEspaciosEnRevision(): Promise<number> {
  const client = getSupabaseBrowserClient();
  if (!client) return 0;

  const { data, error } = await client
    .from("espacios_culturales")
    .select("horario, telefono, latitud, longitud")
    .limit(3000);

  if (error) return 0;

  return ((data ?? []) as EspacioDbRow[]).filter(
    (r) => deriveEstadoEspacio(r) === "Revisión",
  ).length;
}

export type AdminSupabasePayload = {
  adminKpis: AdminKpi[];
  espaciosAdmin: AdminEspacioRow[];
  adminCapasSig: AdminCapaSigRow[];
  validacionMetricas: AdminValidacionMetrica[];
  listadoMeta: {
    totalEspacios: number;
    page: number;
    pageSize: number;
    totalPaginas: number;
  };
  pendientesBadge: number;
};

export async function fetchAdminFromSupabase(): Promise<AdminSupabasePayload> {
  const [kpis, capas, validacionMetricas, espaciosPage, pendientesBadge] =
    await Promise.all([
      fetchAdminKpis(),
      fetchAdminCapasFromCategorias(),
      fetchAdminValidacionMetricas(),
      fetchAdminEspaciosPage({ page: 1 }),
      countEspaciosEnRevision(),
    ]);

  const pendientesFromValidacion = validacionMetricas.reduce((sum, row) => {
    const valor = Number.parseInt(row.valor, 10);
    const metrica = row.metrica.toLowerCase();
    if (!Number.isFinite(valor) || valor <= 0) return sum;
    if (metrica.includes("sin ") || metrica.includes("distinto")) return sum + valor;
    return sum;
  }, 0);

  return {
    adminKpis: kpis,
    espaciosAdmin: espaciosPage.rows,
    adminCapasSig: capas,
    validacionMetricas,
    listadoMeta: {
      totalEspacios: espaciosPage.total,
      page: espaciosPage.page,
      pageSize: espaciosPage.pageSize,
      totalPaginas: espaciosPage.totalPaginas,
    },
    pendientesBadge: Math.max(pendientesFromValidacion, pendientesBadge),
  };
}

export { PAGE_SIZE_DEFAULT as ADMIN_PAGE_SIZE };
