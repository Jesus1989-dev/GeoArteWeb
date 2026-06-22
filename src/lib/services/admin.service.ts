import {
  adminCapasSig as adminCapasSigMock,
  adminCapasSigMeta,
  adminMapaCapasMeta,
  adminEspaciosTabs,
  adminHeader,
  adminKpis as adminKpisMock,
  adminListadoMeta as adminListadoMetaMock,
  adminMenu as adminMenuMock,
  adminValidacionPendientes as adminValidacionPendientesMock,
  espaciosAdmin as espaciosAdminMock,
} from "@/lib/data/mock/admin";
import type {
  AdminCapaSigRow,
  AdminEspacioRow,
  AdminKpi,
  AdminListadoMeta,
  AdminValidacionMetrica,
} from "@/lib/domain/admin";
import { isSupabaseConfigured } from "@/lib/data/supabase/config";
import {
  ADMIN_PAGE_SIZE,
  fetchAdminEspaciosPage,
  fetchAdminFromSupabase,
} from "@/lib/data/supabase/admin.repository";
import { withTimeout } from "@/lib/utils/with-timeout";

const SUPABASE_LOAD_TIMEOUT_MS = 25_000;

export type AdminDataSource = "supabase" | "mock";

export type AdminMenuItem = {
  id: string;
  label: string;
  section: "Gestión de datos" | "Validaciones";
  icon?: "layers";
  badge?: number;
};

export type AdminValidacionPendientes = {
  titulo: string;
  subtitulo: string;
  badge: number;
  seccionId: string;
};

export type AdminCapasSigMeta = {
  titulo: string;
  subtitulo: string;
  btnNuevaCapa: string;
};

export type AdminMapaCapasMeta = {
  titulo: string;
  subtitulo: string;
  btnSincronizar: string;
  historialTitulo: string;
  notaSeeds: string;
  notaCron: string;
};

export type AdminPageData = {
  adminHeader: typeof adminHeader;
  adminKpis: AdminKpi[];
  adminMenu: AdminMenuItem[];
  adminValidacionPendientes: AdminValidacionPendientes;
  adminEspaciosTabs: typeof adminEspaciosTabs;
  adminListadoMeta: AdminListadoMeta;
  adminCapasSigMeta: AdminCapasSigMeta;
  adminMapaCapasMeta: AdminMapaCapasMeta;
  adminCapasSig: AdminCapaSigRow[];
  espaciosAdmin: AdminEspacioRow[];
  validacionMetricas: AdminValidacionMetrica[];
  dataSource: AdminDataSource;
  dataSourceNote: string;
};

function getAdminMockData(): AdminPageData {
  return {
    adminHeader,
    adminKpis: adminKpisMock.map((k) => ({ ...k })),
    adminMenu: adminMenuMock.map((m) => ({ ...m })),
    adminValidacionPendientes: { ...adminValidacionPendientesMock },
    adminEspaciosTabs,
    adminListadoMeta: {
      totalEspacios: adminListadoMetaMock.totalEspacios,
      busquedaPlaceholder: adminListadoMetaMock.busquedaPlaceholder,
      puedeAnterior: adminListadoMetaMock.puedeAnterior,
      puedeSiguiente: adminListadoMetaMock.puedeSiguiente,
      pagina: 1,
      totalPaginas: 1,
      pageSize: ADMIN_PAGE_SIZE,
    },
    adminCapasSigMeta,
    adminMapaCapasMeta,
    adminCapasSig: adminCapasSigMock.map((c) => ({ ...c })),
    espaciosAdmin: espaciosAdminMock.map((e) => ({ ...e })),
    validacionMetricas: [],
    dataSource: "mock",
    dataSourceNote: "Datos de demostración — configura NEXT_PUBLIC_SUPABASE_* en .env.local",
  };
}

function buildListadoMeta(input: {
  total: number;
  page: number;
  pageSize: number;
  totalPaginas: number;
}): AdminListadoMeta {
  return {
    totalEspacios: input.total,
    busquedaPlaceholder: "Buscar por ID o nombre...",
    puedeAnterior: input.page > 1,
    puedeSiguiente: input.page < input.totalPaginas,
    pagina: input.page,
    totalPaginas: input.totalPaginas,
    pageSize: input.pageSize,
  };
}

/** Controlador de datos — administración (Supabase o mock). */
export async function getAdminPageData(): Promise<AdminPageData> {
  if (!isSupabaseConfigured()) {
    return getAdminMockData();
  }

  try {
    const payload = await withTimeout(
      fetchAdminFromSupabase(),
      SUPABASE_LOAD_TIMEOUT_MS,
      "Administración",
    );

    return {
      adminHeader,
      adminKpis: payload.adminKpis,
      adminMenu: adminMenuMock.map((m) =>
        m.id === "pendientes" ? { ...m, badge: payload.pendientesBadge } : { ...m },
      ),
      adminValidacionPendientes: {
        ...adminValidacionPendientesMock,
        badge: payload.pendientesBadge,
      },
      adminEspaciosTabs,
      adminListadoMeta: buildListadoMeta({
        total: payload.listadoMeta.totalEspacios,
        page: payload.listadoMeta.page,
        pageSize: payload.listadoMeta.pageSize,
        totalPaginas: payload.listadoMeta.totalPaginas,
      }),
      adminCapasSigMeta: {
        ...adminCapasSigMeta,
        subtitulo:
          "Tipologías SIC desde categorias_espacios — capas temáticas del mapa interactivo.",
      },
      adminMapaCapasMeta,
      adminCapasSig: payload.adminCapasSig,
      espaciosAdmin: payload.espaciosAdmin,
      validacionMetricas: payload.validacionMetricas,
      dataSource: "supabase",
      dataSourceNote: `${payload.listadoMeta.totalEspacios.toLocaleString("es-MX")} espacios en padrón · ${payload.pendientesBadge.toLocaleString("es-MX")} pendientes de calidad`,
    };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error desconocido al cargar admin";
    console.error("[admin] Supabase:", message);
    return {
      ...getAdminMockData(),
      dataSource: "mock",
      dataSourceNote: `Fallback demo (${message})`,
    };
  }
}

export async function getAdminEspaciosPage(input: {
  page: number;
  search?: string;
}): Promise<{ espaciosAdmin: AdminEspacioRow[]; adminListadoMeta: AdminListadoMeta }> {
  if (!isSupabaseConfigured()) {
    const mock = getAdminMockData();
    return {
      espaciosAdmin: mock.espaciosAdmin,
      adminListadoMeta: mock.adminListadoMeta,
    };
  }

  const result = await fetchAdminEspaciosPage({
    page: input.page,
    search: input.search,
  });

  return {
    espaciosAdmin: result.rows,
    adminListadoMeta: buildListadoMeta({
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      totalPaginas: result.totalPaginas,
    }),
  };
}

export function getAdminPageDataMock(): AdminPageData {
  return getAdminMockData();
}
