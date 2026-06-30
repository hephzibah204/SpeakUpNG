begin;

alter table if exists public.news_items add column if not exists categories jsonb;
alter table if exists public.news_items add column if not exists is_politics boolean not null default false;
alter table if exists public.news_items add column if not exists matched_profiles jsonb;

create index if not exists idx_news_items_is_politics on public.news_items(is_politics);
create index if not exists idx_news_items_published_at on public.news_items(published_at desc);

grant select on public.news_items to anon, authenticated;
grant select on public.news_sources to anon, authenticated;
grant select on public.news_profile_matches to anon, authenticated;

commit;
