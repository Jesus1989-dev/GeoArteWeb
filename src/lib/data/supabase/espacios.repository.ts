import type { SupabaseClient } from "@supabase/supabase-js";
import type { Espacio } from "@/lib/domain/mapa";
import { getSupabaseBrowserClient } from "@/lib/data/supabase/client";
import { resolveEspacioTipo } from "@/lib/data/supabase/espacio-tipo";
import { resolveEspacioImagenUrl } from "@/lib/espacios/espacio-imagen";

const CHUNK_SIZE = 1000;
/** Límite de seguridad: evita cargas eternas si el padrón crece mucho. */
const MAX_CHUNKS = 5;
/** Muestra georreferenciada para el preview espacial del inicio (no el padrón completo). */
const HOME_SPATIAL_PREVIEW_POOL = 120;

const MAPA_SELECT =
  "id, nombre, direccion, alcaldia, latitud, longitud, tipo, image_path, url_imagen_sic, categorias_espacios(nombre)";

const CDMX_LAT = { min: 19.0, max: 19.7 } as const;
const CDMX_LNG = { min: -99.4, max: -98.9 } as const;

type EspacioRow = {
  id: string;
  nombre: string;
  direccion: string | null;
  alcaldia: string | null;
  latitud: number | null;
  longitud: number | null;
  tipo: string | null;
  image_path: string | null;
  url_imagen_sic: string | null;
  categorias_espacios:
    | { nombre: string | null }
    | { nombre: string | null }[]
    | null;
};

function categoriaNombreFromRow(row: EspacioRow): string | null {
  const rel = row.categorias_espacios;
  if (rel == null) return null;
  if (Array.isArray(rel)) return rel[0]?.nombre ?? null;
  return rel.nombre ?? null;
}

function isCoordenadaValida(lat: number, lng: number): boolean {
  return (
    lat >= CDMX_LAT.min &&
    lat <= CDMX_LAT.max &&
    lng >= CDMX_LNG.min &&
    lng <= CDMX_LNG.max
  );
}

function mapRowToEspacio(row: EspacioRow): Espacio | null {
  const lat = row.latitud;
  const lng = row.longitud;
  if (lat == null || lng == null || !Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }
  if (!isCoordenadaValida(lat, lng)) return null;

  const categoriaNombre = categoriaNombreFromRow(row);
  const imagenUrl = resolveEspacioImagenUrl({
    imagePath: row.image_path,
    urlImagenSic: row.url_imagen_sic,
  });

  return {
    id: row.id,
    nombre: row.nombre?.trim() || "Sin nombre",
    tipo: resolveEspacioTipo({
      categoriaNombre,
      tipo: row.tipo,
      nombre: row.nombre,
    }),
    lat,
    lng,
    direccion: row.direccion?.trim() || row.alcaldia?.trim() || "CDMX",
    alcaldia: row.alcaldia?.trim() || undefined,
    ...(imagenUrl ? { imagenUrl } : {}),
  };
}

function uniqueById(espacios: Espacio[]): Espacio[] {
  const seen = new Set<string>();
  const out: Espacio[] = [];
  for (const e of espacios) {
    if (!e.id) {
      out.push(e);
      continue;
    }
    if (seen.has(e.id)) continue;
    seen.add(e.id);
    out.push(e);
  }
  return out;
}

/**
 * Carga todos los espacios georreferenciados (misma estrategia que Flutter:
 * paginación PostgREST en bloques de 1000).
 */
export async function fetchEspaciosCulturalesForMapa(
  clientOverride?: SupabaseClient,
): Promise<Espacio[]> {
  const client = clientOverride ?? getSupabaseBrowserClient();
  if (!client) return [];

  const all: Espacio[] = [];
  let from = 0;
  let chunkIndex = 0;

  while (chunkIndex < MAX_CHUNKS) {
    chunkIndex += 1;
    const to = from + CHUNK_SIZE - 1;
    const { data, error } = await client
      .from("espacios_culturales")
      .select(MAPA_SELECT)
      .not("latitud", "is", null)
      .not("longitud", "is", null)
      .order("nombre", { ascending: true })
      .range(from, to);

    if (error) {
      throw new Error(`Supabase espacios_culturales: ${error.message}`);
    }

    const rows = (data ?? []) as EspacioRow[];
    if (rows.length === 0) break;

    for (const row of rows) {
      const espacio = mapRowToEspacio(row);
      if (espacio) all.push(espacio);
    }

    if (rows.length < CHUNK_SIZE) break;
    from += CHUNK_SIZE;
  }

  return uniqueById(all);
}

export type EspaciosSpatialPreviewResult = {
  totalGeoref: number;
  espacios: Espacio[];
};

/** Conteo exacto + muestra acotada para el preview espacial del inicio. */
export async function fetchEspaciosSpatialPreviewForHome(
  clientOverride?: SupabaseClient,
  poolSize = HOME_SPATIAL_PREVIEW_POOL,
): Promise<EspaciosSpatialPreviewResult> {
  const client = clientOverride ?? getSupabaseBrowserClient();
  if (!client) {
    return { totalGeoref: 0, espacios: [] };
  }

  const [countRes, sampleRes] = await Promise.all([
    client
      .from("espacios_culturales")
      .select("id", { count: "exact", head: true })
      .not("latitud", "is", null)
      .not("longitud", "is", null),
    client
      .from("espacios_culturales")
      .select(MAPA_SELECT)
      .not("latitud", "is", null)
      .not("longitud", "is", null)
      .order("nombre", { ascending: true })
      .limit(poolSize),
  ]);

  if (countRes.error) {
    throw new Error(
      `Supabase espacios_culturales (conteo preview): ${countRes.error.message}`,
    );
  }
  if (sampleRes.error) {
    throw new Error(
      `Supabase espacios_culturales (muestra preview): ${sampleRes.error.message}`,
    );
  }

  const espacios: Espacio[] = [];
  for (const row of (sampleRes.data ?? []) as EspacioRow[]) {
    const espacio = mapRowToEspacio(row);
    if (espacio) espacios.push(espacio);
  }

  return {
    totalGeoref: countRes.count ?? espacios.length,
    espacios: uniqueById(espacios),
  };
}
