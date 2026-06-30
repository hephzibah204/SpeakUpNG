begin;

alter table public.officials add column if not exists date_of_birth date;
alter table public.officials add column if not exists state_of_origin text;
alter table public.officials add column if not exists lga_of_origin text;
alter table public.officials add column if not exists religion text;
alter table public.officials add column if not exists marital_status text;
alter table public.officials add column if not exists education_summary text;
alter table public.officials add column if not exists profile_bio text;
alter table public.officials add column if not exists profile_generated boolean default false;
alter table public.officials add column if not exists profile_verified boolean default false;
alter table public.officials add column if not exists profile_updated_at timestamptz default now();

create table if not exists public.official_career_history (
  id uuid primary key default gen_random_uuid(),
  official_id uuid references public.officials(id) on delete cascade,
  role_title text not null,
  organisation text,
  start_year int,
  end_year int,
  is_current boolean default false,
  category text check (category in ('political','professional','military','academic','other'))
);

create table if not exists public.official_education (
  id uuid primary key default gen_random_uuid(),
  official_id uuid references public.officials(id) on delete cascade,
  institution text,
  degree text,
  field text,
  year int
);

create table if not exists public.official_achievements (
  id uuid primary key default gen_random_uuid(),
  official_id uuid references public.officials(id) on delete cascade,
  title text not null,
  description text,
  year int,
  category text,
  evidence_url text,
  verified boolean default false
);

alter table public.official_career_history enable row level security;
alter table public.official_education enable row level security;
alter table public.official_achievements enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='official_career_history' and policyname='public_read') then
    create policy public_read on public.official_career_history for select to anon, authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='official_career_history' and policyname='auth_write') then
    create policy auth_write on public.official_career_history for all to authenticated using (true) with check (true);
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='official_education' and policyname='public_read') then
    create policy public_read on public.official_education for select to anon, authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='official_education' and policyname='auth_write') then
    create policy auth_write on public.official_education for all to authenticated using (true) with check (true);
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='official_achievements' and policyname='public_read') then
    create policy public_read on public.official_achievements for select to anon, authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='official_achievements' and policyname='auth_write') then
    create policy auth_write on public.official_achievements for all to authenticated using (true) with check (true);
  end if;
end $$;

commit;
