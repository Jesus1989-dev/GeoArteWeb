-- Índices para listado paginado, filtros y búsqueda ilike del repositorio cualitativo.

create extension if not exists pg_trgm;

-- Listados publicados (activo = true), alineados con order by orden, id
create index if not exists recursos_cualitativos_activo_orden_idx
  on public.recursos_cualitativos (orden asc, id asc)
  where activo = true;

create index if not exists recursos_cualitativos_activo_tipo_orden_idx
  on public.recursos_cualitativos (tipo, orden asc, id asc)
  where activo = true;

create index if not exists recursos_cualitativos_activo_alcaldia_orden_idx
  on public.recursos_cualitativos (alcaldia, orden asc, id asc)
  where activo = true;

-- Búsqueda ilike (%término%) en campos consultados por la API
create index if not exists recursos_cualitativos_titulo_trgm_idx
  on public.recursos_cualitativos using gin (titulo gin_trgm_ops);

create index if not exists recursos_cualitativos_snippet_trgm_idx
  on public.recursos_cualitativos using gin (snippet gin_trgm_ops);

create index if not exists recursos_cualitativos_alcaldia_trgm_idx
  on public.recursos_cualitativos using gin (alcaldia gin_trgm_ops);

create index if not exists recursos_cualitativos_investigador_trgm_idx
  on public.recursos_cualitativos using gin (investigador gin_trgm_ops);
