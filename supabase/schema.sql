-- Apartment War Room MVP schema
-- Replace STEPHANIE_EMAIL_HERE before running.

create extension if not exists "pgcrypto";

create table if not exists public.apartments (
  id uuid primary key default gen_random_uuid(),

  name text not null,
  area text,
  address text,
  price integer,
  bedrooms numeric,
  bathrooms numeric,
  sqft integer,

  tier text,
  status text not null default 'To Call',
  score numeric,

  notes text,
  verify text,

  image_url text,
  source_url text,
  mls_number text,

  is_crossed_off boolean not null default false,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint apartments_status_check check (
    status in (
      'To Call',
      'Contacted',
      'Tour Scheduled',
      'Toured',
      'Rejected',
      'Finalist',
      'Crossed Off'
    )
  )
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists apartments_set_updated_at on public.apartments;

create trigger apartments_set_updated_at
before update on public.apartments
for each row
execute function public.set_updated_at();

alter table public.apartments enable row level security;

create policy "Allowed users can read apartments"
on public.apartments
for select
to authenticated
using (
  lower(auth.jwt() ->> 'email') in (
    'stephengallant3919@gmail.com',
    'STEPHANIE_EMAIL_HERE'
  )
);

create policy "Allowed users can insert apartments"
on public.apartments
for insert
to authenticated
with check (
  lower(auth.jwt() ->> 'email') in (
    'stephengallant3919@gmail.com',
    'STEPHANIE_EMAIL_HERE'
  )
);

create policy "Allowed users can update apartments"
on public.apartments
for update
to authenticated
using (
  lower(auth.jwt() ->> 'email') in (
    'stephengallant3919@gmail.com',
    'STEPHANIE_EMAIL_HERE'
  )
)
with check (
  lower(auth.jwt() ->> 'email') in (
    'stephengallant3919@gmail.com',
    'STEPHANIE_EMAIL_HERE'
  )
);

create policy "Allowed users can delete apartments"
on public.apartments
for delete
to authenticated
using (
  lower(auth.jwt() ->> 'email') in (
    'stephengallant3919@gmail.com',
    'STEPHANIE_EMAIL_HERE'
  )
);

insert into storage.buckets (id, name, public)
values ('listing-images', 'listing-images', true)
on conflict (id) do update set public = true;

create policy "Allowed users can upload listing images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'listing-images'
  and lower(auth.jwt() ->> 'email') in (
    'stephengallant3919@gmail.com',
    'STEPHANIE_EMAIL_HERE'
  )
);

create policy "Allowed users can update listing images"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'listing-images'
  and lower(auth.jwt() ->> 'email') in (
    'stephengallant3919@gmail.com',
    'STEPHANIE_EMAIL_HERE'
  )
)
with check (
  bucket_id = 'listing-images'
  and lower(auth.jwt() ->> 'email') in (
    'stephengallant3919@gmail.com',
    'STEPHANIE_EMAIL_HERE'
  )
);

create policy "Allowed users can delete listing images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'listing-images'
  and lower(auth.jwt() ->> 'email') in (
    'stephengallant3919@gmail.com',
    'STEPHANIE_EMAIL_HERE'
  )
);
