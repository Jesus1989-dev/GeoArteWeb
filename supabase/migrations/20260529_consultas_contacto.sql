-- Buzón de consultas institucional (página Contacto).

create table if not exists public.consultas_contacto (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  email text not null,
  asunto text not null,
  mensaje text not null,
  estado text not null default 'nuevo'
    check (estado in ('nuevo', 'en_revision', 'respondido', 'archivado')),
  created_at timestamptz not null default now()
);

create index if not exists consultas_contacto_created_at_idx
  on public.consultas_contacto (created_at desc);

alter table public.consultas_contacto enable row level security;

-- Lectura reservada a usuarios con rol Autoridad (gestión futura en admin).
drop policy if exists "consultas_contacto_select_autoridad" on public.consultas_contacto;
create policy "consultas_contacto_select_autoridad"
  on public.consultas_contacto
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.rol = 'Autoridad'
    )
  );

-- Inserciones solo vía service role en el servidor (server action).
