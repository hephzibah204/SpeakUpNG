begin;

alter table if exists public.news_sources add column if not exists allow_full_text boolean not null default false;
alter table if exists public.news_sources add column if not exists allow_images boolean not null default true;
alter table if exists public.news_sources add column if not exists max_fetch_kb int not null default 512;

alter table if exists public.news_items add column if not exists image_url text;
alter table if exists public.news_items add column if not exists image_alt text;
alter table if exists public.news_items add column if not exists author text;
alter table if exists public.news_items add column if not exists site_name text;
alter table if exists public.news_items add column if not exists content_text text;
alter table if exists public.news_items add column if not exists content_html text;
alter table if exists public.news_items add column if not exists content_extracted_at timestamptz;

create index if not exists idx_news_items_content_extracted_at on public.news_items(content_extracted_at desc);

commit;
