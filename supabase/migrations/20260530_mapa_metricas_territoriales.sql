-- Fase 1 mapa territorial: métricas por alcaldía y densidad por macrozona.
-- Deriva valores del padrón espacios_culturales cuando existe.

-- ---------------------------------------------------------------------------
-- Catálogo alcaldía → macrozona (referencia CDMX, editable)
-- ---------------------------------------------------------------------------
create table if not exists public.alcaldia_macrozona (
  alcaldia_nombre text primary key,
  macrozona text not null check (macrozona in ('NORTE', 'CENTRO', 'SUR', 'PONIENTE', 'ORIENTE'))
);

insert into public.alcaldia_macrozona (alcaldia_nombre, macrozona) values
  ('Álvaro Obregón', 'PONIENTE'),
  ('Azcapotzalco', 'NORTE'),
  ('Benito Juárez', 'CENTRO'),
  ('Coyoacán', 'SUR'),
  ('Cuajimalpa de Morelos', 'PONIENTE'),
  ('Cuajimalpa', 'PONIENTE'),
  ('Cuauhtémoc', 'CENTRO'),
  ('Gustavo A. Madero', 'NORTE'),
  ('Iztacalco', 'ORIENTE'),
  ('Iztapalapa', 'ORIENTE'),
  ('La Magdalena Contreras', 'SUR'),
  ('Miguel Hidalgo', 'CENTRO'),
  ('Milpa Alta', 'SUR'),
  ('Tláhuac', 'ORIENTE'),
  ('Tlalpan', 'SUR'),
  ('Venustiano Carranza', 'ORIENTE'),
  ('Xochimilco', 'SUR')
on conflict (alcaldia_nombre) do update
  set macrozona = excluded.macrozona;

-- ---------------------------------------------------------------------------
-- Métricas por alcaldía (consumida por mapa, dashboard, home, API v1)
-- ---------------------------------------------------------------------------
create table if not exists public.metricas_alcaldia (
  id uuid primary key default gen_random_uuid(),
  alcaldia_id uuid references public.alcaldias(id),
  alcaldia_nombre text not null,
  anio integer not null check (anio >= 1990 and anio <= 2100),
  cantidad_espacios integer not null default 0 check (cantidad_espacios >= 0),
  porcentaje_cobertura numeric(5, 2) not null default 0
    check (porcentaje_cobertura >= 0 and porcentaje_cobertura <= 100),
  porcentaje_brecha numeric(5, 2) not null default 0
    check (porcentaje_brecha >= 0 and porcentaje_brecha <= 100),
  actualizado_en timestamptz not null default now(),
  unique (alcaldia_nombre, anio)
);

-- Tabla legacy en Supabase puede carecer de columnas nuevas.
alter table public.metricas_alcaldia
  add column if not exists alcaldia_id uuid references public.alcaldias(id);

alter table public.metricas_alcaldia
  add column if not exists actualizado_en timestamptz not null default now();

create index if not exists metricas_alcaldia_anio_idx
  on public.metricas_alcaldia (anio desc);

create index if not exists metricas_alcaldia_nombre_idx
  on public.metricas_alcaldia (alcaldia_nombre);

comment on table public.metricas_alcaldia is
  'Métricas territoriales por alcaldía (cobertura cultural y brecha). Sincronizable desde espacios_culturales.';

-- Normaliza nombre de alcaldía para joins tolerantes a acentos / variantes.
create or replace function public.norm_alcaldia(p_value text)
returns text
language sql
immutable
as $$
  select lower(trim(translate(
    coalesce(p_value, ''),
    'áéíóúüñÁÉÍÓÚÜÑ',
    'aeiouunaeiouun'
  )));
$$;

-- Recalcula metricas_alcaldia a partir del padrón georreferenciado.
create or replace function public.sync_metricas_alcaldia(p_anio integer default extract(year from now())::integer)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_max_count integer := 0;
  v_rows integer := 0;
begin
  if to_regclass('public.espacios_culturales') is null then
    return 0;
  end if;

  if to_regclass('public.alcaldias') is null then
    return 0;
  end if;

  create temp table tmp_conteo_alcaldia on commit drop as
  select
    a.id as alcaldia_id,
    a.nombre as alcaldia_nombre,
    count(*)::integer as cantidad
  from public.espacios_culturales e
  inner join public.alcaldias a
    on public.norm_alcaldia(a.nombre) = public.norm_alcaldia(trim(e.alcaldia))
  where e.latitud is not null
    and e.longitud is not null
    and nullif(trim(e.alcaldia), '') is not null
  group by a.id, a.nombre;

  select coalesce(max(cantidad), 0) into v_max_count from tmp_conteo_alcaldia;

  delete from public.metricas_alcaldia where anio = p_anio;

  insert into public.metricas_alcaldia (
    alcaldia_id,
    alcaldia_nombre,
    anio,
    cantidad_espacios,
    porcentaje_cobertura,
    porcentaje_brecha,
    actualizado_en
  )
  select
    t.alcaldia_id,
    t.alcaldia_nombre,
    p_anio,
    t.cantidad,
    case
      when v_max_count = 0 then 0
      else least(100, round(85.0 * t.cantidad::numeric / v_max_count, 2))
    end,
    case
      when v_max_count = 0 then 0
      else least(100, round(70.0 * (1 - t.cantidad::numeric / v_max_count), 2))
    end,
    now()
  from tmp_conteo_alcaldia t;

  get diagnostics v_rows = row_count;
  return v_rows;
end;
$$;

-- Densidad de infraestructura cultural por macrozona (% del total filtrado).
-- DROP necesario: PostgreSQL no permite cambiar OUT/RETURNS TABLE con CREATE OR REPLACE.
drop function if exists public.densidad_por_macrozona(text);

create or replace function public.densidad_por_macrozona(alcaldia_filtro text default null)
returns table(macrozona text, porcentaje numeric)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if to_regclass('public.espacios_culturales') is null then
    return;
  end if;

  return query
  with espacios as (
    select trim(e.alcaldia) as alcaldia
    from public.espacios_culturales e
    where e.latitud is not null
      and e.longitud is not null
      and (
        alcaldia_filtro is null
        or trim(alcaldia_filtro) = ''
        or public.norm_alcaldia(e.alcaldia) = public.norm_alcaldia(alcaldia_filtro)
      )
  ),
  joined as (
    select m.macrozona
    from espacios e
    inner join public.alcaldia_macrozona m
      on public.norm_alcaldia(m.alcaldia_nombre) = public.norm_alcaldia(e.alcaldia)
  ),
  counts as (
    select j.macrozona, count(*)::numeric as cnt
    from joined j
    group by j.macrozona
  ),
  total as (
    select coalesce(sum(cnt), 0)::numeric as t from counts
  )
  select
    c.macrozona,
    case
      when t.t = 0 then 0::numeric
      else round(100.0 * c.cnt / t.t, 2)
    end as porcentaje
  from counts c
  cross join total t
  order by c.macrozona;
end;
$$;

-- ---------------------------------------------------------------------------
-- RLS: lectura pública
-- ---------------------------------------------------------------------------
alter table public.alcaldia_macrozona enable row level security;
alter table public.metricas_alcaldia enable row level security;

drop policy if exists "alcaldia_macrozona_select_public" on public.alcaldia_macrozona;
create policy "alcaldia_macrozona_select_public"
  on public.alcaldia_macrozona
  for select
  to anon, authenticated
  using (true);

drop policy if exists "metricas_alcaldia_select_public" on public.metricas_alcaldia;
create policy "metricas_alcaldia_select_public"
  on public.metricas_alcaldia
  for select
  to anon, authenticated
  using (true);

grant select on public.alcaldia_macrozona to anon, authenticated;
grant select on public.metricas_alcaldia to anon, authenticated;
grant execute on function public.densidad_por_macrozona(text) to anon, authenticated;
grant execute on function public.norm_alcaldia(text) to anon, authenticated;

-- Sincronización inicial si el padrón ya está cargado.
do $$
declare
  v_anio integer := extract(year from now())::integer;
begin
  if to_regclass('public.espacios_culturales') is not null then
    perform public.sync_metricas_alcaldia(v_anio);
  end if;
end;
$$;
