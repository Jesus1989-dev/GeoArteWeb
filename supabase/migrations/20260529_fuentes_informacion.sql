-- Catálogo de fuentes / datasets para la página Proyecto (y futuro Contacto).

create table if not exists public.fuentes_informacion (
  id uuid primary key default gen_random_uuid(),
  institucion text not null,
  dataset text not null,
  estado text not null,
  tipo_estado text not null default 'activo'
    check (tipo_estado in ('activo', 'estatico', 'api', 'procesado')),
  url_fuente text,
  ultima_sincronizacion timestamptz,
  orden int not null default 0,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (institucion, dataset)
);

create index if not exists fuentes_informacion_orden_idx
  on public.fuentes_informacion (orden asc);

alter table public.fuentes_informacion enable row level security;

drop policy if exists "fuentes_informacion_select_public" on public.fuentes_informacion;
create policy "fuentes_informacion_select_public"
  on public.fuentes_informacion
  for select
  to anon, authenticated
  using (activo = true);
