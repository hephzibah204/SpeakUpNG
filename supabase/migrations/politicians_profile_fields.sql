begin;

alter table if exists public.politicians add column if not exists aspiring_for text;
alter table if exists public.politicians add column if not exists previous_offices text;
alter table if exists public.politicians add column if not exists wiki_title text;
alter table if exists public.politicians add column if not exists wiki_url text;

create index if not exists idx_politicians_common_name_ci on public.politicians (lower(common_name));
create index if not exists idx_politicians_party_active on public.politicians (party, is_active, priority desc);

commit;
