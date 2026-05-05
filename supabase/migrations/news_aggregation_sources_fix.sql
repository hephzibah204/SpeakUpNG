begin;

insert into public.news_sources (name, home_url, feed_url, ingest_type, credibility_tier, is_active, refresh_minutes)
select 'TheCable', 'https://www.thecable.ng', 'https://www.thecable.ng/feed/', 'rss', 'tier2', true, 15
where not exists (select 1 from public.news_sources where lower(name) = 'thecable');

insert into public.news_sources (name, home_url, feed_url, ingest_type, credibility_tier, is_active, refresh_minutes)
select 'Latest Nigerian News', 'https://www.latestnigeriannews.com', 'https://www.latestnigeriannews.com/feed/allnews/rss.xml', 'rss', 'tier2', true, 15
where not exists (select 1 from public.news_sources where lower(name) = 'latest nigerian news');

commit;
