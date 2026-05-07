begin;

alter table if exists public.politicians add column if not exists profile_bio text;
alter table if exists public.politicians add column if not exists bio_source text;
alter table if exists public.politicians add column if not exists bio_updated_at timestamptz;

create index if not exists idx_politicians_profile_bio_len on public.politicians ((length(coalesce(profile_bio,''))));

commit;
