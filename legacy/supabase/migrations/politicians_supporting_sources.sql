begin;

alter table if exists public.politicians add column if not exists source_urls jsonb not null default '[]'::jsonb;
alter table if exists public.politicians add column if not exists source_notes text;

create index if not exists idx_politicians_source_urls_gin on public.politicians using gin (source_urls);

commit;
