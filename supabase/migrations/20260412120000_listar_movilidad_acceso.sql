-- Lectura de movilidad para dashboard / app móvil (join semestre + alcaldía).
-- Requiere tablas movilidad_acceso y actualizaciones_semestrales.

create or replace function public.listar_movilidad_acceso(
  periodo_filtro text default null,
  alcaldia_nombre_filtro text default null
)
returns table (
  periodo text,
  fecha_corte date,
  alcaldia_nombre text,
  tiempo_promedio_min numeric,
  modo_transporte text,
  fuente text,
  observaciones text
)
language sql
stable
security invoker
set search_path to 'public'
as $$
  select
    s.periodo,
    s.fecha_corte,
    a.nombre as alcaldia_nombre,
    m.tiempo_promedio_min,
    m.modo_transporte,
    m.fuente,
    m.observaciones
  from public.movilidad_acceso m
  join public.actualizaciones_semestrales s on s.id = m.actualizacion_id
  join public.alcaldias a on a.id = m.alcaldia_id
  where (periodo_filtro is null or btrim(periodo_filtro) = '' or s.periodo = btrim(periodo_filtro))
    and (
      alcaldia_nombre_filtro is null
      or btrim(alcaldia_nombre_filtro) = ''
      or a.nombre = btrim(alcaldia_nombre_filtro)
    )
  order by s.fecha_corte desc nulls last, a.nombre collate "C", m.modo_transporte nulls last;
$$;

comment on function public.listar_movilidad_acceso(text, text) is
  'Filas de movilidad_acceso con periodo y alcaldía; consumo PostgREST/RPC desde web y móvil.';

grant execute on function public.listar_movilidad_acceso(text, text) to anon, authenticated;
