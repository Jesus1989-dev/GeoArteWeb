-- Fase 5: registro de sincronizaciones de capas del mapa.

create table if not exists public.mapa_sync_log (
  id uuid primary key default gen_random_uuid(),
  accion text not null,
  filas_afectadas integer,
  mensaje text,
  ejecutado_en timestamptz not null default now()
);

create index if not exists mapa_sync_log_ejecutado_idx
  on public.mapa_sync_log (ejecutado_en desc);

comment on table public.mapa_sync_log is
  'Historial de sincronizaciones de métricas y capas territoriales del mapa.';

alter table public.mapa_sync_log enable row level security;

drop policy if exists "mapa_sync_log_select_authenticated" on public.mapa_sync_log;
create policy "mapa_sync_log_select_authenticated"
  on public.mapa_sync_log
  for select
  to authenticated
  using (true);

grant select on public.mapa_sync_log to authenticated;
grant insert on public.mapa_sync_log to service_role;

-- Permite ejecutar sync desde service role (admin API y scripts).
grant execute on function public.sync_metricas_alcaldia(integer) to service_role;
grant execute on function public.sync_macrozonas_desde_alcaldias() to service_role;
