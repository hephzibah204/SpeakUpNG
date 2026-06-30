begin;

create table if not exists public.politician_ratings (
  id uuid primary key default gen_random_uuid(),
  politician_id uuid not null references public.politicians(id) on delete cascade,
  user_id uuid references auth.users(id),
  device_hash text not null,
  anon_id text,

  overall numeric not null check (overall >= 0 and overall <= 5),

  accountability int check (accountability between 1 and 5),
  service int check (service between 1 and 5),
  transparency int check (transparency between 1 and 5),
  responsiveness int check (responsiveness between 1 and 5),
  power int check (power between 1 and 5),
  security int check (security between 1 and 5),
  economic_stability int check (economic_stability between 1 and 5),
  education int check (education between 1 and 5),
  healthcare int check (healthcare between 1 and 5),

  review_text text,
  created_at timestamptz not null default now()
);

create index if not exists idx_politician_ratings_politician_id_created_at on public.politician_ratings(politician_id, created_at desc);
create unique index if not exists uq_politician_ratings_device on public.politician_ratings(politician_id, device_hash);
create unique index if not exists uq_politician_ratings_user on public.politician_ratings(politician_id, user_id) where user_id is not null;

alter table public.politician_ratings enable row level security;

drop policy if exists politician_ratings_public_read on public.politician_ratings;
create policy politician_ratings_public_read on public.politician_ratings
for select to anon, authenticated
using (true);

drop policy if exists politician_ratings_public_insert on public.politician_ratings;
create policy politician_ratings_public_insert on public.politician_ratings
for insert to anon, authenticated
with check (
  politician_id is not null
  and device_hash is not null
  and length(device_hash) >= 16
  and overall between 0 and 5
  and (review_text is null or length(review_text) <= 1200)
  and (user_id is null or user_id = auth.uid())
);

grant select on public.politician_ratings to anon, authenticated;
grant insert on public.politician_ratings to anon, authenticated;

create or replace view public.politician_rating_agg as
select
  politician_id,
  count(*) as rating_count,
  round(avg(overall), 2) as rating_avg,
  round(avg(accountability), 2) as accountability_avg,
  round(avg(service), 2) as service_avg,
  round(avg(transparency), 2) as transparency_avg,
  round(avg(responsiveness), 2) as responsiveness_avg,
  round(avg(power), 2) as power_avg,
  round(avg(security), 2) as security_avg,
  round(avg(economic_stability), 2) as economic_stability_avg,
  round(avg(education), 2) as education_avg,
  round(avg(healthcare), 2) as healthcare_avg
from public.politician_ratings
group by politician_id;

grant select on public.politician_rating_agg to anon, authenticated;

commit;
