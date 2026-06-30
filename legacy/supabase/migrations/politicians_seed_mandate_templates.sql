begin;

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
  t.promise_title,
  t.promise_detail,
  'Template',
  t.promise_category,
  'pending',
  0,
  'template',
  now()
from public.politicians p
join lateral (
  values
    ('Improve national security and public safety', 'Reduce violence and strengthen safety outcomes through improved coordination, capacity, and accountability.', 'security'),
    ('Reduce cost of living and inflation pressures', 'Stabilize prices and improve household purchasing power through practical economic policy and governance reforms.', 'economy'),
    ('Strengthen transparency and anti-corruption enforcement', 'Improve institutional oversight and reduce waste through clear standards, audits, and enforcement.', 'governance'),
    ('Improve education and human development outcomes', 'Increase access and improve quality across basic and tertiary education, with measurable outcomes.', 'policy'),
    ('Improve healthcare access and outcomes', 'Strengthen primary healthcare systems and improve access to essential services, with measurable outcomes.', 'policy')
) as t(promise_title, promise_detail, promise_category) on true
where p.is_active = true
  and (
    lower(coalesce(p.aspiring_for, p.aspiration_title, '')) like '%president%'
    or lower(coalesce(p.aspiring_for, p.aspiration_title, '')) like '%presidential%'
  )
  and not exists (select 1 from public.official_promises x where x.politician_id = p.id);

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
  t.promise_title,
  t.promise_detail,
  'Template',
  t.promise_category,
  'pending',
  0,
  'template',
  now()
from public.politicians p
join lateral (
  values
    ('Improve security and safety in the state', 'Strengthen public safety outcomes through coordination, capacity, and accountability.', 'security'),
    ('Fix and expand roads and transport', 'Improve critical transport corridors and reduce travel time with measurable milestones.', 'policy'),
    ('Improve primary healthcare services', 'Strengthen PHC services and access to essential care across communities.', 'policy'),
    ('Improve public education and schools', 'Increase access and improve learning outcomes through better resourcing and accountability.', 'policy'),
    ('Create jobs and support local businesses', 'Enable small business growth and job creation through practical reforms and investment.', 'economy'),
    ('Strengthen transparency and accountability', 'Reduce waste and improve trust through clear reporting and enforcement.', 'governance')
) as t(promise_title, promise_detail, promise_category) on true
where p.is_active = true
  and lower(coalesce(p.aspiring_for, p.aspiration_title, '')) like '%governor%'
  and not exists (select 1 from public.official_promises x where x.politician_id = p.id);

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
  t.promise_title,
  t.promise_detail,
  'Template',
  t.promise_category,
  'pending',
  0,
  'template',
  now()
from public.politicians p
join lateral (
  values
    ('Sponsor/support bills that improve governance', 'Support legislation that improves transparency, accountability, and institutional performance.', 'governance'),
    ('Ensure constituency engagement and transparency', 'Maintain regular constituency engagement and publish clear updates on activity and decisions.', 'governance'),
    ('Push policies that reduce unemployment', 'Support practical policy reforms that expand jobs and economic opportunities.', 'economy'),
    ('Support reforms that improve security', 'Support oversight and reforms that improve public safety outcomes.', 'security')
) as t(promise_title, promise_detail, promise_category) on true
where p.is_active = true
  and (
    lower(coalesce(p.aspiring_for, p.aspiration_title, '')) like '%senat%'
    or lower(coalesce(p.aspiring_for, p.aspiration_title, '')) like '%house%'
    or lower(coalesce(p.aspiring_for, p.aspiration_title, '')) like '%represent%'
  )
  and not exists (select 1 from public.official_promises x where x.politician_id = p.id);

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
  t.promise_title,
  t.promise_detail,
  'Template',
  t.promise_category,
  'pending',
  0,
  'template',
  now()
from public.politicians p
join lateral (
  values
    ('Improve transparency and accountability', 'Publish clear updates and reduce waste with measurable reporting.', 'governance'),
    ('Improve economic opportunities', 'Support practical reforms and investments that create jobs.', 'economy'),
    ('Improve security and safety', 'Support coordination and reforms that improve public safety outcomes.', 'security')
) as t(promise_title, promise_detail, promise_category) on true
where p.is_active = true
  and not exists (select 1 from public.official_promises x where x.politician_id = p.id);

commit;
