import { unstable_cache } from "next/cache";
import { PAGE_REVALIDATE_SECONDS } from "@/lib/cache/timing";
import { getHomePageData } from "@/lib/services/home.service";
import { getMapaDataServer } from "@/lib/services/mapa.service.server";
import { getPoliticasPageData } from "@/lib/services/politicas.service";
import { getSobreElProyectoPageData } from "@/lib/services/sobre-el-proyecto.service";
import { getContactoPageData } from "@/lib/services/contacto.service";

/** Datos de inicio — cacheados en servidor (60 s). */
export const getHomePageDataCached = unstable_cache(
  async () => getHomePageData(),
  ["page-data", "home"],
  { revalidate: PAGE_REVALIDATE_SECONDS },
);

/** Datos del mapa — cacheados en servidor (60 s). */
export const getMapaDataCached = unstable_cache(
  async () => getMapaDataServer(),
  ["page-data", "mapa"],
  { revalidate: PAGE_REVALIDATE_SECONDS },
);

export const getPoliticasPageDataCached = unstable_cache(
  async () => getPoliticasPageData(),
  ["page-data", "politicas"],
  { revalidate: PAGE_REVALIDATE_SECONDS },
);

export const getSobreElProyectoPageDataCached = unstable_cache(
  async () => getSobreElProyectoPageData(),
  ["page-data", "sobre-el-proyecto"],
  { revalidate: PAGE_REVALIDATE_SECONDS },
);

export const getContactoPageDataCached = unstable_cache(
  async (apiBaseUrl: string) => getContactoPageData(apiBaseUrl),
  ["page-data", "contacto"],
  { revalidate: PAGE_REVALIDATE_SECONDS },
);
