-- Recomendaciones de política pública (catálogo editorial + métricas derivadas en app).

create table if not exists public.politicas_recomendaciones (
  id text primary key,
  objetivo_id text not null
    check (objetivo_id in ('genero', 'periferias', 'digitalizacion', 'economia')),
  titulo text not null,
  prioridad text not null
    check (prioridad in ('Prioridad Alta', 'Prioridad Media', 'Prioridad Baja')),
  costo_nivel smallint not null check (costo_nivel between 1 and 3),
  alcaldia text not null,
  descripcion text not null,
  impacto text not null,
  impacto_ciudadanos integer check (impacto_ciudadanos is null or impacto_ciudadanos >= 0),
  presupuesto_mxn bigint check (presupuesto_mxn is null or presupuesto_mxn >= 0),
  orden int not null default 0,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists politicas_recomendaciones_objetivo_idx
  on public.politicas_recomendaciones (objetivo_id, orden asc);

alter table public.politicas_recomendaciones enable row level security;

drop policy if exists "politicas_recomendaciones_select_public" on public.politicas_recomendaciones;
create policy "politicas_recomendaciones_select_public"
  on public.politicas_recomendaciones
  for select
  to anon, authenticated
  using (activo = true);

insert into public.politicas_recomendaciones (
  id, objetivo_id, titulo, prioridad, costo_nivel, alcaldia, descripcion, impacto,
  impacto_ciudadanos, presupuesto_mxn, orden
) values
  (
    'g1', 'genero',
    'Centros de Producción Audiovisual Feminista',
    'Prioridad Alta', 2, 'Iztapalapa',
    'Instalación de laboratorios de edición y producción exclusivos para mujeres en Iztapalapa y Gustavo A. Madero.',
    '+25% participación profesional', 28500, 9000000, 10
  ),
  (
    'g2', 'genero',
    'Becas de Formación en Gestión Cultural',
    'Prioridad Media', 1, 'Álvaro Obregón',
    'Programa de formación para mujeres líderes de centros comunitarios en gestión y procuración de fondos.',
    '60 nuevas gestoras certificadas', 6000, 4500000, 20
  ),
  (
    'p1', 'periferias',
    'Corredores Culturales Itinerantes',
    'Prioridad Alta', 1, 'Milpa Alta',
    'Módulos móviles de exhibición artística para zonas de baja densidad de museos en Milpa Alta y Tláhuac.',
    'Acceso a 45,000 nuevos usuarios', 45000, 4500000, 10
  ),
  (
    'p2', 'periferias',
    'Rehabilitación de Plazas Públicas para Cine',
    'Prioridad Baja', 2, 'Tlalpan',
    'Equipamiento de plazas públicas con sistemas de proyección solar para funciones nocturnas permanentes.',
    'Mejora de seguridad ciudadana', 22000, 9000000, 20
  ),
  (
    'd1', 'digitalizacion',
    'Red de Bibliotecas Digitales de Barrio',
    'Prioridad Media', 2, 'Xochimilco',
    'Actualización tecnológica de bibliotecas comunitarias con acceso a repositorios digitales de arte internacional.',
    'Cierre de brecha digital en 12%', 31200, 9000000, 10
  ),
  (
    'e1', 'economia',
    'Subsidio a Micro-Emprendimientos de Artesanía',
    'Prioridad Alta', 3, 'Cuauhtémoc',
    'Programa de créditos a tasa cero para artesanos tradicionales para la exportación y venta online.',
    '+40% ingresos locales', 18500, 13500000, 10
  )
on conflict (id) do update set
  objetivo_id = excluded.objetivo_id,
  titulo = excluded.titulo,
  prioridad = excluded.prioridad,
  costo_nivel = excluded.costo_nivel,
  alcaldia = excluded.alcaldia,
  descripcion = excluded.descripcion,
  impacto = excluded.impacto,
  impacto_ciudadanos = excluded.impacto_ciudadanos,
  presupuesto_mxn = excluded.presupuesto_mxn,
  orden = excluded.orden,
  activo = true,
  updated_at = now();
