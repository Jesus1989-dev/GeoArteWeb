-- Fase 2 mapa territorial: geometrías PostGIS (alcaldías y macrozonas).
--
-- IMPORTANTE (Supabase): habilita PostGIS antes de ejecutar este script:
--   Dashboard → Database → Extensions → buscar "postgis" → Enable
-- Si ya está habilitado, el CREATE EXTENSION siguiente no hará daño.

create schema if not exists extensions;
create extension if not exists postgis with schema extensions;

grant usage on schema extensions to postgres, anon, authenticated, service_role;

create table if not exists public.territorio_geometria (
  id uuid primary key default gen_random_uuid(),
  tipo text not null check (tipo in ('alcaldia', 'macrozona')),
  codigo text not null,
  nombre text not null,
  geom extensions.geometry(MultiPolygon, 4326) not null,
  actualizado_en timestamptz not null default now(),
  unique (tipo, codigo)
);

create index if not exists territorio_geometria_tipo_idx
  on public.territorio_geometria (tipo);

create index if not exists territorio_geometria_geom_gix
  on public.territorio_geometria using gist (geom);

comment on table public.territorio_geometria is
  'Límites cartográficos de alcaldías y macrozonas CDMX (PostGIS).';

-- GeoJSON de una feature (geometría en properties.geometry o raíz).
create or replace function public.upsert_territorio_desde_geojson(
  p_tipo text,
  p_codigo text,
  p_nombre text,
  p_geojson jsonb
)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_geom extensions.geometry;
begin
  if p_tipo not in ('alcaldia', 'macrozona') then
    raise exception 'tipo inválido: %', p_tipo;
  end if;

  v_geom := st_multi(
    st_setsrid(st_geomfromgeojson(p_geojson -> 'geometry'), 4326)
  );

  if v_geom is null or st_isempty(v_geom) then
    raise exception 'geometría vacía para %', p_nombre;
  end if;

  insert into public.territorio_geometria (tipo, codigo, nombre, geom, actualizado_en)
  values (p_tipo, p_codigo, p_nombre, v_geom, now())
  on conflict (tipo, codigo) do update
    set nombre = excluded.nombre,
        geom = excluded.geom,
        actualizado_en = now();
end;
$$;

-- Agrega macrozonas como unión de alcaldías según alcaldia_macrozona.
create or replace function public.sync_macrozonas_desde_alcaldias()
returns integer
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_rows integer := 0;
begin
  delete from public.territorio_geometria where tipo = 'macrozona';

  insert into public.territorio_geometria (tipo, codigo, nombre, geom, actualizado_en)
  select
    'macrozona',
    am.macrozona,
    am.macrozona,
    st_multi(st_union(tg.geom)),
    now()
  from public.alcaldia_macrozona am
  inner join public.territorio_geometria tg
    on tg.tipo = 'alcaldia'
   and public.norm_alcaldia(tg.nombre) = public.norm_alcaldia(am.alcaldia_nombre)
  group by am.macrozona;

  get diagnostics v_rows = row_count;
  return v_rows;
end;
$$;

-- FeatureCollection GeoJSON por tipo territorial.
create or replace function public.territorio_geojson(p_tipo text default 'alcaldia')
returns jsonb
language sql
stable
security definer
set search_path = public, extensions
as $$
  select coalesce(
    jsonb_build_object(
      'type', 'FeatureCollection',
      'features', jsonb_agg(
        jsonb_build_object(
          'type', 'Feature',
          'properties', jsonb_build_object(
            'nombre', tg.nombre,
            'codigo', tg.codigo,
            'macrozona', case
              when p_tipo = 'alcaldia' then am.macrozona
              else tg.codigo
            end
          ),
          'geometry', st_asgeojson(tg.geom)::jsonb
        )
        order by tg.nombre
      )
    ),
    jsonb_build_object('type', 'FeatureCollection', 'features', '[]'::jsonb)
  )
  from public.territorio_geometria tg
  left join public.alcaldia_macrozona am
    on p_tipo = 'alcaldia'
   and public.norm_alcaldia(am.alcaldia_nombre) = public.norm_alcaldia(tg.nombre)
  where tg.tipo = p_tipo;
$$;

alter table public.territorio_geometria enable row level security;

drop policy if exists "territorio_geometria_select_public" on public.territorio_geometria;
create policy "territorio_geometria_select_public"
  on public.territorio_geometria
  for select
  to anon, authenticated
  using (true);

grant select on public.territorio_geometria to anon, authenticated;
grant execute on function public.territorio_geojson(text) to anon, authenticated;
grant execute on function public.sync_macrozonas_desde_alcaldias() to authenticated, service_role;
grant execute on function public.upsert_territorio_desde_geojson(text, text, text, jsonb) to authenticated, service_role;
