-- Repositorio cualitativo (entrevistas, encuestas, grupos focales).

create table if not exists public.recursos_cualitativos (
  id text primary key,
  tipo text not null
    check (tipo in ('entrevista', 'encuesta', 'grupo_focal')),
  fecha text not null,
  titulo text not null,
  alcaldia text not null,
  snippet text not null,
  verificado boolean not null default false,
  digitalizado boolean not null default true,
  investigador text not null default 'Equipo investigación',
  fecha_detalle text not null,
  resumen text not null,
  transcripcion jsonb not null default '[]'::jsonb,
  lat double precision,
  lng double precision,
  orden int not null default 0,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists recursos_cualitativos_orden_idx
  on public.recursos_cualitativos (orden asc, id asc);

alter table public.recursos_cualitativos enable row level security;

drop policy if exists "recursos_cualitativos_select_public" on public.recursos_cualitativos;
create policy "recursos_cualitativos_select_public"
  on public.recursos_cualitativos
  for select
  to anon, authenticated
  using (activo = true);

insert into public.recursos_cualitativos (
  id, tipo, fecha, titulo, alcaldia, snippet, verificado, digitalizado,
  investigador, fecha_detalle, resumen, transcripcion, lat, lng, orden
) values
  (
    'c1', 'entrevista', '12 may 2024',
    'Entrevista: gestor cultural — Iztapalapa', 'Iztapalapa',
    'Recuperación de espacios públicos a través del arte urbano y la participación vecinal…',
    true, true, 'María González', '12 may 2024 · 47 min',
    'La entrevista documenta estrategias de recuperación de espacios públicos mediante murales y talleres comunitarios, con énfasis en la coordinación con la alcaldía y presupuestos participativos.',
    '[
      {"rol":"Investigador","texto":"¿Cómo describirías el cambio en el uso del parque después del proyecto de arte urbano?"},
      {"rol":"Informante","texto":"Antes era un pasillo; ahora hay actividades los fines de semana y las familias se quedan más tiempo. Lo que más ayudó fue que la comunidad pintara junta con los artistas."},
      {"rol":"Investigador","texto":"¿Qué obstáculos siguen presentes desde tu punto de vista operativo?"},
      {"rol":"Informante","texto":"El mantenimiento y la seguridad nocturna; necesitamos convenios claros con la autoridad."}
    ]'::jsonb,
    19.3574, -99.0671, 10
  ),
  (
    'c2', 'encuesta', '03 abr 2024',
    'Encuesta de percepción cultural — Benito Juárez', 'Benito Juárez',
    'Muestra de 400 hogares sobre frecuencia de asistencia a eventos gratuitos…',
    true, true, 'Carlos Méndez', '03 abr 2024 · instrumento',
    'El 62% de los hogares encuestados asiste al menos una vez al mes a actividades culturales gratuitas; la barrera principal es horario y transporte.',
    '[
      {"rol":"Investigador","texto":"¿Con qué frecuencia asiste a eventos culturales gratuitos en su alcaldía?"},
      {"rol":"Informante","texto":"Una o dos veces al mes, sobre todo ferias de libro y conciertos en parques."}
    ]'::jsonb,
    19.3720, -99.1590, 20
  ),
  (
    'c3', 'grupo_focal', '22 mar 2024',
    'Grupo focal: juventudes y música', 'Coyoacán',
    'Tres sesiones con jóvenes de 18 a 25 años en torno a acceso a salas de ensayo…',
    false, true, 'Ana Ruiz', '22 mar 2024 · 3 sesiones',
    'Las y los participantes señalan escasez de salas de ensayo accesibles y costos elevados de alquiler como principal freno a proyectos musicales comunitarios.',
    '[
      {"rol":"Investigador","texto":"¿Qué necesitarían para sostener un colectivo musical en el barrio?"},
      {"rol":"Informante","texto":"Un espacio con horario fijo y equipo básico; muchos ensayamos en garages por falta de opciones."}
    ]'::jsonb,
    19.3467, -99.1618, 30
  ),
  (
    'c4', 'entrevista', '15 feb 2024',
    'Entrevista: directora de museo comunitario', 'Tláhuac',
    'Sostenibilidad financiera y relación con la alcaldía en proyectos de largo plazo…',
    true, false, 'Luis Herrera', '15 feb 2024 · 38 min',
    'La entrevista aborda modelos híbridos de financiamiento (donaciones, talleres pagados y apoyos municipales) para museos comunitarios de mediano plazo.',
    '[
      {"rol":"Investigador","texto":"¿Cómo equilibran autonomía curatorial y requisitos del programa municipal?"},
      {"rol":"Informante","texto":"Documentamos todo con indicadores claros; eso nos da libertad para proponer exposiciones temporales."}
    ]'::jsonb,
    19.2830, -99.0050, 40
  ),
  (
    'c5', 'encuesta', '08 ene 2024',
    'Encuesta rápida — Faros culturales', 'Varias',
    'Instrumento corto aplicado en 12 faros; resultados consolidados por zona…',
    false, true, 'Equipo Faros', '08 ene 2024 · 12 sedes',
    'Consolidado de percepción de programación en faros: alta valoración de talleres familiares y demanda de horarios vespertinos en zona oriente.',
    '[
      {"rol":"Investigador","texto":"¿Qué actividad del faro le resultó más útil en el último año?"},
      {"rol":"Informante","texto":"Los talleres para niñas y niños los sábados; nos gustaría que extendieran el horario hasta la noche."}
    ]'::jsonb,
    null, null, 50
  ),
  (
    'c6', 'entrevista', '29 may 2026',
    'Entrevista demo — coordinación cultural vecinal', 'Cuauhtémoc',
    'Recurso de demostración del repositorio GEO ARTE: participación comunitaria, presupuesto participativo y arte urbano en el centro histórico.',
    true, true, 'Equipo GEO ARTE CDMX', '29 may 2026 · 35 min · demo',
    'Entrevista de demostración del repositorio cualitativo. Documenta cómo vecinos y gestores culturales articularon un proyecto piloto de murales y talleres en espacios públicos del centro, con indicadores de asistencia y percepción de seguridad.',
    '[
      {"rol":"Investigador","texto":"¿Qué cambió en el uso del espacio después del proyecto piloto?"},
      {"rol":"Informante","texto":"Pasó de estar vacío entre semana a tener actividades familiares los fines de semana; la clave fue que la comunidad co-diseñara el programa con la alcaldía."},
      {"rol":"Investigador","texto":"¿Qué recomendaría replicar en otras demarcaciones?"},
      {"rol":"Informante","texto":"Convenios claros de mantenimiento y un calendario público de actividades; sin eso, el entusiasmo inicial se diluye."}
    ]'::jsonb,
    19.4338, -99.1332, 55
  )
on conflict (id) do nothing;
