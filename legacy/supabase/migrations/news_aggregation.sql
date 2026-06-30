create extension if not exists pgcrypto;

create table if not exists public.news_sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  home_url text not null,
  feed_url text not null,
  ingest_type text not null default 'rss',
  credibility_tier text not null default 'tier1',
  is_active boolean not null default true,
  refresh_minutes int not null default 15,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (feed_url)
);

create unique index if not exists uq_news_sources_feed_url_ci on public.news_sources (lower(feed_url));

create table if not exists public.news_items (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.news_sources(id) on delete restrict,
  title text not null,
  url text not null,
  published_at timestamptz null,
  lang text not null default 'en',
  content_hash text not null,
  raw_json jsonb not null default '{}'::jsonb,
  summary text null,
  sentiment_score numeric null,
  topic text null,
  moderation_status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (url)
);
create index if not exists idx_news_items_published on public.news_items(published_at desc);
create index if not exists idx_news_items_status on public.news_items(moderation_status, published_at desc);
create index if not exists idx_news_items_source on public.news_items(source_id, published_at desc);
create index if not exists idx_news_items_hash on public.news_items(content_hash);

create table if not exists public.news_profile_matches (
  id uuid primary key default gen_random_uuid(),
  profile_type text not null,
  profile_id uuid not null,
  news_item_id uuid not null references public.news_items(id) on delete cascade,
  confidence numeric not null default 0,
  method text not null default 'keyword',
  matched_terms jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  unique (profile_type, profile_id, news_item_id)
);
create index if not exists idx_news_profile_matches_profile on public.news_profile_matches(profile_type, profile_id, created_at desc);
create index if not exists idx_news_profile_matches_item on public.news_profile_matches(news_item_id);

create table if not exists public.news_duplicate_clusters (
  id uuid primary key default gen_random_uuid(),
  canonical_item_id uuid null references public.news_items(id) on delete set null,
  hash text not null,
  created_at timestamptz not null default now(),
  unique (hash)
);

create table if not exists public.news_item_clusters (
  news_item_id uuid not null references public.news_items(id) on delete cascade,
  cluster_id uuid not null references public.news_duplicate_clusters(id) on delete cascade,
  primary key (news_item_id, cluster_id)
);

create table if not exists public.news_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid null,
  action text not null,
  target_type text not null,
  target_id uuid null,
  reason text null,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists idx_news_audit_created on public.news_audit_log(created_at desc);
create index if not exists idx_news_audit_target on public.news_audit_log(target_type, target_id, created_at desc);

create or replace function trg_set_updated_at_news()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists set_updated_at_news_sources on public.news_sources;
create trigger set_updated_at_news_sources
before update on public.news_sources
for each row execute function trg_set_updated_at_news();

drop trigger if exists set_updated_at_news_items on public.news_items;
create trigger set_updated_at_news_items
before update on public.news_items
for each row execute function trg_set_updated_at_news();

alter table public.news_sources enable row level security;
alter table public.news_items enable row level security;
alter table public.news_profile_matches enable row level security;
alter table public.news_duplicate_clusters enable row level security;
alter table public.news_item_clusters enable row level security;
alter table public.news_audit_log enable row level security;

drop policy if exists news_sources_public_read on public.news_sources;
create policy news_sources_public_read on public.news_sources
for select to anon
using (is_active = true and credibility_tier <> 'blocked');

drop policy if exists news_sources_auth_read on public.news_sources;
create policy news_sources_auth_read on public.news_sources
for select to authenticated
using (true);

drop policy if exists news_items_public_read on public.news_items;
create policy news_items_public_read on public.news_items
for select to anon
using (moderation_status = 'approved');

drop policy if exists news_items_auth_read on public.news_items;
create policy news_items_auth_read on public.news_items
for select to authenticated
using (true);

drop policy if exists news_profile_matches_public_read on public.news_profile_matches;
create policy news_profile_matches_public_read on public.news_profile_matches
for select to anon
using (exists(select 1 from public.news_items ni where ni.id = news_item_id and ni.moderation_status = 'approved'));

drop policy if exists news_profile_matches_auth_read on public.news_profile_matches;
create policy news_profile_matches_auth_read on public.news_profile_matches
for select to authenticated
using (true);

drop policy if exists news_clusters_public_read on public.news_duplicate_clusters;
create policy news_clusters_public_read on public.news_duplicate_clusters
for select to anon
using (true);

drop policy if exists news_clusters_auth_read on public.news_duplicate_clusters;
create policy news_clusters_auth_read on public.news_duplicate_clusters
for select to authenticated
using (true);

drop policy if exists news_item_clusters_public_read on public.news_item_clusters;
create policy news_item_clusters_public_read on public.news_item_clusters
for select to anon
using (true);

drop policy if exists news_item_clusters_auth_read on public.news_item_clusters;
create policy news_item_clusters_auth_read on public.news_item_clusters
for select to authenticated
using (true);

drop policy if exists news_audit_auth_read on public.news_audit_log;
create policy news_audit_auth_read on public.news_audit_log
for select to authenticated
using (true);

revoke insert, update, delete on public.news_sources from authenticated;
revoke insert, update, delete on public.news_items from authenticated;
revoke insert, update, delete on public.news_profile_matches from authenticated;
revoke insert, update, delete on public.news_duplicate_clusters from authenticated;
revoke insert, update, delete on public.news_item_clusters from authenticated;
revoke insert, update, delete on public.news_audit_log from authenticated;

insert into public.news_sources(name, home_url, feed_url, ingest_type, credibility_tier, is_active, refresh_minutes)
select v.name, v.home_url, v.feed_url, v.ingest_type, v.credibility_tier, v.is_active, v.refresh_minutes
from (
  values
    ('BBC News', 'https://www.bbc.com', 'https://feeds.bbci.co.uk/news/rss.xml', 'rss', 'tier1', true, 15),
    ('Punch Newspapers', 'https://punchng.com', 'https://punchng.com/feed/', 'rss', 'tier2', true, 15),
    ('Vanguard', 'https://www.vanguardngr.com', 'https://www.vanguardngr.com/feed/', 'rss', 'tier2', true, 15),
    ('The Nation', 'https://thenationonlineng.net', 'https://thenationonlineng.net/feed/', 'rss', 'tier2', true, 15),
    ('Sahara Reporters', 'https://saharareporters.com', 'https://saharareporters.com/rss.xml', 'rss', 'tier2', true, 15)
) as v(name, home_url, feed_url, ingest_type, credibility_tier, is_active, refresh_minutes)
where not exists (
  select 1 from public.news_sources s where lower(s.feed_url) = lower(v.feed_url)
);
