-- Fase 3 mapa: capa de transporte masivo (Metro, Metrobús, Cablebús) en PostGIS.
-- Requiere PostGIS habilitado (schema extensions).

create table if not exists public.capa_transporte_linea (
  id text primary key,
  nombre text not null,
  sistema text not null default 'referencia'
    check (sistema in ('metro', 'metrobús', 'cablebús', 'referencia')),
  color_hex text,
  orden integer not null default 0,
  activo boolean not null default true,
  geom extensions.geometry(MultiLineString, 4326) not null,
  actualizado_en timestamptz not null default now()
);

create index if not exists capa_transporte_linea_activo_idx
  on public.capa_transporte_linea (activo, orden);

create index if not exists capa_transporte_linea_geom_gix
  on public.capa_transporte_linea using gist (geom);

comment on table public.capa_transporte_linea is
  'Trazos georreferenciados de transporte masivo CDMX para el mapa y API v1.';

create or replace function public.upsert_transporte_desde_geojson(
  p_id text,
  p_nombre text,
  p_sistema text,
  p_color_hex text,
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
  if p_sistema not in ('metro', 'metrobús', 'cablebús', 'referencia') then
    raise exception 'sistema inválido: %', p_sistema;
  end if;

  v_geom := st_multi(
    st_setsrid(st_geomfromgeojson(p_geojson -> 'geometry'), 4326)
  );

  if v_geom is null or st_isempty(v_geom) then
    raise exception 'geometría vacía para %', p_nombre;
  end if;

  insert into public.capa_transporte_linea (
    id, nombre, sistema, color_hex, geom, actualizado_en
  )
  values (p_id, p_nombre, p_sistema, p_color_hex, v_geom, now())
  on conflict (id) do update
    set nombre = excluded.nombre,
        sistema = excluded.sistema,
        color_hex = excluded.color_hex,
        geom = excluded.geom,
        actualizado_en = now();
end;
$$;

create or replace function public.transporte_geojson()
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
            'id', t.id,
            'nombre', t.nombre,
            'color', coalesce(t.color_hex, '#334155'),
            'tipo', t.sistema,
            'sistema', t.sistema
          ),
          'geometry', st_asgeojson(t.geom)::jsonb
        )
        order by t.orden, t.nombre
      )
    ),
    jsonb_build_object('type', 'FeatureCollection', 'features', '[]'::jsonb)
  )
  from public.capa_transporte_linea t
  where t.activo = true;
$$;

alter table public.capa_transporte_linea enable row level security;

drop policy if exists "capa_transporte_linea_select_public" on public.capa_transporte_linea;
create policy "capa_transporte_linea_select_public"
  on public.capa_transporte_linea
  for select
  to anon, authenticated
  using (activo = true);

grant select on public.capa_transporte_linea to anon, authenticated;
grant execute on function public.transporte_geojson() to anon, authenticated;
grant execute on function public.upsert_transporte_desde_geojson(text, text, text, text, jsonb)
  to authenticated, service_role;
