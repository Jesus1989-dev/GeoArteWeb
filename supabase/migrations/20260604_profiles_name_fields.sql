-- Nombre y apellidos por separado en profiles (mantiene display_name para compatibilidad).

alter table public.profiles
  add column if not exists first_name text,
  add column if not exists last_name text;

comment on column public.profiles.first_name is 'Nombre(s) del usuario';
comment on column public.profiles.last_name is 'Apellidos del usuario';

-- Rellenar desde display_name existente.
update public.profiles
set
  first_name = split_part(trim(display_name), ' ', 1),
  last_name = case
    when strpos(trim(display_name), ' ') > 0 then
      trim(substring(trim(display_name) from strpos(trim(display_name), ' ') + 1))
    else null
  end
where coalesce(trim(display_name), '') <> ''
  and first_name is null;

-- Mantener display_name sincronizado al editar first_name / last_name.
create or replace function public.profiles_sync_display_name()
returns trigger
language plpgsql
as $$
begin
  new.display_name := trim(concat_ws(' ', nullif(trim(new.first_name), ''), nullif(trim(new.last_name), '')));
  if new.display_name = '' then
    new.display_name := null;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_sync_display_name_trigger on public.profiles;

create trigger profiles_sync_display_name_trigger
  before insert or update of first_name, last_name
  on public.profiles
  for each row
  execute function public.profiles_sync_display_name();
