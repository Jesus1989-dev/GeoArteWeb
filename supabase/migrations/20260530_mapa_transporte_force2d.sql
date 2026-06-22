-- Acepta GeoJSON 3D (Z/M) en upsert de transporte; almacena geometría 2D.

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
    st_force2d(
      st_setsrid(st_geomfromgeojson(p_geojson -> 'geometry'), 4326)
    )
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
