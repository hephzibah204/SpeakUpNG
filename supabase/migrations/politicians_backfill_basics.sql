begin;

alter table if exists public.politicians add column if not exists aspiring_for text;
alter table if exists public.politicians add column if not exists previous_offices text;
alter table if exists public.politicians add column if not exists wiki_title text;
alter table if exists public.politicians add column if not exists wiki_url text;
alter table if exists public.politicians add column if not exists profile_bio text;
alter table if exists public.politicians add column if not exists bio_source text;
alter table if exists public.politicians add column if not exists bio_updated_at timestamptz;
alter table if exists public.politicians add column if not exists source_urls jsonb not null default '[]'::jsonb;
alter table if exists public.politicians add column if not exists source_notes text;

update public.politicians
set
  aspiring_for = coalesce(nullif(aspiring_for, ''), nullif(aspiration_title, '')),
  wiki_title = coalesce(nullif(wiki_title, ''), nullif(common_name, ''), full_name),
  wiki_url = coalesce(
    nullif(wiki_url, ''),
    'https://en.wikipedia.org/wiki/' || replace(coalesce(nullif(wiki_title, ''), nullif(common_name, ''), full_name), ' ', '_')
  ),
  source_urls = case
    when jsonb_typeof(source_urls) = 'array' and jsonb_array_length(source_urls) > 0 then source_urls
    else jsonb_build_array(
      'https://en.wikipedia.org/wiki/' || replace(coalesce(nullif(wiki_title, ''), nullif(common_name, ''), full_name), ' ', '_')
    )
  end,
  bio = coalesce(
    bio,
    left(
      coalesce(nullif(common_name, ''), full_name)
      || ' is a Nigerian politician and public figure. This profile will be expanded with verified biography details, photos, mandate promises, and news coverage.',
      1200
    )
  ),
  profile_bio = coalesce(
    nullif(profile_bio, ''),
    bio
  ),
  bio_source = coalesce(nullif(bio_source, ''), case when bio is not null then 'backfill' else null end),
  bio_updated_at = coalesce(bio_updated_at, now()),
  updated_at = now()
where is_active = true;

commit;
