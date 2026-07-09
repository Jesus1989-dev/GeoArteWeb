-- Alinea sync_metricas_alcaldia con GeoArte móvil (brecha de cobertura SECTEI).
--
-- cobertura = espacios_alcaldía / total_ciudad_georef × 100
-- brecha    = 100 − cobertura
--
-- Reemplaza la escala relativa al máximo (85 / 70) usada hasta 2026-06.

create or replace function public.sync_metricas_alcaldia(p_anio integer default extract(year from now())::integer)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_total_count integer := 0;
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

  select coalesce(sum(cantidad), 0) into v_total_count from tmp_conteo_alcaldia;

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
      when v_total_count = 0 or t.cantidad = 0 then 0
      else least(100, greatest(0, round(100.0 * t.cantidad::numeric / v_total_count, 2)))
    end,
    case
      when v_total_count = 0 then 0
      when t.cantidad = 0 then 100
      else least(100, greatest(0, round(100.0 - (100.0 * t.cantidad::numeric / v_total_count), 2)))
    end,
    now()
  from tmp_conteo_alcaldia t;

  get diagnostics v_rows = row_count;
  return v_rows;
end;
$$;

comment on function public.sync_metricas_alcaldia(integer) is
  'Recalcula metricas_alcaldia desde espacios georreferenciados. Brecha SECTEI (paridad app móvil).';

-- Recalcula filas del año en curso tras el cambio de fórmula.
do $$
declare
  v_anio integer := extract(year from now())::integer;
begin
  if to_regclass('public.espacios_culturales') is not null then
    perform public.sync_metricas_alcaldia(v_anio);
  end if;
end;
$$;
