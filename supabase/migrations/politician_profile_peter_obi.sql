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
  aspiring_for = 'President of Nigeria (2027)',
  previous_offices = 'Governor of Anambra State (2006–2014)\nVice Presidential Candidate (2019)\nPresidential Candidate (2023)',
  wiki_title = coalesce(nullif(wiki_title, ''), 'Peter Obi'),
  wiki_url = coalesce(nullif(wiki_url, ''), 'https://en.wikipedia.org/wiki/Peter_Obi'),
  bio = 'Peter Gregory Obi is a Nigerian politician and businessman best known as a former Governor of Anambra State (2006–2014) and a recent presidential contender. He has held senior roles in private-sector organisations and has remained a prominent voice in Nigeria\'s public policy debates, often focusing on governance, fiscal discipline, and human development outcomes.',
  profile_bio = 'Peter Gregory Obi is a Nigerian politician and businessman, widely known as a former Governor of Anambra State (2006–2014) and for contesting Nigeria\'s presidency in recent election cycles. Before entering partisan politics at the national level, he built a career in the private sector, holding leadership and board roles across multiple organisations.\n\nObi rose to broader public prominence through his tenure as governor, where his public messaging frequently emphasised budgeting discipline, administrative reform, and investment in education and health. Supporters cite these themes as the foundation of his political brand, while critics debate the scale and durability of outcomes.\n\nIn national politics, he has been associated with reform-oriented campaigns and has attracted significant support among urban voters and younger citizens seeking stronger accountability and better service delivery. He has also remained active in civic discussions about economic management, security challenges, corruption prevention, and institutional performance.\n\nOn evote.ng, this profile focuses on three things: (1) the public offices he has held, (2) the office he is aspiring for, and (3) the promises/mandate items he or his campaign publishes. Citizens can rate his performance based on past roles and assess mandate progress where specific promises are available.\n\nNote: Biographical summaries are compiled from multiple sources and may be updated as new verified information becomes available.',
  bio_source = 'editorial_seed',
  bio_updated_at = now(),
  source_urls = (
    case
      when jsonb_typeof(source_urls) = 'array' and jsonb_array_length(source_urls) > 0 then source_urls
      else '["https://en.wikipedia.org/wiki/Peter_Obi"]'::jsonb
    end
  ),
  updated_at = now()
where lower(full_name) = lower('Peter Gregory Obi')
   or lower(common_name) = lower('Peter Obi');

alter table if exists public.official_promises add column if not exists politician_id uuid references public.politicians(id) on delete cascade;

insert into public.official_promises (
  politician_id,
  official_id,
  promise_title,
  promise_detail,
  promise_source,
  promise_category,
  status,
  progress_percent,
  verified_by,
  last_updated
)
select
  p.id,
  null,
  v.promise_title,
  v.promise_detail,
  'Template',
  v.promise_category,
  'pending',
  0,
  'template',
  now()
from public.politicians p
cross join (
  values
    ('Improve national security and public safety', 'Reduce violence and strengthen safety outcomes through improved coordination, capacity, and accountability.', 'security'),
    ('Reduce cost of living and inflation pressures', 'Stabilize prices and improve household purchasing power through practical economic policy and governance reforms.', 'economy'),
    ('Strengthen transparency and anti-corruption enforcement', 'Improve institutional oversight and reduce waste through clear standards, audits, and enforcement.', 'governance'),
    ('Improve education and human development outcomes', 'Increase access and improve quality across basic and tertiary education, with measurable outcomes.', 'policy'),
    ('Improve healthcare access and outcomes', 'Strengthen primary healthcare systems and improve access to essential services, with measurable outcomes.', 'policy')
) as v(promise_title, promise_detail, promise_category)
where (lower(p.full_name) = lower('Peter Gregory Obi') or lower(p.common_name) = lower('Peter Obi'))
  and not exists (select 1 from public.official_promises x where x.politician_id = p.id);

commit;
