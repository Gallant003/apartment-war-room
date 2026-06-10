-- Apartment War Room activity log
-- Run this after the main schema. It records future inserts, updates, and deletes.

create table if not exists public.apartment_activity (
  id uuid primary key default gen_random_uuid(),
  apartment_id uuid,
  apartment_name text,
  action text not null check (action in ('insert', 'update', 'delete')),
  changed_by text default lower(auth.jwt() ->> 'email'),
  changed_at timestamptz not null default now(),
  old_row jsonb,
  new_row jsonb
);

alter table public.apartment_activity enable row level security;

drop policy if exists "Allowed users can read apartment activity" on public.apartment_activity;

create policy "Allowed users can read apartment activity"
on public.apartment_activity
for select
to authenticated
using (
  lower(auth.jwt() ->> 'email') in (
    'stephengallant3919@gmail.com',
    'buckles-39wheels@icloud.com'
  )
);

grant select on public.apartment_activity to authenticated;

create or replace function public.log_apartment_activity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.apartment_activity (apartment_id, apartment_name, action, changed_by, new_row)
    values (new.id, new.name, 'insert', lower(auth.jwt() ->> 'email'), to_jsonb(new));
    return new;
  elsif tg_op = 'UPDATE' then
    insert into public.apartment_activity (apartment_id, apartment_name, action, changed_by, old_row, new_row)
    values (new.id, new.name, 'update', lower(auth.jwt() ->> 'email'), to_jsonb(old), to_jsonb(new));
    return new;
  elsif tg_op = 'DELETE' then
    insert into public.apartment_activity (apartment_id, apartment_name, action, changed_by, old_row)
    values (old.id, old.name, 'delete', lower(auth.jwt() ->> 'email'), to_jsonb(old));
    return old;
  end if;

  return null;
end;
$$;

drop trigger if exists apartments_activity_log on public.apartments;

create trigger apartments_activity_log
after insert or update or delete on public.apartments
for each row
execute function public.log_apartment_activity();
