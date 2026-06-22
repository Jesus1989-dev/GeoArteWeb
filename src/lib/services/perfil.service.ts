import {
  perfilConfigPlaceholder,
  perfilHistorialPlaceholder,
  perfilRecursosMeta,
  perfilRoles,
  perfilTabs,
  perfilUsuario,
  recursosGuardados,
} from "@/lib/data/mock/perfil";
import { fetchExportDownloadsForUser } from "@/lib/data/supabase/export-downloads.repository";
import { getSupabaseBrowserClient } from "@/lib/data/supabase/client";
import { uploadAvatarImage } from "@/lib/auth/avatar-storage";
import { updateUserProfile } from "@/lib/data/supabase/profiles.repository";
import { isSupabaseConfigured } from "@/lib/data/supabase/config";
import {
  countExportDownloadsForUser,
  countSavedEspaciosForUser,
  deleteSavedEspacioForUser,
  fetchSavedEspaciosForUser,
  insertSavedEspacioForUser,
} from "@/lib/data/supabase/saved-espacios.repository";
import type {
  PerfilEspacioGuardado,
  PerfilExportacion,
  PerfilStat,
} from "@/lib/domain/perfil";
import { withTimeout } from "@/lib/utils/with-timeout";

const PERFIL_DATA_TIMEOUT_MS = 15_000;

export type PerfilDataSource = "supabase" | "mock";

export type PerfilRecursosMeta = {
  titulo: string;
  subtitulo: string;
  filtrarLabel: string;
  explorarMapaLabel: string;
  explorarMapaHref: string;
  abrirLabel: string;
};

export type PerfilPageData = {
  perfilRoles: typeof perfilRoles;
  perfilTabs: typeof perfilTabs;
  perfilRecursosMeta: PerfilRecursosMeta;
  espaciosGuardados: PerfilEspacioGuardado[];
  historialExportaciones: PerfilExportacion[];
  perfilStats: PerfilStat[];
  perfilHistorialPlaceholder: typeof perfilHistorialPlaceholder;
  perfilConfigPlaceholder: typeof perfilConfigPlaceholder;
  dataSource: PerfilDataSource;
  dataSourceNote: string;
  canEliminar: boolean;
  canEditConfig: boolean;
};

function mapMockRecursos(): PerfilEspacioGuardado[] {
  return recursosGuardados.map((r) => ({
    id: r.id,
    nombre: r.titulo,
    alcaldia: "CDMX",
    tipo: r.categoriaLabel,
    guardadoEl: r.guardadoEl,
    href: r.href,
  }));
}

function getPerfilMockData(): PerfilPageData {
  const espacios = mapMockRecursos();
  return {
    perfilRoles,
    perfilTabs,
    perfilRecursosMeta: {
      titulo: perfilRecursosMeta.titulo,
      subtitulo: perfilRecursosMeta.subtitulo,
      filtrarLabel: perfilRecursosMeta.filtrarLabel,
      explorarMapaLabel: perfilRecursosMeta.explorarMapaLabel,
      explorarMapaHref: perfilRecursosMeta.explorarMapaHref,
      abrirLabel: perfilRecursosMeta.abrirLabel,
    },
    espaciosGuardados: espacios,
    historialExportaciones: [],
    perfilStats: perfilUsuario.stats.map((s) => ({ ...s })),
    perfilHistorialPlaceholder,
    perfilConfigPlaceholder,
    dataSource: "mock",
    dataSourceNote: "Datos de demostración — configura NEXT_PUBLIC_SUPABASE_* en .env",
    canEliminar: false,
    canEditConfig: false,
  };
}

/** Controlador de datos — perfil (Supabase o mock). */
export async function getPerfilPageData(input?: {
  userId?: string;
  autor?: string;
}): Promise<PerfilPageData> {
  if (!isSupabaseConfigured() || !input?.userId) {
    return getPerfilMockData();
  }

  try {
    const [espaciosGuardados, historialExportaciones, savedCount, exportCount] =
      await withTimeout(
        Promise.all([
          fetchSavedEspaciosForUser(input.userId),
          fetchExportDownloadsForUser(input.userId, 40, input.autor),
          countSavedEspaciosForUser(input.userId),
          countExportDownloadsForUser(input.userId),
        ]),
        PERFIL_DATA_TIMEOUT_MS,
        "Perfil",
      );

    return {
      perfilRoles,
      perfilTabs,
      perfilRecursosMeta: {
        titulo: "Espacios guardados",
        subtitulo:
          "Tus espacios culturales favoritos, sincronizados con la app móvil (tabla saved_espacios).",
        filtrarLabel: "Filtrar por tipología",
        explorarMapaLabel: perfilRecursosMeta.explorarMapaLabel,
        explorarMapaHref: perfilRecursosMeta.explorarMapaHref,
        abrirLabel: "Ver en mapa",
      },
      espaciosGuardados,
      historialExportaciones,
      perfilStats: [
        {
          label: "ESPACIOS GUARDADOS",
          value: savedCount.toLocaleString("es-MX"),
          accent: "navy",
        },
        {
          label: "EXPORTACIONES",
          value: exportCount.toLocaleString("es-MX"),
          accent: "pink",
        },
      ],
      perfilHistorialPlaceholder,
      perfilConfigPlaceholder,
      dataSource: "supabase",
      dataSourceNote: `${savedCount.toLocaleString("es-MX")} espacios guardados · ${exportCount.toLocaleString("es-MX")} exportaciones registradas`,
      canEliminar: true,
      canEditConfig: true,
    };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error desconocido al cargar perfil";
    console.error("[perfil] Supabase:", message);
    return {
      ...getPerfilMockData(),
      dataSource: "mock",
      dataSourceNote: `Fallback demo (${message})`,
    };
  }
}

export function getPerfilPageDataMock(): PerfilPageData {
  return getPerfilMockData();
}

export async function removeSavedEspacio(input: {
  userId: string;
  espacioId: string;
}): Promise<void> {
  await deleteSavedEspacioForUser(input.userId, input.espacioId);
}

export async function addSavedEspacio(input: {
  userId: string;
  espacioId: string;
}): Promise<void> {
  await insertSavedEspacioForUser(input.userId, input.espacioId);
}

export async function updatePerfilName(input: {
  userId: string;
  firstName: string;
  lastName: string;
}): Promise<void> {
  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();

  if (firstName.length < 2) {
    throw new Error("El nombre debe tener al menos 2 caracteres.");
  }

  const client = getSupabaseBrowserClient();
  if (!client) {
    throw new Error("Supabase no está configurado.");
  }

  await updateUserProfile(client, input.userId, { firstName, lastName });
}

export async function uploadPerfilAvatar(input: {
  userId: string;
  file: File;
}): Promise<string> {
  const client = getSupabaseBrowserClient();
  if (!client) {
    throw new Error("Supabase no está configurado.");
  }

  const avatarUrl = await uploadAvatarImage(client, input.userId, input.file);
  await updateUserProfile(client, input.userId, { avatarUrl });
  return avatarUrl;
}
