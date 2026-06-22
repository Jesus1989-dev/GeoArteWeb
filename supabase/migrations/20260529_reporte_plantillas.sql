-- Catálogo de plantillas del Centro de reportes + texto de ayuda.

create table if not exists public.reporte_plantillas (
  id text primary key,
  titulo text not null,
  descripcion text not null,
  categoria text not null,
  formatos text[] not null,
  filtros_default jsonb not null default '{}'::jsonb,
  orden int not null default 0,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reporte_plantillas_formatos_check check (
    formatos <@ array['PDF', 'CSV', 'XLSX']::text[]
    and cardinality(formatos) > 0
  )
);

create index if not exists reporte_plantillas_orden_idx
  on public.reporte_plantillas (orden asc);

create table if not exists public.reportes_centro_config (
  id text primary key default 'default',
  ayuda_texto text not null,
  ayuda_enlace_label text not null,
  ayuda_enlace_href text not null default '/perfil',
  updated_at timestamptz not null default now()
);

alter table public.reporte_plantillas enable row level security;
alter table public.reportes_centro_config enable row level security;

drop policy if exists "reporte_plantillas_select_public" on public.reporte_plantillas;
create policy "reporte_plantillas_select_public"
  on public.reporte_plantillas
  for select
  to anon, authenticated
  using (activo = true);

drop policy if exists "reportes_centro_config_select_public" on public.reportes_centro_config;
create policy "reportes_centro_config_select_public"
  on public.reportes_centro_config
  for select
  to anon, authenticated
  using (true);

insert into public.reporte_plantillas (
  id, titulo, descripcion, categoria, formatos, filtros_default, orden
) values
  (
    'p1',
    'Diagnóstico Territorial',
    'Brechas y cobertura por demarcación',
    'Diagnóstico Territorial',
    array['PDF', 'XLSX', 'CSV'],
    '{"alcaldia":{"pick":"first_after_todos"},"disciplina":"Todas","periodo":{"pick":"first"},"nse":"Todos","edad":"Todos","genero":"Todos"}'::jsonb,
    1
  ),
  (
    'p2',
    'Impacto Social',
    'Participación por género, NSE y edad',
    'Impacto Social',
    array['PDF', 'CSV', 'XLSX'],
    '{"alcaldia":"Todas","disciplina":"Todas","periodo":{"pick":"first"},"nse":{"pick":"first_after_todos"},"edad":{"pick":"first_after_todos"},"genero":"Todos"}'::jsonb,
    2
  ),
  (
    'p3',
    'Resumen Ejecutivo',
    'Panorama CDMX para autoridades',
    'Resumen Ejecutivo',
    array['PDF', 'XLSX'],
    '{"alcaldia":"Todas","disciplina":"Todas","periodo":{"pick":"first"},"nse":"Todos","edad":"Todos","genero":"Todos"}'::jsonb,
    3
  )
on conflict (id) do update set
  titulo = excluded.titulo,
  descripcion = excluded.descripcion,
  categoria = excluded.categoria,
  formatos = excluded.formatos,
  filtros_default = excluded.filtros_default,
  orden = excluded.orden,
  activo = true,
  updated_at = now();

insert into public.reportes_centro_config (
  id, ayuda_texto, ayuda_enlace_label, ayuda_enlace_href
) values (
  'default',
  'Genera informes PDF, CSV o Excel con filtros propios. Cada exportación se guarda en tu historial y puedes volver a descargarla cuando quieras.',
  'Ver historial en Mi perfil',
  '/perfil'
)
on conflict (id) do update set
  ayuda_texto = excluded.ayuda_texto,
  ayuda_enlace_label = excluded.ayuda_enlace_label,
  ayuda_enlace_href = excluded.ayuda_enlace_href,
  updated_at = now();
