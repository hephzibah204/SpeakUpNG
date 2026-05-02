begin;

create table if not exists public.device_review_locks (
  id uuid primary key default gen_random_uuid(),
  device_hash text not null,
  official_id uuid references public.officials(id) on delete cascade,
  state text,
  lga text,
  created_at timestamptz default now(),
  unique(device_hash, official_id)
);

alter table public.device_review_locks enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='device_review_locks' and policyname='auth_write') then
    create policy auth_write on public.device_review_locks for all to authenticated using (true) with check (true);
  end if;
end $$;

alter table if exists public.ratings add column if not exists device_hash text;
create unique index if not exists ratings_one_per_device_official on public.ratings(official_id, device_hash) where device_hash is not null;

commit;
