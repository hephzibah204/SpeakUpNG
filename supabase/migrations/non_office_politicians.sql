begin;

create extension if not exists pgcrypto;

create table if not exists public.politicians (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  common_name text null,
  party text not null,
  aspiration_title text null,
  bio text null,
  photo_url text null,
  aliases jsonb not null default '[]'::jsonb,
  social_links jsonb not null default '{}'::jsonb,
  priority int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_politicians_active_priority on public.politicians(is_active, priority desc, created_at desc);
create index if not exists idx_politicians_party_priority on public.politicians(party, is_active, priority desc);
create index if not exists idx_politicians_name on public.politicians(lower(full_name));

create or replace function public.trg_set_updated_at_politicians()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists set_updated_at_politicians on public.politicians;
create trigger set_updated_at_politicians
before update on public.politicians
for each row execute function public.trg_set_updated_at_politicians();

alter table public.politicians enable row level security;

drop policy if exists politicians_public_read on public.politicians;
create policy politicians_public_read on public.politicians
for select to anon
using (is_active = true);

drop policy if exists politicians_auth_read on public.politicians;
create policy politicians_auth_read on public.politicians
for select to authenticated
using (true);

grant select on public.politicians to anon, authenticated;
revoke insert, update, delete on public.politicians from authenticated;

insert into public.politicians(full_name, common_name, party, aspiration_title, bio, photo_url, aliases, social_links, priority, is_active)
values
  (
    'Peter Gregory Obi',
    'Peter Obi',
    'LP',
    'Presidential Aspirant',
    'Prominent Nigerian politician and former Governor of Anambra State.',
    null,
    '["Peter Obi","Mr Peter Obi","H.E. Peter Obi"]'::jsonb,
    '{}'::jsonb,
    100,
    true
  ),
  (
    'Rabiu Musa Kwankwaso',
    'Kwankwaso',
    'NNPP',
    'Presidential Aspirant',
    'Prominent Nigerian politician and former Governor of Kano State.',
    null,
    '["Rabiu Kwankwaso","R. M. Kwankwaso","Senator Kwankwaso"]'::jsonb,
    '{}'::jsonb,
    90,
    true
  )
on conflict (id) do nothing;

commit;

