-- Configuración editorial de la página /politicas (hero, filtros, CTA).

create table if not exists public.politicas_centro_config (
  id text primary key default 'default',
  hero_badge text not null,
  hero_titulo_linea1 text not null,
  hero_titulo_linea2 text not null,
  hero_descripcion text not null,
  cta_titulo text not null,
  cta_descripcion text not null,
  cta_boton text not null,
  cta_href text not null default '/reportes?plantilla=p1',
  filtros_objetivo jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.politicas_centro_config enable row level security;

drop policy if exists "politicas_centro_config_select_public" on public.politicas_centro_config;
create policy "politicas_centro_config_select_public"
  on public.politicas_centro_config
  for select
  to anon, authenticated
  using (true);

insert into public.politicas_centro_config (
  id,
  hero_badge,
  hero_titulo_linea1,
  hero_titulo_linea2,
  hero_descripcion,
  cta_titulo,
  cta_descripcion,
  cta_boton,
  cta_href,
  filtros_objetivo
) values (
  'default',
  'Fase de Implementación · corte {anio}',
  'Recomendaciones de',
  'Política Pública',
  'Diagnósticos basados en datos georreferenciados para orientar la inversión cultural hacia las zonas con mayor rezago social y brechas de género en la Ciudad de México.',
  '¿Necesitas una propuesta personalizada?',
  'Utiliza nuestro generador de reportes basado en alcaldías para obtener un diagnóstico específico de tu demarcación y las intervenciones recomendadas por nuestro equipo de expertos.',
  'Generar Reporte por Alcaldía',
  '/reportes?plantilla=p1',
  '[
    {"id":"todos","label":"Todos"},
    {"id":"genero","label":"Cerrar brecha de género"},
    {"id":"periferias","label":"Infraestructura en Periferias"},
    {"id":"digitalizacion","label":"Digitalización"},
    {"id":"economia","label":"Economía Creativa"}
  ]'::jsonb
)
on conflict (id) do update set
  hero_badge = excluded.hero_badge,
  hero_titulo_linea1 = excluded.hero_titulo_linea1,
  hero_titulo_linea2 = excluded.hero_titulo_linea2,
  hero_descripcion = excluded.hero_descripcion,
  cta_titulo = excluded.cta_titulo,
  cta_descripcion = excluded.cta_descripcion,
  cta_boton = excluded.cta_boton,
  cta_href = excluded.cta_href,
  filtros_objetivo = excluded.filtros_objetivo,
  updated_at = now();
